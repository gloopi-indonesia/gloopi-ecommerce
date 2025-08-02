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

    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        customerId: payload.sub,
      },
      include: {
        shippingAddress: true,
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
        invoice: {
          include: {
            taxInvoice: {
              select: {
                id: true,
                taxInvoiceNumber: true,
                ppnRate: true,
                ppnAmount: true,
                totalWithPPN: true,
                issuedAt: true,
              },
            },
          },
        },
        quotation: {
          select: {
            id: true,
            quotationNumber: true,
            validUntil: true,
          },
        },
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
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Transform the data for better frontend consumption
    const orderWithFormatting = {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      shippedAt: order.shippedAt?.toISOString() || null,
      deliveredAt: order.deliveredAt?.toISOString() || null,
      quotation: order.quotation ? {
        ...order.quotation,
        validUntil: order.quotation.validUntil.toISOString(),
      } : null,
      invoice: order.invoice ? {
        ...order.invoice,
        dueDate: order.invoice.dueDate.toISOString(),
        paidAt: order.invoice.paidAt?.toISOString() || null,
        taxInvoice: order.invoice.taxInvoice ? {
          ...order.invoice.taxInvoice,
          issuedAt: order.invoice.taxInvoice.issuedAt.toISOString(),
        } : null,
      } : null,
      statusLogs: order.statusLogs.map(log => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
    }

    return NextResponse.json({
      order: orderWithFormatting,
    })

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}