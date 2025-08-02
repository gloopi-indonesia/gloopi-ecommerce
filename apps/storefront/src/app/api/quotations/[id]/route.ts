import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const quotation = await prisma.quotation.findFirst({
      where: {
        id: params.id,
        customerId: payload.sub,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: true,
                useCase: true,
                brand: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        shippingAddress: true,
        statusLogs: {
          include: {
            adminUser: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        convertedOrder: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    })

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      )
    }

    // Transform the data for better frontend consumption
    const quotationWithFormatting = {
      ...quotation,
      createdAt: quotation.createdAt.toISOString(),
      updatedAt: quotation.updatedAt.toISOString(),
      validUntil: quotation.validUntil.toISOString(),
      statusLogs: quotation.statusLogs.map(log => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
    }

    return NextResponse.json({
      quotation: quotationWithFormatting,
    })

  } catch (error) {
    console.error('Error fetching quotation:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}