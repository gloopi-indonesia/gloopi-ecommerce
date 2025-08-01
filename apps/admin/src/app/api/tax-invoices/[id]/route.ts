import { NextRequest, NextResponse } from 'next/server'
import { taxInvoiceService } from '@/lib/services/tax-invoice'
import { verifyJWT } from '@/lib/jwt'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const taxInvoice = await taxInvoiceService.getTaxInvoiceById(params.id)

    if (!taxInvoice) {
      return NextResponse.json(
        { error: 'Faktur pajak tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: taxInvoice
    })
  } catch (error) {
    console.error('Error fetching tax invoice:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data faktur pajak' },
      { status: 500 }
    )
  }
}