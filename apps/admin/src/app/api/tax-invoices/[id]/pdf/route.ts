import { NextRequest, NextResponse } from 'next/server'
import { taxInvoiceService } from '@/lib/services/tax-invoice'
import { generateTaxInvoicePDFHTML, getDefaultCompanyInfo } from '@/lib/pdf/tax-invoice-pdf'
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

    // Get tax invoice data
    const taxInvoice = await taxInvoiceService.getTaxInvoiceById(params.id)

    if (!taxInvoice) {
      return NextResponse.json(
        { error: 'Faktur pajak tidak ditemukan' },
        { status: 404 }
      )
    }

    // Generate PDF HTML
    const companyInfo = getDefaultCompanyInfo()
    const html = generateTaxInvoicePDFHTML({ taxInvoice, companyInfo })

    // For now, return HTML for preview
    // In production, you would generate actual PDF using puppeteer
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="faktur-pajak-${taxInvoice.taxInvoiceNumber}.html"`
      }
    })

    // TODO: Implement actual PDF generation with puppeteer
    // const pdfBuffer = await generateTaxInvoicePDF({ taxInvoice, companyInfo })
    // return new NextResponse(pdfBuffer, {
    //   headers: {
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': `attachment; filename="faktur-pajak-${taxInvoice.taxInvoiceNumber}.pdf"`
    //   }
    // })
  } catch (error) {
    console.error('Error generating tax invoice PDF:', error)
    return NextResponse.json(
      { error: 'Gagal membuat PDF faktur pajak' },
      { status: 500 }
    )
  }
}