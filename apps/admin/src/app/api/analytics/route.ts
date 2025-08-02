import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url)
      const period = searchParams.get('period') || '30d'
      const dateFrom = searchParams.get('dateFrom')
      const dateTo = searchParams.get('dateTo')

      // Calculate date range based on period
      let startDate: Date
      let endDate = new Date()

      if (period === 'custom' && dateFrom && dateTo) {
         startDate = new Date(dateFrom)
         endDate = new Date(dateTo + 'T23:59:59.999Z')
      } else {
         const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
         startDate = new Date()
         startDate.setDate(startDate.getDate() - days)
      }

      // Fetch basic data
      const [orders, quotations, customers, invoices] = await Promise.all([
         prisma.order.findMany({
            where: {
               createdAt: {
                  gte: startDate,
                  lte: endDate
               }
            },
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
            }
         }),
         prisma.quotation.findMany({
            where: {
               createdAt: {
                  gte: startDate,
                  lte: endDate
               }
            },
            include: {
               customer: true
            }
         }),
         prisma.customer.findMany({
            where: {
               createdAt: {
                  gte: startDate,
                  lte: endDate
               }
            },
            include: {
               company: true,
               orders: true
            }
         }),
         prisma.invoice.findMany({
            where: {
               createdAt: {
                  gte: startDate,
                  lte: endDate
               }
            }
         })
      ])

      // Calculate overview metrics
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
      const totalOrders = orders.length
      const totalCustomers = customers.length
      const totalQuotations = quotations.length
      const conversionRate = totalQuotations > 0 ? (totalOrders / totalQuotations) * 100 : 0
      const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

      // Calculate repeat customer rate
      const customersWithMultipleOrders = customers.filter(customer => customer.orders.length > 1).length
      const repeatCustomerRate = totalCustomers > 0 ? (customersWithMultipleOrders / totalCustomers) * 100 : 0

      // Calculate revenue growth (mock data for now)
      const revenueGrowth = 12.5 // This would be calculated against previous period

      // Generate daily conversion data
      const dailyConversion = generateDailyData(startDate, endDate, quotations, orders)

      // Calculate customer segmentation
      const b2bCustomers = customers.filter(c => c.type === 'B2B')
      const b2cCustomers = customers.filter(c => c.type === 'B2C')
      const b2bOrders = orders.filter(o => o.customer.type === 'B2B')
      const b2cOrders = orders.filter(o => o.customer.type === 'B2C')
      const b2bRevenue = b2bOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      const b2cRevenue = b2cOrders.reduce((sum, order) => sum + order.totalAmount, 0)

      // Generate product performance data
      const productStats = generateProductStats(orders)
      const industryBreakdown = generateIndustryBreakdown(orders)

      // Generate monthly revenue data
      const monthlyRevenue = generateMonthlyRevenue(orders, startDate, endDate)

      const analyticsData = {
         overview: {
            totalRevenue,
            totalOrders,
            totalCustomers,
            totalQuotations,
            conversionRate,
            averageOrderValue,
            repeatCustomerRate,
            revenueGrowth
         },
         conversion: {
            daily: dailyConversion,
            summary: {
               totalQuotations,
               totalOrders,
               overallConversionRate: conversionRate
            }
         },
         customers: {
            acquisition: generateCustomerAcquisition(customers, startDate, endDate),
            retention: {
               repeatCustomers: customersWithMultipleOrders,
               oneTimeCustomers: totalCustomers - customersWithMultipleOrders,
               repeatRate: repeatCustomerRate
            },
            segmentation: {
               b2b: {
                  count: b2bCustomers.length,
                  revenue: b2bRevenue,
                  averageOrderValue: b2bOrders.length > 0 ? Math.round(b2bRevenue / b2bOrders.length) : 0
               },
               b2c: {
                  count: b2cCustomers.length,
                  revenue: b2cRevenue,
                  averageOrderValue: b2cOrders.length > 0 ? Math.round(b2cRevenue / b2cOrders.length) : 0
               }
            }
         },
         products: {
            topProducts: productStats,
            industryBreakdown,
            categoryPerformance: generateCategoryPerformance(orders)
         },
         revenue: {
            monthly: monthlyRevenue,
            comparison: {
               b2b: {
                  revenue: b2bRevenue,
                  percentage: totalRevenue > 0 ? (b2bRevenue / totalRevenue) * 100 : 0,
                  growth: 8.5 // Mock data
               },
               b2c: {
                  revenue: b2cRevenue,
                  percentage: totalRevenue > 0 ? (b2cRevenue / totalRevenue) * 100 : 0,
                  growth: 15.2 // Mock data
               }
            },
            trends: generateGrowthTrends()
         }
      }

      return NextResponse.json(analyticsData)

   } catch (error) {
      console.error('Error fetching analytics:', error)
      return NextResponse.json(
         { error: 'Failed to fetch analytics data' },
         { status: 500 }
      )
   }
}

