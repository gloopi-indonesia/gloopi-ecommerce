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

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        customerId: payload.sub,
      },
      include: {
        order: {
          include: {
            shippingAddress: true,
          },
        },
        customer: {
          include: {
            company: true,
          },
        },
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
        taxInvoice: {
          include: {
            company: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Transform the data for better frontend consumption
    const invoiceWithFormatting = {
      ...invoice,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      paidAt: invoice.paidAt?.toISOString() || null,
      taxInvoice: invoice.taxInvoice ? {
        ...invoice.taxInvoice,
        issuedAt: invoice.taxInvoice.issuedAt.toISOString(),
      } : null,
      // Calculate if invoice is overdue
      isOverdue: invoice.status === 'PENDING' && new Date() > invoice.dueDate,
    }

    return NextResponse.json({
      invoice: invoiceWithFormatting,
    })

  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}