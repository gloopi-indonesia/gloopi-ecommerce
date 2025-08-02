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

    const invoices = await prisma.invoice.findMany({
      where: {
        customerId: payload.sub,
      },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        subtotal: true,
        taxAmount: true,
        totalAmount: true,
        dueDate: true,
        paidAt: true,
        paymentMethod: true,
        taxInvoiceRequested: true,
        createdAt: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
        taxInvoice: {
          select: {
            id: true,
            taxInvoiceNumber: true,
            ppnAmount: true,
            totalWithPPN: true,
            issuedAt: true,
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
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform the data for better frontend consumption
    const invoicesWithFormatting = invoices.map(invoice => ({
      ...invoice,
      createdAt: invoice.createdAt.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      paidAt: invoice.paidAt?.toISOString() || null,
      taxInvoice: invoice.taxInvoice ? {
        ...invoice.taxInvoice,
        issuedAt: invoice.taxInvoice.issuedAt.toISOString(),
      } : null,
      // Calculate if invoice is overdue
      isOverdue: invoice.status === 'PENDING' && new Date() > invoice.dueDate,
    }))

    return NextResponse.json({
      invoices: invoicesWithFormatting,
    })

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}