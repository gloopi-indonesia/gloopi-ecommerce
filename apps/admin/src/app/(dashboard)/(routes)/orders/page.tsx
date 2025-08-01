import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'

import { SortBy } from './components/options'
import type { OrderColumn } from './components/table'
import { OrderTable } from './components/table'

export default async function OrdersPage({ searchParams }) {
   const {
      customerId,
      sort,
      status,
      brand,
      category,
      page = 1,
      minAmount,
      maxAmount,
   } = searchParams ?? null

   const orderBy = getOrderBy(sort)

   const orders = await prisma.order.findMany({
      where: {
         customerId,
         status,
         items: {
            some: {
               product: {
                  brand: {
                     name: {
                        contains: brand,
                        mode: 'insensitive',
                     },
                  },
                  categories: {
                     some: {
                        category: {
                           name: {
                              contains: category,
                              mode: 'insensitive',
                           },
                        },
                     },
                  },
               },
            },
         },
         totalAmount: {
            gte: minAmount ? parseInt(minAmount) * 100 : undefined, // Convert to cents
            lte: maxAmount ? parseInt(maxAmount) * 100 : undefined,
         },
      },
      include: {
         customer: true,
         quotation: true,
         items: {
            include: {
               product: {
                  include: {
                     brand: true,
                  },
               },
            },
         },
         invoice: true,
         shippingAddress: true,
      },
      skip: (page - 1) * 12,
      take: 12,
      orderBy,
   })

   const formattedOrders: OrderColumn[] = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      quotationNumber: order.quotation.quotationNumber,
      customerName: order.customer.name,
      customerType: order.customer.type,
      status: order.status,
      totalAmount: order.totalAmount, // In cents
      trackingNumber: order.trackingNumber,
      hasInvoice: !!order.invoice,
      invoiceStatus: order.invoice?.status,
      createdAt: format(order.createdAt, 'MMMM do, yyyy'),
      shippedAt: order.shippedAt ? format(order.shippedAt, 'MMMM do, yyyy') : null,
      deliveredAt: order.deliveredAt ? format(order.deliveredAt, 'MMMM do, yyyy') : null,
   }))

   return (
      <div className="block space-y-4 my-6">
         <Heading
            title={`Orders (${orders.length})`}
            description="Manage orders converted from approved quotations"
         />
         <Separator />
         <div className="grid grid-cols-4 gap-2">
            <SortBy initialData={'newest'} />
         </div>
         <OrderTable data={formattedOrders} />
      </div>
   )
}

function getOrderBy(sort) {
   let orderBy

   switch (sort) {
      case 'highest_amount':
         orderBy = {
            totalAmount: 'desc',
         }
         break
      case 'lowest_amount':
         orderBy = {
            totalAmount: 'asc',
         }
         break
      case 'oldest':
         orderBy = {
            createdAt: 'asc',
         }
         break
      default:
         orderBy = {
            createdAt: 'desc',
         }
         break
   }

   return orderBy
}
