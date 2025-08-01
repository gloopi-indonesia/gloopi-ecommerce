import { signJWT } from '@/lib/jwt'
import prisma from '@/lib/prisma'
import { getErrorResponse } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password diperlukan'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    // Find admin user by email
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!adminUser) {
      return getErrorResponse(401, 'Email atau password salah')
    }

    if (!adminUser.isActive) {
      return getErrorResponse(401, 'Akun tidak aktif')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, adminUser.password)
    if (!isPasswordValid) {
      return getErrorResponse(401, 'Email atau password salah')
    }

    // Generate JWT token
    const token = await signJWT(
      { sub: adminUser.id },
      { exp: '7d' }
    )

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    response.cookies.set('logged-in', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return getErrorResponse(400, error.errors[0].message)
    }

    return getErrorResponse(500, 'Terjadi kesalahan server')
  }
}