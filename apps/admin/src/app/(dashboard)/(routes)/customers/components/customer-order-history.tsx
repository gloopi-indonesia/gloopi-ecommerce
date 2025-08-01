'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Package, Truck } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface OrderItem {
   id: string
   quantity: number
   unitPrice: number
   totalPrice: number
   product: {
      id: string
      name: string
      sku: string
   }
}

interface Invoice {
   id: string
   invoiceNumber: string
   status: string
   totalAmount: number
   dueDate: Date
   paidAt: Date | null
}

interface Order {
   id: string
   orderNumber: string
   status: string
   totalAmount: number
   trackingNumber: string | null
   shippedAt: Date | null
   deliveredAt: Date | null
   createdAt: Date
   items: OrderItem[]
   invoice: Invoice | null
}

interface CustomerOrderHistoryProps {
   orders: Order[]
}

const getStatusColor = (status: string) => {
   switch (status) {
      case 'NEW':
         return 'bg-blue-100 text-blue-800'
      case 'PROCESSING':
         return 'bg-yellow-100 text-yellow-800'
      case 'SHIPPED':
         return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
         return 'bg-green-100 text-green-800'
      case 'CANCELLED':
         return 'bg-red-100 text-red-800'
      default:
         return 'bg-gray-100 text-gray-800'
   }
}

const getInvoiceStatusColor = (status: string) => {
   switch (status) {
      case 'PENDING':
         return 'bg-yellow-100 text-yellow-800'
      case 'PAID':
         return 'bg-green-100 text-green-800'
      case 'OVERDUE':
         return 'bg-red-100 text-red-800'
      case 'CANCELLED':
         return 'bg-gray-100 text-gray-800'
      default:
         return 'bg-gray-100 text-gray-800'
   }
}

export function CustomerOrderHistory({ orders }: CustomerOrderHistoryProps) {
   if (orders.length === 0) {
      return (
         <Card>
            <CardContent className="flex items-center justify-center py-8">
               <div className="text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No orders yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                     This customer hasn't placed any orders.
                  </p>
               </div>
            </CardContent>
         </Card>
      )
   }

   return (
      <div className="space-y-4">
         {orders.map((order) => (
            <Card key={order.id}>
               <CardHeader>
                  <div className="flex items-center justify-between">
                     <div>
                        <CardTitle className="text-lg">
                           Order #{order.orderNumber}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                           Placed on {format(order.createdAt, 'MMM dd, yyyy')}
                        </p>
                     </div>
                     <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(order.status)}>
                           {order.status.toLowerCase()}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/orders/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                           </Link>
                        </Button>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                     <div>
                        <h4 className="font-medium mb-2">Order Details</h4>
                        <div className="space-y-1 text-sm">
                           <div className="flex justify-between">
                              <span>Total Amount:</span>
                              <span className="font-medium">
                                 Rp {(order.totalAmount / 100).toLocaleString('id-ID')}
                              </span>
                           </div>
                           <div className="flex justify-between">
                              <span>Items:</span>
                              <span>{order.items.length} products</span>
                           </div>
                           {order.trackingNumber && (
                              <div className="flex justify-between">
                                 <span>Tracking:</span>
                                 <span className="font-mono text-xs">
                                    {order.trackingNumber}
                                 </span>
                              </div>
                           )}
                        </div>
                     </div>
                     
                     <div>
                        <h4 className="font-medium mb-2">Invoice Status</h4>
                        {order.invoice ? (
                           <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                 <span>Invoice #:</span>
                                 <Link 
                                    href={`/invoices/${order.invoice.id}`}
                                    className="text-blue-600 hover:underline"
                                 >
                                    {order.invoice.invoiceNumber}
                                 </Link>
                              </div>
                              <div className="flex justify-between">
                                 <span>Status:</span>
                                 <Badge className={getInvoiceStatusColor(order.invoice.status)}>
                                    {order.invoice.status.toLowerCase()}
                                 </Badge>
                              </div>
                              <div className="flex justify-between">
                                 <span>Due Date:</span>
                                 <span>{format(order.invoice.dueDate, 'MMM dd, yyyy')}</span>
                              </div>
                              {order.invoice.paidAt && (
                                 <div className="flex justify-between">
                                    <span>Paid On:</span>
                                    <span>{format(order.invoice.paidAt, 'MMM dd, yyyy')}</span>
                                 </div>
                              )}
                           </div>
                        ) : (
                           <p className="text-sm text-muted-foreground">No invoice generated</p>
                        )}
                     </div>
                  </div>

                  <div>
                     <h4 className="font-medium mb-2">Order Items</h4>
                     <div className="space-y-2">
                        {order.items.map((item) => (
                           <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                              <div>
                                 <p className="font-medium">{item.product.name}</p>
                                 <p className="text-sm text-muted-foreground">
                                    SKU: {item.product.sku}
                                 </p>
                              </div>
                              <div className="text-right">
                                 <p className="font-medium">
                                    {item.quantity} × Rp {(item.unitPrice / 100).toLocaleString('id-ID')}
                                 </p>
                                 <p className="text-sm text-muted-foreground">
                                    Rp {(item.totalPrice / 100).toLocaleString('id-ID')}
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {(order.shippedAt || order.deliveredAt) && (
                     <div className="flex items-center gap-4 pt-2 border-t">
                        {order.shippedAt && (
                           <div className="flex items-center gap-2 text-sm">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <span>Shipped: {format(order.shippedAt, 'MMM dd, yyyy')}</span>
                           </div>
                        )}
                        {order.deliveredAt && (
                           <div className="flex items-center gap-2 text-sm">
                              <Package className="h-4 w-4 text-green-600" />
                              <span>Delivered: {format(order.deliveredAt, 'MMM dd, yyyy')}</span>
                           </div>
                        )}
                     </div>
                  )}
               </CardContent>
            </Card>
         ))}
      </div>
   )
}