import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { signJWT } from '@/lib/jwt'
import bcrypt from 'bcryptjs'
import { isEmailValid } from '@persepolis/regex'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      email,
      name,
      phone,
      password,
      type,
      // Company fields for B2B
      companyName,
      companyRegistrationNumber,
      companyTaxId,
      industry,
      companyAddress,
      companyCity,
      companyProvince,
      companyPostalCode,
      contactPerson,
    } = data

    // Validation
    if (!email || !name || !phone || !password || !type) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    if (!isEmailValid(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    if (type === 'B2B' && (!companyName || !companyRegistrationNumber || !companyTaxId)) {
      return NextResponse.json(
        { error: 'Informasi perusahaan wajib diisi untuk akun B2B' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      )
    }

    // Check if phone already exists
    const existingPhone = await prisma.customer.findUnique({
      where: { phone },
    })

    if (existingPhone) {
      return NextResponse.json(
        { error: 'Nomor telepon sudah terdaftar' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create customer and company in transaction
    const result = await prisma.$transaction(async (tx) => {
      let companyId = null

      // Create company if B2B
      if (type === 'B2B') {
        const company = await tx.company.create({
          data: {
            name: companyName,
            registrationNumber: companyRegistrationNumber,
            taxId: companyTaxId,
            industry: industry || 'OTHER',
            contactPerson: contactPerson || name,
            address: companyAddress || '',
            city: companyCity || '',
            province: companyProvince || '',
            postalCode: companyPostalCode || '',
            country: 'Indonesia',
          },
        })
        companyId = company.id
      }

      // Create customer
      const customer = await tx.customer.create({
        data: {
          email: email.toLowerCase(),
          name,
          phone,
          password: hashedPassword,
          type,
          companyId,
        },
        include: {
          company: true,
        },
      })

      return customer
    })

    // Generate JWT token
    const token = await signJWT({ sub: result.id }, { exp: '7d' })

    // Set cookie
    const response = NextResponse.json({
      message: 'Registrasi berhasil',
      customer: {
        id: result.id,
        email: result.email,
        name: result.name,
        type: result.type,
        company: result.company,
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
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}