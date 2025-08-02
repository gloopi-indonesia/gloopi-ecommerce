import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url)
      const dateFrom = searchParams.get('dateFrom')
      const dateTo = searchParams.get('dateTo')
      const customer = searchParams.get('customer')
      const status = searchParams.get('status')

      // Build where clause
      const where: any = {}
      
      // Date range filter
      if (dateFrom || dateTo) {
         where.createdAt = {}
         if (dateFrom) where.createdAt.gte = new Date(dateFrom)
         if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
      }

      // Customer filter
      if (customer) {
         where.customer = {
            name: {
               contains: customer,
               mode: 'insensitive'
            }
         }
      }

      // Status filter
      if (status) {
         where.status = status
      }

      // Fetch invoices with related data
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

      // Calculate summary
      const totalInvoices = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
      const totalPaid = invoices
         .filter(invoice => invoice.status === 'PAID')
         .reduce((sum, invoice) => sum + invoice.totalAmount, 0)
      const totalPending = invoices
         .filter(invoice => invoice.status === 'PENDING')
         .reduce((sum, invoice) => sum + invoice.totalAmount, 0)
      
      // Calculate overdue invoices
      const now = new Date()
      const overdueInvoices = invoices.filter(invoice => 
         invoice.status === 'PENDING' && new Date(invoice.dueDate) < now
      )
      const totalOverdue = overdueInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
      const overdueCount = overdueInvoices.length

      // Transform data for frontend
      const transformedInvoices = invoices.map(invoice => {
         const dueDate = new Date(invoice.dueDate)
         const daysPastDue = invoice.status === 'PENDING' && dueDate < now 
            ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
            : undefined

         // Determine status including overdue
         let invoiceStatus = invoice.status
         if (invoice.status === 'PENDING' && dueDate < now) {
            invoiceStatus = 'OVERDUE'
         }

         return {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            orderNumber: invoice.order.orderNumber,
            customerName: invoice.customer.name,
            customerType: invoice.customer.type,
            companyName: invoice.customer.company?.name,
            totalAmount: invoice.totalAmount,
            status: invoiceStatus,
            dueDate: invoice.dueDate,
            paidAt: invoice.paidAt,
            createdAt: invoice.createdAt,
            daysPastDue
         }
      })

      return NextResponse.json({
         summary: {
            totalInvoices,
            totalPaid,
            totalPending,
            totalOverdue,
            overdueCount
         },
         invoices: transformedInvoices
      })

   } catch (error) {
      console.error('Error fetching payment report:', error)
      return NextResponse.json(
         { error: 'Failed to fetch payment report' },
         { status: 500 }
      )
   }
}