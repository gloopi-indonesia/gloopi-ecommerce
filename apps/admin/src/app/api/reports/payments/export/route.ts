import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatIDRFromCents } from '@/lib/utils'

export async function POST(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url)
      const format = searchParams.get('format')
      
      const body = await request.json()
      const { dateFrom, dateTo, customerFilter, statusFilter } = body

      // Build where clause (same as GET route)
      const where: any = {}
      
      if (dateFrom || dateTo) {
         where.createdAt = {}
         if (dateFrom) where.createdAt.gte = new Date(dateFrom)
         if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
      }

      if (customerFilter) {
         where.customer = {
            name: {
               contains: customerFilter,
               mode: 'insensitive'
            }
         }
      }

      if (statusFilter) {
         where.status = statusFilter
      }

      // Fetch data
      const invoices = await prisma.invoice.findMany({
         where,
         include: {
            customer: {
               include: {
                  company: true
               }
            },
            order: true
         },
         orderBy: {
            createdAt: 'desc'
         }
      })

      if (format === 'excel') {
         return generateExcelReport(invoices)
      } else if (format === 'pdf') {
         return generatePDFReport(invoices)
      } else {
         return NextResponse.json(
            { error: 'Invalid format specified' },
            { status: 400 }
         )
      }

   } catch (error) {
      console.error('Error exporting payment report:', error)
      return NextResponse.json(
         { error: 'Failed to export payment report' },
         { status: 500 }
      )
   }
}

function generateExcelReport(invoices: any[]) {
   const now = new Date()
   
   // Prepare data for Excel
   const excelData = invoices.map(invoice => {
      const dueDate = new Date(invoice.dueDate)
      const daysPastDue = invoice.status === 'PENDING' && dueDate < now 
         ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
         : 0

      let status = invoice.status
      if (invoice.status === 'PENDING' && dueDate < now) {
         status = `OVERDUE (${daysPastDue} hari)`
      }

      return {
         'No. Invoice': invoice.invoiceNumber,
         'No. Order': invoice.order.orderNumber,
         'Pelanggan': invoice.customer.name,
         'Tipe': invoice.customer.type,
         'Perusahaan': invoice.customer.company?.name || '-',
         'Total': formatIDRFromCents(invoice.totalAmount),
         'Status': status,
         'Jatuh Tempo': new Date(invoice.dueDate).toLocaleDateString('id-ID'),
         'Tgl Bayar': invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString('id-ID') : '-',
         'Tgl Dibuat': new Date(invoice.createdAt).toLocaleDateString('id-ID')
      }
   })

   // Create workbook
   const wb = XLSX.utils.book_new()
   const ws = XLSX.utils.json_to_sheet(excelData)
   
   // Set column widths
   const colWidths = [
      { wch: 15 }, // No. Invoice
      { wch: 15 }, // No. Order
      { wch: 20 }, // Pelanggan
      { wch: 8 },  // Tipe
      { wch: 20 }, // Perusahaan
      { wch: 15 }, // Total
      { wch: 15 }, // Status
      { wch: 12 }, // Jatuh Tempo
      { wch: 12 }, // Tgl Bayar
      { wch: 12 }, // Tgl Dibuat
   ]
   ws['!cols'] = colWidths

   XLSX.utils.book_append_sheet(wb, ws, 'Laporan Pembayaran')

   // Generate buffer
   const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

   return new NextResponse(buffer, {
      headers: {
         'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'Content-Disposition': `attachment; filename="laporan-pembayaran-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
   })
}

function generatePDFReport(invoices: any[]) {
   const doc = new jsPDF()
   const now = new Date()
   
   // Title
   doc.setFontSize(16)
   doc.text('Laporan Pembayaran', 14, 20)
   
   // Date
   doc.setFontSize(10)
   doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30)

   // Summary
   const totalInvoices = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
   const totalPaid = invoices
      .filter(invoice => invoice.status === 'PAID')
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0)
   const overdueInvoices = invoices.filter(invoice => 
      invoice.status === 'PENDING' && new Date(invoice.dueDate) < now
   )
   const totalOverdue = overdueInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
   
   doc.text(`Total Tagihan: ${formatIDRFromCents(totalInvoices)}`, 14, 40)
   doc.text(`Sudah Dibayar: ${formatIDRFromCents(totalPaid)}`, 14, 50)
   doc.text(`Terlambat: ${formatIDRFromCents(totalOverdue)} (${overdueInvoices.length} tagihan)`, 14, 60)

   // Table data
   const tableData = invoices.map(invoice => {
      const dueDate = new Date(invoice.dueDate)
      let status = invoice.status
      if (invoice.status === 'PENDING' && dueDate < now) {
         status = 'OVERDUE'
      }

      return [
         invoice.invoiceNumber,
         invoice.customer.name,
         invoice.customer.type,
         formatIDRFromCents(invoice.totalAmount),
         status,
         new Date(invoice.dueDate).toLocaleDateString('id-ID')
      ]
   })

   // Generate table
   autoTable(doc, {
      head: [['No. Invoice', 'Pelanggan', 'Tipe', 'Total', 'Status', 'Jatuh Tempo']],
      body: tableData,
      startY: 70,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      didParseCell: function (data) {
         // Highlight overdue rows
         if (data.row.index >= 0 && data.column.index === 4) {
            if (data.cell.text[0] === 'OVERDUE') {
               data.cell.styles.textColor = [220, 53, 69] // Red color
               data.cell.styles.fontStyle = 'bold'
            }
         }
      }
   })

   const buffer = Buffer.from(doc.output('arraybuffer'))

   return new NextResponse(buffer, {
      headers: {
         'Content-Type': 'application/pdf',
         'Content-Disposition': `attachment; filename="laporan-pembayaran-${new Date().toISOString().split('T')[0]}.pdf"`
      }
   })
}