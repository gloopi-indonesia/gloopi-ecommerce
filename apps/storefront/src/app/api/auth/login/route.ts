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

    // Find customer by email
    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        company: true,
      },
    })

    if (!customer) {
      return getErrorResponse(401, 'Email atau password salah')
    }

    if (!customer.password) {
      return getErrorResponse(401, 'Akun belum memiliki password. Silakan daftar terlebih dahulu.')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.password)
    if (!isPasswordValid) {
      return getErrorResponse(401, 'Email atau password salah')
    }

    // Generate JWT token
    const token = await signJWT(
      { sub: customer.id },
      { exp: '30d' }
    )

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
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
    console.error('Customer login error:', error)
    
    if (error instanceof z.ZodError) {
      return getErrorResponse(400, error.errors[0].message)
    }

    return getErrorResponse(500, 'Terjadi kesalahan server')
  }
}