function generateDailyData(startDate: Date, endDate: Date, quotations: any[], orders: any[]) {
   const days = []
   const current = new Date(startDate)
   
   while (current <= endDate) {
      const dayStr = current.toISOString().split('T')[0]
      const dayQuotations = quotations.filter(q => 
         q.createdAt.toISOString().split('T')[0] === dayStr
      ).length
      const dayOrders = orders.filter(o => 
         o.createdAt.toISOString().split('T')[0] === dayStr
      ).length
      
      days.push({
         date: dayStr,
         quotations: dayQuotations,
         orders: dayOrders,
         conversionRate: dayQuotations > 0 ? (dayOrders / dayQuotations) * 100 : 0
      })
      
      current.setDate(current.getDate() + 1)
   }
   
   return days
}

function generateProductStats(orders: any[]) {
   const productMap = new Map()
   
   orders.forEach(order => {
      order.items.forEach(item => {
         const key = item.product.id
         if (!productMap.has(key)) {
            productMap.set(key, {
               id: item.product.id,
               name: item.product.name,
               sku: item.product.sku,
               totalSold: 0,
               revenue: 0,
               useCase: item.product.useCase
            })
         }
         
         const product = productMap.get(key)
         product.totalSold += item.quantity
         product.revenue += item.totalPrice
      })
   })
   
   return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
}

function generateIndustryBreakdown(orders: any[]) {
   const industryMap = new Map()
   
   orders.forEach(order => {
      order.items.forEach(item => {
         const industry = item.product.useCase
         if (!industryMap.has(industry)) {
            industryMap.set(industry, { count: 0, revenue: 0 })
         }
         
         const data = industryMap.get(industry)
         data.count += 1
         data.revenue += item.totalPrice
      })
   })
   
   const total = orders.length
   return Array.from(industryMap.entries()).map(([industry, data]) => ({
      industry,
      count: data.count,
      revenue: data.revenue,
      percentage: total > 0 ? (data.count / total) * 100 : 0
   }))
}

function generateCustomerAcquisition(customers: any[], startDate: Date, endDate: Date) {
   const days = []
   const current = new Date(startDate)
   
   while (current <= endDate) {
      const dayStr = current.toISOString().split('T')[0]
      const dayCustomers = customers.filter(c => 
         c.createdAt.toISOString().split('T')[0] === dayStr
      )
      
      days.push({
         date: dayStr,
         newCustomers: dayCustomers.length,
         b2bCustomers: dayCustomers.filter(c => c.type === 'B2B').length,
         b2cCustomers: dayCustomers.filter(c => c.type === 'B2C').length
      })
      
      current.setDate(current.getDate() + 1)
   }
   
   return days
}

function generateCategoryPerformance(orders: any[]) {
   // Mock category data since we don't have categories in the current schema
   return [
      { category: 'Disposable Gloves', products: 15, orders: 45, revenue: 25000000 },
      { category: 'Surgical Gloves', products: 8, orders: 32, revenue: 18000000 },
      { category: 'Industrial Gloves', products: 12, orders: 28, revenue: 15000000 },
      { category: 'Food Service Gloves', products: 6, orders: 20, revenue: 12000000 }
   ]
}

function generateMonthlyRevenue(orders: any[], startDate: Date, endDate: Date) {
   const monthlyMap = new Map()
   
   orders.forEach(order => {
      const month = order.createdAt.toISOString().substring(0, 7) // YYYY-MM
      if (!monthlyMap.has(month)) {
         monthlyMap.set(month, { b2bRevenue: 0, b2cRevenue: 0 })
      }
      
      const data = monthlyMap.get(month)
      if (order.customer.type === 'B2B') {
         data.b2bRevenue += order.totalAmount
      } else {
         data.b2cRevenue += order.totalAmount
      }
   })
   
   return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      b2bRevenue: data.b2bRevenue,
      b2cRevenue: data.b2cRevenue,
      totalRevenue: data.b2bRevenue + data.b2cRevenue
   }))
}

function generateGrowthTrends() {
   // Mock growth trend data
   return [
      { period: 'Q1', b2bGrowth: 5.2, b2cGrowth: 8.1, totalGrowth: 6.5 },
      { period: 'Q2', b2bGrowth: 7.8, b2cGrowth: 12.3, totalGrowth: 9.8 },
      { period: 'Q3', b2bGrowth: 6.1, b2cGrowth: 15.7, totalGrowth: 10.2 },
      { period: 'Q4', b2bGrowth: 8.5, b2cGrowth: 18.2, totalGrowth: 12.5 }
   ]
}