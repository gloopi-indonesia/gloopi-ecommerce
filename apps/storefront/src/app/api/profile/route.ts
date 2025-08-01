import prisma from '@/lib/prisma'
import { getErrorResponse } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  phone: z.string().min(10, 'Nomor telepon tidak valid').optional(),
  taxInformation: z.any().optional(),
  communicationPreferences: z.any().optional(),
})

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('X-USER-ID')
    
    if (!userId) {
      return getErrorResponse(401, 'Unauthorized')
    }

    const body = await req.json()
    const data = updateProfileSchema.parse(body)

    // Check if phone number is already taken by another customer
    if (data.phone) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          phone: data.phone,
          id: { not: userId },
        },
      })

      if (existingCustomer) {
        return getErrorResponse(409, 'Nomor telepon sudah digunakan')
      }
    }

    // Update customer profile
    const updatedCustomer = await prisma.customer.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.taxInformation && { taxInformation: data.taxInformation }),
        ...(data.communicationPreferences && { communicationPreferences: data.communicationPreferences }),
      },
      include: {
        company: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      customer: {
        id: updatedCustomer.id,
        email: updatedCustomer.email,
        name: updatedCustomer.name,
        phone: updatedCustomer.phone,
        type: updatedCustomer.type,
        isEmailVerified: updatedCustomer.isEmailVerified,
        isPhoneVerified: updatedCustomer.isPhoneVerified,
        taxInformation: updatedCustomer.taxInformation,
        communicationPreferences: updatedCustomer.communicationPreferences,
        company: updatedCustomer.company,
        addresses: updatedCustomer.addresses,
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    
    if (error instanceof z.ZodError) {
      return getErrorResponse(400, error.errors[0].message)
    }

    return getErrorResponse(500, 'Terjadi kesalahan server')
  }
}