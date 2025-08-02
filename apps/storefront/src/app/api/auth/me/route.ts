import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: NextRequest) {
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

    const customer = await prisma.customer.findUnique({
      where: { id: payload.sub },
      include: {
        company: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
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
    console.error('Get customer error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}