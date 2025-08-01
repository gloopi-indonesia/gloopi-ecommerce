import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify customer authentication
    const token = request.cookies.get('customer-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 })
    }

    // Get invoice and verify ownership
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        order: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Faktur tidak ditemukan' },
        { status: 404 }
      )
    }

    if (invoice.customerId !== payload.sub) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses ke faktur ini' },
        { status: 403 }
      )
    }

    // Check if invoice is paid
    if (invoice.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Faktur pajak hanya dapat diminta untuk faktur yang sudah dibayar' },
        { status: 400 }
      )
    }

    // Check if tax invoice already requested
    if (invoice.taxInvoiceRequested) {
      return NextResponse.json(
        { error: 'Faktur pajak sudah diminta untuk faktur ini' },
        { status: 400 }
      )
    }

    // Check if customer is B2B
    if (invoice.customer.type !== 'B2B') {
      return NextResponse.json(
        { error: 'Faktur pajak hanya tersedia untuk pelanggan B2B' },
        { status: 400 }
      )
    }

    // Check if customer has company profile
    const customer = await prisma.customer.findUnique({
      where: { id: payload.sub },
      include: { company: true }
    })

    if (!customer?.company) {
      return NextResponse.json(
        { error: 'Profil perusahaan diperlukan untuk meminta faktur pajak' },
        { status: 400 }
      )
    }

    // Validate company tax information
    if (!customer.company.taxId) {
      return NextResponse.json(
        { error: 'NPWP perusahaan diperlukan untuk faktur pajak' },
        { status: 400 }
      )
    }

    // Update invoice to mark tax invoice as requested
    await prisma.invoice.update({
      where: { id: params.id },
      data: { taxInvoiceRequested: true }
    })

    // TODO: Send notification to admin about tax invoice request
    // This could be implemented with email notification or admin dashboard notification

    return NextResponse.json({
      success: true,
      message: 'Permintaan faktur pajak berhasil dikirim. Admin akan memproses permintaan Anda.'
    })
  } catch (error) {
    console.error('Error requesting tax invoice:', error)
    return NextResponse.json(
      { error: 'Gagal meminta faktur pajak' },
      { status: 500 }
    )
  }
}