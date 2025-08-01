import prisma from '@/lib/prisma'
import { getErrorResponse } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateCompanySchema = z.object({
  name: z.string().min(2, 'Nama perusahaan minimal 2 karakter').optional(),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  industry: z.enum(['MEDICAL', 'MANUFACTURING', 'FOOD', 'OTHER']).optional(),
  email: z.string().email('Email tidak valid').optional(),
  phone: z.string().optional(),
  website: z.string().url('Website tidak valid').optional(),
  contactPerson: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
})

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('X-USER-ID')
    
    if (!userId) {
      return getErrorResponse(401, 'Unauthorized')
    }

    const body = await req.json()
    const data = updateCompanySchema.parse(body)

    // Get customer with company
    const customer = await prisma.customer.findUnique({
      where: { id: userId },
      include: { company: true },
    })

    if (!customer) {
      return getErrorResponse(404, 'Customer tidak ditemukan')
    }

    if (customer.type !== 'B2B') {
      return getErrorResponse(400, 'Hanya customer B2B yang dapat mengupdate profil perusahaan')
    }

    if (!customer.companyId) {
      return getErrorResponse(400, 'Customer tidak memiliki perusahaan')
    }

    // Check if registration number or tax ID is already taken
    if (data.registrationNumber || data.taxId) {
      const existingCompany = await prisma.company.findFirst({
        where: {
          OR: [
            ...(data.registrationNumber ? [{ registrationNumber: data.registrationNumber }] : []),
            ...(data.taxId ? [{ taxId: data.taxId }] : []),
          ],
          id: { not: customer.companyId },
        },
      })

      if (existingCompany) {
        return getErrorResponse(409, 'Nomor registrasi atau NPWP sudah digunakan')
      }
    }

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id: customer.companyId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.registrationNumber && { registrationNumber: data.registrationNumber }),
        ...(data.taxId && { taxId: data.taxId }),
        ...(data.industry && { industry: data.industry }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.website && { website: data.website }),
        ...(data.contactPerson && { contactPerson: data.contactPerson }),
        ...(data.address && { address: data.address }),
        ...(data.city && { city: data.city }),
        ...(data.province && { province: data.province }),
        ...(data.postalCode && { postalCode: data.postalCode }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Profil perusahaan berhasil diperbarui',
      company: updatedCompany,
    })
  } catch (error) {
    console.error('Update company profile error:', error)
    
    if (error instanceof z.ZodError) {
      return getErrorResponse(400, error.errors[0].message)
    }

    return getErrorResponse(500, 'Terjadi kesalahan server')
  }
}