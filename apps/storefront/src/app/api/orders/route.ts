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

    const orders = await prisma.order.findMany({
      where: {
        customerId: payload.sub,
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        trackingNumber: true,
        shippedAt: true,
        deliveredAt: true,
        createdAt: true,
        updatedAt: true,
        shippingAddress: {
          select: {
            address: true,
            city: true,
            province: true,
            postalCode: true,
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: true,
              },
            },
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            dueDate: true,
            paidAt: true,
            totalAmount: true,
            taxInvoiceRequested: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform the data for better frontend consumption
    const ordersWithFormatting = orders.map(order => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      shippedAt: order.shippedAt?.toISOString() || null,
      deliveredAt: order.deliveredAt?.toISOString() || null,
      invoice: order.invoice ? {
        ...order.invoice,
        dueDate: order.invoice.dueDate.toISOString(),
        paidAt: order.invoice.paidAt?.toISOString() || null,
      } : null,
    }))

    return NextResponse.json({
      orders: ordersWithFormatting,
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}