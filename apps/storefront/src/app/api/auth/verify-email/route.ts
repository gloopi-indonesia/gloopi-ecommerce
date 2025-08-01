import prisma from '@/lib/prisma'
import { getErrorResponse } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token diperlukan'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token } = verifyEmailSchema.parse(body)

    // Find customer by verification token
    const customer = await prisma.customer.findFirst({
      where: { emailVerificationToken: token },
    })

    if (!customer) {
      return getErrorResponse(400, 'Token verifikasi tidak valid atau sudah kedaluwarsa')
    }

    if (customer.isEmailVerified) {
      return getErrorResponse(400, 'Email sudah terverifikasi')
    }

    // Update customer to mark email as verified
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Email berhasil diverifikasi',
    })
  } catch (error) {
    console.error('Email verification error:', error)
    
    if (error instanceof z.ZodError) {
      return getErrorResponse(400, error.errors[0].message)
    }

    return getErrorResponse(500, 'Terjadi kesalahan server')
  }
}