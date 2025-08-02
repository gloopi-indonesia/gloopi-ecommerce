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
      const { dateFrom, dateTo, customerFilter, categoryFilter } = body

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

      if (categoryFilter) {
         where.items = {
            some: {
               product: {
                  useCase: categoryFilter
               }
            }
         }
      }

      // Fetch data
      const orders = await prisma.order.findMany({
         where,
         include: {
            customer: {
               include: {
                  company: true
               }
            },
            items: {
               include: {
                  product: true
               }
            }
         },
         orderBy: {
            createdAt: 'desc'
         }
      })

      if (format === 'excel') {
         return generateExcelReport(orders)
      } else if (format === 'pdf') {
         return generatePDFReport(orders)
      } else {
         return NextResponse.json(
            { error: 'Invalid format specified' },
            { status: 400 }
         )
      }

   } catch (error) {
      console.error('Error exporting sales report:', error)
      return NextResponse.json(
         { error: 'Failed to export sales report' },
         { status: 500 }
      )
   }
}

function generateExcelReport(orders: any[]) {
   // Prepare data for Excel
   const excelData = orders.map(order => ({
      'No. Order': order.orderNumber,
      'Pelanggan': order.customer.name,
      'Tipe': order.customer.type,
      'Perusahaan': order.customer.company?.name || '-',
      'Total': formatIDRFromCents(order.totalAmount),
      'Status': order.status,
      'Tanggal': new Date(order.createdAt).toLocaleDateString('id-ID'),
      'Produk': order.items.map(item => 
         `${item.product.name} (${item.quantity}x @ ${formatIDRFromCents(item.unitPrice)})`
      ).join('; ')
   }))

   // Create workbook
   const wb = XLSX.utils.book_new()
   const ws = XLSX.utils.json_to_sheet(excelData)
   
   // Set column widths
   const colWidths = [
      { wch: 15 }, // No. Order
      { wch: 20 }, // Pelanggan
      { wch: 8 },  // Tipe
      { wch: 20 }, // Perusahaan
      { wch: 15 }, // Total
      { wch: 12 }, // Status
      { wch: 12 }, // Tanggal
      { wch: 50 }, // Produk
   ]
   ws['!cols'] = colWidths

   XLSX.utils.book_append_sheet(wb, ws, 'Laporan Penjualan')

   // Generate buffer
   const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

   return new NextResponse(buffer, {
      headers: {
         'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'Content-Disposition': `attachment; filename="laporan-penjualan-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
   })
}

function generatePDFReport(orders: any[]) {
   const doc = new jsPDF()
   
   // Title
   doc.setFontSize(16)
   doc.text('Laporan Penjualan', 14, 20)
   
   // Date
   doc.setFontSize(10)
   doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30)

   // Summary
   const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0)
   const totalOrders = orders.length
   
   doc.text(`Total Penjualan: ${formatIDRFromCents(totalSales)}`, 14, 40)
   doc.text(`Jumlah Order: ${totalOrders}`, 14, 50)

   // Table data
   const tableData = orders.map(order => [
      order.orderNumber,
      order.customer.name,
      order.customer.type,
      formatIDRFromCents(order.totalAmount),
      order.status,
      new Date(order.createdAt).toLocaleDateString('id-ID')
   ])

   // Generate table
   autoTable(doc, {
      head: [['No. Order', 'Pelanggan', 'Tipe', 'Total', 'Status', 'Tanggal']],
      body: tableData,
      startY: 60,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
   })

   const buffer = Buffer.from(doc.output('arraybuffer'))

   return new NextResponse(buffer, {
      headers: {
         'Content-Type': 'application/pdf',
         'Content-Disposition': `attachment; filename="laporan-penjualan-${new Date().toISOString().split('T')[0]}.pdf"`
      }
   })
}