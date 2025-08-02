import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyJWT(token) as any
    if (!payload || typeof payload.sub !== 'string') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { name, phone } = await request.json()

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Nama dan nomor telepon diperlukan' },
        { status: 400 }
      )
    }

    // Check if phone is already used by another customer
    const existingPhone = await prisma.customer.findFirst({
      where: {
        phone,
        id: { not: payload.sub },
      },
    })

    if (existingPhone) {
      return NextResponse.json(
        { error: 'Nomor telepon sudah digunakan' },
        { status: 409 }
      )
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { id: payload.sub },
      data: { name, phone },
      include: {
        company: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    })

    return NextResponse.json({
      message: 'Profil berhasil diperbarui',
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        type: customer.type,
        isEmailVerified: customer.isEmailVerified,
        isPhoneVerified: customer.isPhoneVerified,
        taxInformation: customer.taxInformation,
        communicationPreferences: customer.communicationPreferences,
        company: customer.company,
        addresses: customer.addresses,
        createdAt: customer.createdAt.toISOString(),
      },
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}