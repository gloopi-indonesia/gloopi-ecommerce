import { signJWT } from '@/lib/jwt'
import prisma from '@/lib/prisma'
import { getErrorResponse } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'STAFF']).optional().default('ADMIN'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, password, role } = registerSchema.parse(body)

    // Check if admin user already exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return getErrorResponse(409, 'Email sudah terdaftar')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role,
      },
    })

    // Generate JWT token
    const token = await signJWT(
      { sub: adminUser.id },
      { exp: '7d' }
    )

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Registrasi berhasil',
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
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return getErrorResponse(400, error.errors[0].message)
    }

    return getErrorResponse(500, 'Terjadi kesalahan server')
  }
}