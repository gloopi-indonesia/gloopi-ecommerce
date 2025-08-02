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

    const quotations = await prisma.quotation.findMany({
      where: {
        customerId: payload.sub,
      },
      select: {
        id: true,
        quotationNumber: true,
        status: true,
        totalAmount: true,
        validUntil: true,
        createdAt: true,
        items: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform the data to include item count
    const quotationSummaries = quotations.map(quotation => ({
      id: quotation.id,
      quotationNumber: quotation.quotationNumber,
      status: quotation.status,
      totalAmount: quotation.totalAmount,
      validUntil: quotation.validUntil.toISOString(),
      createdAt: quotation.createdAt.toISOString(),
      itemCount: quotation.items.length,
    }))

    return NextResponse.json({
      quotations: quotationSummaries,
    })

  } catch (error) {
    console.error('Error fetching quotations:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}