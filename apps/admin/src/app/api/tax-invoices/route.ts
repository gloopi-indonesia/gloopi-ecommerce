import { NextRequest, NextResponse } from 'next/server'
import { taxInvoiceService } from '@/lib/services/tax-invoice'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const result = await taxInvoiceService.getTaxInvoices(page, limit)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching tax invoices:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data faktur pajak' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 })
    }

    const body = await request.json()
    const { invoiceId, customerId, companyId } = body

    if (!invoiceId || !customerId || !companyId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const taxInvoice = await taxInvoiceService.createTaxInvoice({
      invoiceId,
      customerId,
      companyId,
      issuedBy: (payload as any).name || 'Admin'
    })

    return NextResponse.json({
      success: true,
      data: taxInvoice
    })
  } catch (error) {
    console.error('Error creating tax invoice:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal membuat faktur pajak' },
      { status: 500 }
    )
  }
}