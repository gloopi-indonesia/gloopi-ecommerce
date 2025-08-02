import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

interface PORequestData {
  customerType: 'B2B' | 'B2C'
  name: string
  email: string
  phone: string
  companyName?: string
  companyRegistrationNumber?: string
  taxId?: string
  industry?: 'MEDICAL' | 'MANUFACTURING' | 'FOOD' | 'OTHER'
  needsShipping: boolean
  shippingAddress?: string
  shippingCity?: string
  shippingProvince?: string
  shippingPostalCode?: string
  notes?: string
  urgency: 'NORMAL' | 'URGENT' | 'VERY_URGENT'
  cartItems: Array<{
    productId: string
    quantity?: number
    count?: number
    product: any
  }>
}

function generateQuotationNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const timestamp = Date.now().toString().slice(-6)
  
  return `QUO-${year}${month}${day}-${timestamp}`
}

function calculateValidUntil(urgency: string): Date {
  const now = new Date()
  const validUntil = new Date(now)
  
  switch (urgency) {
    case 'VERY_URGENT':
      validUntil.setDate(now.getDate() + 1) // 1 day
      break
    case 'URGENT':
      validUntil.setDate(now.getDate() + 3) // 3 days
      break
    default:
      validUntil.setDate(now.getDate() + 7) // 7 days
  }
  
  return validUntil
}

export async function POST(request: NextRequest) {
  try {
    const data: PORequestData = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data.cartItems || data.cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Validate B2B requirements
    if (data.customerType === 'B2B' && !data.companyName) {
      return NextResponse.json(
        { error: 'Nama perusahaan wajib diisi untuk pelanggan B2B' },
        { status: 400 }
      )
    }

    // Validate shipping requirements
    if (data.needsShipping && (!data.shippingAddress || !data.shippingCity || !data.shippingProvince || !data.shippingPostalCode)) {
      return NextResponse.json(
        { error: 'Alamat pengiriman lengkap wajib diisi' },
        { status: 400 }
      )
    }

    // Check if user is authenticated
    const token = request.cookies.get('token')?.value
    let authenticatedCustomerId: string | null = null

    if (token) {
      try {
        const payload = await verifyJWT(token) as any
        if (payload && typeof payload.sub === 'string') {
          authenticatedCustomerId = payload.sub
        }
      } catch (_error) {
        // Token invalid, continue as guest
      }
    }

    // Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      let customerId: string
      let companyId: string | null = null

      // Handle customer creation/lookup
      if (authenticatedCustomerId) {
        // Use authenticated customer
        customerId = authenticatedCustomerId
        
        // Update customer information if needed
        await tx.customer.update({
          where: { id: customerId },
          data: {
            name: data.name,
            phone: data.phone,
            type: data.customerType,
          },
        })
      } else {
        // Check if customer exists by email or phone
        const existingCustomer = await tx.customer.findFirst({
          where: {
            OR: [
              { email: data.email },
              { phone: data.phone },
            ],
          },
        })

        if (existingCustomer) {
          customerId = existingCustomer.id
          
          // Update customer information
          await tx.customer.update({
            where: { id: customerId },
            data: {
              name: data.name,
              phone: data.phone,
              type: data.customerType,
            },
          })
        } else {
          // Create new customer
          const newCustomer = await tx.customer.create({
            data: {
              email: data.email,
              phone: data.phone,
              name: data.name,
              type: data.customerType,
              isEmailVerified: false,
              isPhoneVerified: false,
            },
          })
          customerId = newCustomer.id
        }
      }

      // Handle company creation for B2B customers
      if (data.customerType === 'B2B' && data.companyName) {
        // Check if company exists
        const existingCompany = await tx.company.findFirst({
          where: {
            OR: [
              { name: data.companyName },
              ...(data.companyRegistrationNumber ? [{ registrationNumber: data.companyRegistrationNumber }] : []),
              ...(data.taxId ? [{ taxId: data.taxId }] : []),
            ],
          },
        })

        if (existingCompany) {
          companyId = existingCompany.id
        } else {
          // Create new company
          const newCompany = await tx.company.create({
            data: {
              name: data.companyName,
              registrationNumber: data.companyRegistrationNumber || `REG-${Date.now()}`,
              taxId: data.taxId || `TAX-${Date.now()}`,
              industry: data.industry || 'OTHER',
              contactPerson: data.name,
              address: data.shippingAddress || '',
              city: data.shippingCity || '',
              province: data.shippingProvince || '',
              postalCode: data.shippingPostalCode || '',
            },
          })
          companyId = newCompany.id
        }

        // Link customer to company
        await tx.customer.update({
          where: { id: customerId },
          data: { companyId },
        })
      }

      // Create shipping address if needed
      let shippingAddressId: string | null = null
      if (data.needsShipping && data.shippingAddress) {
        const address = await tx.address.create({
          data: {
            customerId,
            label: 'Alamat Pengiriman',
            address: data.shippingAddress,
            city: data.shippingCity!,
            province: data.shippingProvince!,
            postalCode: data.shippingPostalCode!,
            isDefault: true,
          },
        })
        shippingAddressId = address.id
      }

      // Calculate totals
      let subtotal = 0
      const quotationItems = []

      for (const cartItem of data.cartItems) {
        const quantity = cartItem.quantity || cartItem.count || 0
        const product = await tx.product.findUnique({
          where: { id: cartItem.productId },
          include: { pricingTiers: true },
        })

        if (!product) {
          throw new Error(`Produk dengan ID ${cartItem.productId} tidak ditemukan`)
        }

        // Calculate price based on quantity (check pricing tiers)
        let unitPrice = product.basePrice
        
        if (product.pricingTiers.length > 0) {
          const applicableTier = product.pricingTiers
            .filter(tier => tier.isActive && quantity >= tier.minQuantity)
            .sort((a, b) => b.minQuantity - a.minQuantity)[0]
          
          if (applicableTier) {
            unitPrice = applicableTier.pricePerUnit
          }
        }

        const totalPrice = quantity * unitPrice
        subtotal += totalPrice

        quotationItems.push({
          productId: cartItem.productId,
          quantity,
          unitPrice,
          totalPrice,
        })
      }

      // Create quotation
      const quotation = await tx.quotation.create({
        data: {
          quotationNumber: generateQuotationNumber(),
          customerId,
          status: 'PENDING',
          subtotal,
          taxAmount: 0, // Will be calculated when converted to order
          totalAmount: subtotal,
          shippingAddressId,
          validUntil: calculateValidUntil(data.urgency),
          notes: data.notes,
          items: {
            create: quotationItems,
          },
        },
        include: {
          customer: {
            include: {
              company: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          shippingAddress: true,
        },
      })

      // Clear cart for authenticated users
      if (authenticatedCustomerId) {
        await tx.cartItem.deleteMany({
          where: { customerId: authenticatedCustomerId },
        })
      }

      return quotation
    })

    // TODO: Send email notification to customer
    // TODO: Send notification to admin about new quotation request

    return NextResponse.json({
      success: true,
      quotationId: result.id,
      quotationNumber: result.quotationNumber,
      message: 'Permintaan penawaran berhasil dikirim',
    })

  } catch (error) {
    console.error('Error creating quotation request:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}