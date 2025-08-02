import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function POST(
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

    // Get the invoice and verify ownership
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        customerId: payload.sub,
      },
      include: {
        customer: {
          include: {
            company: true,
          },
        },
        taxInvoice: true,
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Check if invoice is paid
    if (invoice.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Tax invoice can only be requested for paid invoices' },
        { status: 400 }
      )
    }

    // Check if tax invoice already exists
    if (invoice.taxInvoice) {
      return NextResponse.json(
        { error: 'Tax invoice already exists for this invoice' },
        { status: 400 }
      )
    }

    // Check if customer is B2B and has company information
    if (invoice.customer.type !== 'B2B' || !invoice.customer.company) {
      return NextResponse.json(
        { error: 'Tax invoice can only be requested by B2B customers with complete company information' },
        { status: 400 }
      )
    }

    // Get tax information from request body (if customer needs to provide additional info)
    const { taxInformation } = await request.json()

    // Update customer tax information if provided
    if (taxInformation) {
      await prisma.customer.update({
        where: { id: payload.sub },
        data: {
          taxInformation: taxInformation,
        },
      })
    }

    // Mark invoice as tax invoice requested
    await prisma.invoice.update({
      where: { id: params.id },
      data: {
        taxInvoiceRequested: true,
      },
    })

    // TODO: Here you would typically:
    // 1. Send notification to admin about tax invoice request
    // 2. Create a task/notification in admin system
    // 3. Send email notification to admin
    
    // For now, we'll just log it
    console.log(`Tax invoice requested for invoice ${invoice.invoiceNumber} by customer ${invoice.customer.name}`)

    return NextResponse.json({
      message: 'Permintaan faktur pajak berhasil dikirim. Admin akan memproses permintaan Anda dalam 1-2 hari kerja.',
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        taxInvoiceRequested: true,
      },
    })

  } catch (error) {
    console.error('Error requesting tax invoice:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}