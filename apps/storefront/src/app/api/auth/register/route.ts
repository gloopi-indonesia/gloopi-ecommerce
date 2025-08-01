import { signJWT } from '@/lib/jwt'
import prisma from '@/lib/prisma'
import { getErrorResponse } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().min(10, 'Nomor telepon tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  type: z.enum(['B2B', 'B2C']).default('B2C'),
  // Company information for B2B customers
  companyName: z.string().optional(),
  companyRegistrationNumber: z.string().optional(),
  companyTaxId: z.string().optional(),
  industry: z.enum(['MEDICAL', 'MANUFACTURING', 'FOOD', 'OTHER']).optional(),
  companyAddress: z.string().optional(),
  companyCity: z.string().optional(),
  companyProvince: z.string().optional(),
  companyPostalCode: z.string().optional(),
  contactPerson: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: data.email.toLowerCase() },
          { phone: data.phone },
        ],
      },
    })

    if (existingCustomer) {
      if (existingCustomer.email === data.email.toLowerCase()) {
        return getErrorResponse(409, 'Email sudah terdaftar')
      }
      if (existingCustomer.phone === data.phone) {
        return getErrorResponse(409, 'Nomor telepon sudah terdaftar')
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')

    let companyId: string | undefined

    // Create company if B2B customer
    if (data.type === 'B2B' && data.companyName) {
      // Check if company already exists
      const existingCompany = await prisma.company.findFirst({
        where: {
          OR: [
            { registrationNumber: data.companyRegistrationNumber || '' },
            { taxId: data.companyTaxId || '' },
          ],
        },
      })

      if (existingCompany) {
        return getErrorResponse(409, 'Perusahaan sudah terdaftar')
      }

      const company = await prisma.company.create({
        data: {
          name: data.companyName,
          registrationNumber: data.companyRegistrationNumber || '',
          taxId: data.companyTaxId || '',
          industry: data.industry || 'OTHER',
          address: data.companyAddress || '',
          city: data.companyCity || '',
          province: data.companyProvince || '',
          postalCode: data.companyPostalCode || '',
          contactPerson: data.contactPerson || data.name,
        },
      })

      companyId = company.id
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        phone: data.phone,
        password: hashedPassword,
        type: data.type,
        companyId,
        emailVerificationToken,
      },
      include: {
        company: true,
      },
    })

    // Generate JWT token
    const token = await signJWT(
      { sub: customer.id },
      { exp: '30d' }
    )

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Registrasi berhasil',
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        type: customer.type,
        isEmailVerified: customer.isEmailVerified,
        isPhoneVerified: customer.isPhoneVerified,
        company: customer.company ? {
          id: customer.company.id,
          name: customer.company.name,
          industry: customer.company.industry,
        } : null,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    response.cookies.set('logged-in', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error('Customer registration error:', error)
    
    if (error instanceof z.ZodError) {
      return getErrorResponse(400, error.errors[0].message)
    }

    return getErrorResponse(500, 'Terjadi kesalahan server')
  }
}