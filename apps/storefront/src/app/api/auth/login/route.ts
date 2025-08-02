import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { signJWT } from '@/lib/jwt'
import bcrypt from 'bcryptjs'
import { isEmailValid } from '@persepolis/regex'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password diperlukan' },
        { status: 400 }
      )
    }

    if (!isEmailValid(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        company: true,
      },
    })

    if (!customer || !customer.password) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, customer.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = await signJWT({ sub: customer.id })

    // Set cookie
    const response = NextResponse.json({
      message: 'Login berhasil',
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        type: customer.type,
        company: customer.company,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}