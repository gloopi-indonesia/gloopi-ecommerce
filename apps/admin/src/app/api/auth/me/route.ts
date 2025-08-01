import prisma from '@/lib/prisma'
import { getErrorResponse } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('X-USER-ID')
    
    if (!userId) {
      return getErrorResponse(401, 'Unauthorized')
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    if (!adminUser) {
      return getErrorResponse(404, 'User tidak ditemukan')
    }

    if (!adminUser.isActive) {
      return getErrorResponse(401, 'Akun tidak aktif')
    }

    return NextResponse.json({
      success: true,
      user: adminUser,
    })
  } catch (error) {
    console.error('Get user error:', error)
    return getErrorResponse(500, 'Terjadi kesalahan server')
  }
}