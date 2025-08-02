import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url)
      const dateFrom = searchParams.get('dateFrom')
      const dateTo = searchParams.get('dateTo')
      const customer = searchParams.get('customer')
      const category = searchParams.get('category')

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

      // Category filter (through product use case)
      if (category) {
         where.items = {
            some: {
               product: {
                  useCase: category
               }
            }
         }
      }

      // Fetch orders with related data
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

      // Calculate summary
      const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0)
      const totalOrders = orders.length
      const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0

      // Transform data for frontend
      const transformedOrders = orders.map(order => ({
         id: order.id,
         orderNumber: order.orderNumber,
         customerName: order.customer.name,
         customerType: order.customer.type,
         companyName: order.customer.company?.name,
         totalAmount: order.totalAmount,
         status: order.status,
         createdAt: order.createdAt,
         items: order.items.map(item => ({
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            useCase: item.product.useCase
         }))
      }))

      return NextResponse.json({
         summary: {
            totalSales,
            totalOrders,
            averageOrderValue
         },
         orders: transformedOrders
      })

   } catch (error) {
      console.error('Error fetching sales report:', error)
      return NextResponse.json(
         { error: 'Failed to fetch sales report' },
         { status: 500 }
      )
   }
}