
import { Badge } from '@/components/ui/badge'
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { CalendarIcon, PackageIcon, TruckIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'

import { InvoiceManagement } from './components/invoice-management'
import { OrderStatusUpdate } from './components/order-status-update'
import { TrackingNumberForm } from './components/tracking-number-form'

const OrderDetailPage = async ({ params }: { params: { orderId: string } }) => {
   const order = await prisma.order.findUnique({
      where: {
         id: params.orderId,
      },
      include: {
         customer: {
            include: {
               company: true,
            },
         },
         quotation: {
            include: {
               statusLogs: {
                  include: {
                     adminUser: true,
                  },
                  orderBy: {
                     createdAt: 'desc',
                  },
               },
            },
         },
         items: {
            include: {
               product: {
                  include: {
                     brand: true,
                  },
               },
            },
         },
         shippingAddress: true,
         invoice: true,
         statusLogs: {
            include: {
               adminUser: true,
            },
            orderBy: {
               createdAt: 'desc',
            },
         },
      },
   })

   if (!order) {
      return (
         <div className="flex-col">
            <div className="flex-1 pt-6 pb-12">
               <Heading title="Order Not Found" description="The requested order could not be found." />
            </div>
         </div>
      )
   }

   // Helper function to format IDR currency
   function formatIDR(amountInCents: number): string {
      const amount = amountInCents / 100
      return new Intl.NumberFormat('id-ID', {
         style: 'currency',
         currency: 'IDR',
         minimumFractionDigits: 0,
      }).format(amount)
   }

   // Helper function to get status badge variant
   function getStatusVariant(status: string) {
      switch (status) {
         case 'NEW':
            return 'secondary'
         case 'PROCESSING':
            return 'default'
         case 'SHIPPED':
            return 'outline'
         case 'DELIVERED':
            return 'default'
         case 'CANCELLED':
            return 'destructive'
         default:
            return 'secondary'
      }
   }

   function OrderOverviewCard() {
      return (
         <Card>
            <CardHeader>
               <div className="flex items-center justify-between">
                  <div>
                     <CardTitle className="text-2xl">{order.orderNumber}</CardTitle>
                     <CardDescription>
                        Converted from quotation {order.quotation.quotationNumber}
                     </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(order.status)} className="text-sm">
                     {order.status === 'SHIPPED' && <TruckIcon className="w-4 h-4 mr-1" />}
                     {order.status === 'DELIVERED' && <PackageIcon className="w-4 h-4 mr-1" />}
                     {order.status}
                  </Badge>
               </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                     <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                     <p className="text-2xl font-bold">{formatIDR(order.totalAmount)}</p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-muted-foreground">Created</p>
                     <p className="text-sm">{format(order.createdAt, 'PPP')}</p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-muted-foreground">Shipped</p>
                     <p className="text-sm">
                        {order.shippedAt ? format(order.shippedAt, 'PPP') : 'Not shipped'}
                     </p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                     <p className="text-sm">
                        {order.deliveredAt ? format(order.deliveredAt, 'PPP') : 'Not delivered'}
                     </p>
                  </div>
               </div>
               {order.trackingNumber && (
                  <div>
                     <p className="text-sm font-medium text-muted-foreground">Tracking Number</p>
                     <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {order.trackingNumber}
                     </p>
                  </div>
               )}
            </CardContent>
         </Card>
      )
   }

   function CustomerCard() {
      return (
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Customer Information
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <p className="text-sm font-medium text-muted-foreground">Name</p>
                     <p className="font-medium">{order.customer.name}</p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-muted-foreground">Type</p>
                     <Badge variant="outline">{order.customer.type}</Badge>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-muted-foreground">Email</p>
                     <p className="text-sm">{order.customer.email}</p>
                  </div>
                  <div>
                     <p className="text-sm font-medium text-muted-foreground">Phone</p>
                     <p className="text-sm">{order.customer.phone}</p>
                  </div>
               </div>
               {order.customer.company && (
                  <div>
                     <p className="text-sm font-medium text-muted-foreground">Company</p>
                     <p className="font-medium">{order.customer.company.name}</p>
                     <p className="text-sm text-muted-foreground">
                        {order.customer.company.industry} • Tax ID: {order.customer.company.taxId}
                     </p>
                  </div>
               )}
               <div>
                  <p className="text-sm font-medium text-muted-foreground">Shipping Address</p>
                  <div className="text-sm">
                     <p>{order.shippingAddress.address}</p>
                     <p>
                        {order.shippingAddress.city}, {order.shippingAddress.province}{' '}
                        {order.shippingAddress.postalCode}
                     </p>
                     <p>{order.shippingAddress.country}</p>
                  </div>
               </div>
            </CardContent>
            <CardFooter>
               <Link
                  href={`/customers/${order.customer.id}`}
                  className="text-sm underline text-muted-foreground transition-colors hover:text-primary"
               >
                  View customer profile
               </Link>
            </CardFooter>
         </Card>
      )
   }

   function OrderItemsCard() {
      return (
         <Card>
            <CardHeader>
               <CardTitle>Order Items</CardTitle>
               <CardDescription>{order.items.length} items in this order</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {order.items.map((item) => (
                     <div key={item.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex-1">
                           <p className="font-medium">{item.product.name}</p>
                           <p className="text-sm text-muted-foreground">
                              {item.product.brand.name} • SKU: {item.product.sku}
                           </p>
                           <p className="text-sm">
                              Quantity: {item.quantity} × {formatIDR(item.unitPrice)}
                           </p>
                        </div>
                        <div className="text-right">
                           <p className="font-medium">{formatIDR(item.totalPrice)}</p>
                        </div>
                     </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 border-t">
                     <p className="font-medium">Total</p>
                     <p className="text-xl font-bold">{formatIDR(order.totalAmount)}</p>
                  </div>
               </div>
            </CardContent>
         </Card>
      )
   }

   function OrderManagementCard() {
      return (
         <Card>
            <CardHeader>
               <CardTitle>Order Management</CardTitle>
               <CardDescription>Update order status and manage fulfillment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <OrderStatusUpdate order={order} />
               <Separator />
               <TrackingNumberForm order={order} />
               <Separator />
               <InvoiceManagement order={order} />
            </CardContent>
         </Card>
      )
   }

   function StatusHistoryCard() {
      return (
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Status History
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {order.statusLogs.map((log) => (
                     <div key={log.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        <div className="flex-1">
                           <div className="flex items-center gap-2">
                              <Badge variant={getStatusVariant(log.toStatus)}>
                                 {log.fromStatus && `${log.fromStatus} → `}{log.toStatus}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                 by {log.adminUser.name}
                              </span>
                           </div>
                           <p className="text-sm text-muted-foreground">
                              {format(log.createdAt, 'PPP p')}
                           </p>
                           {log.notes && (
                              <p className="text-sm mt-1">{log.notes}</p>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      )
   }

   return (
      <div className="flex-col">
         <div className="flex-1 pt-6 pb-12 space-y-6">
            <div className="flex items-center justify-between">
               <Heading
                  title="Order Details"
                  description="Manage order fulfillment and track status changes"
               />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="space-y-6">
                  <OrderOverviewCard />
                  <CustomerCard />
                  <OrderItemsCard />
               </div>
               
               <div className="space-y-6">
                  <OrderManagementCard />
                  <StatusHistoryCard />
               </div>
            </div>
         </div>
      </div>
   )
}

export default OrderDetailPage
