import prisma from '@/lib/prisma'
import { getErrorResponse } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('X-USER-ID')
    
    if (!userId) {
      return getErrorResponse(401, 'Unauthorized')
    }

    const customer = await prisma.customer.findUnique({
      where: { id: userId },
      include: {
        company: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    })

    if (!customer) {
      return getErrorResponse(404, 'Customer tidak ditemukan')
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        type: customer.type,
        isEmailVerified: customer.isEmailVerified,
        isPhoneVerified: customer.isPhoneVerified,
        taxInformation: customer.taxInformation,
        communicationPreferences: customer.communicationPreferences,
        company: customer.company ? {
          id: customer.company.id,
          name: customer.company.name,
          registrationNumber: customer.company.registrationNumber,
          taxId: customer.company.taxId,
          industry: customer.company.industry,
          email: customer.company.email,
          phone: customer.company.phone,
          website: customer.company.website,
          contactPerson: customer.company.contactPerson,
          address: customer.company.address,
          city: customer.company.city,
          province: customer.company.province,
          postalCode: customer.company.postalCode,
          country: customer.company.country,
        } : null,
        addresses: customer.addresses,
        createdAt: customer.createdAt,
      },
    })
  } catch (error) {
    console.error('Get customer error:', error)
    return getErrorResponse(500, 'Terjadi kesalahan server')
  }
}