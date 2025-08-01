import prisma from '@/lib/prisma'
import { getErrorResponse } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini diperlukan'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
})

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('X-USER-ID')
    
    if (!userId) {
      return getErrorResponse(401, 'Unauthorized')
    }

    const body = await req.json()
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)

    // Get current user
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: userId },
    })

    if (!adminUser) {
      return getErrorResponse(404, 'User tidak ditemukan')
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminUser.password)
    if (!isCurrentPasswordValid) {
      return getErrorResponse(400, 'Password saat ini salah')
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.adminUser.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    })

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah',
    })
  } catch (error) {
    console.error('Change password error:', error)
    
    if (error instanceof z.ZodError) {
      return getErrorResponse(400, error.errors[0].message)
    }

    return getErrorResponse(500, 'Terjadi kesalahan server')
  }
}