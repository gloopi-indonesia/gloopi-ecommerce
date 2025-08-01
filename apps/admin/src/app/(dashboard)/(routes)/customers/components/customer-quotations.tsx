'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface QuotationItem {
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

interface Quotation {
   id: string
   quotationNumber: string
   status: string
   totalAmount: number
   validUntil: Date
   notes: string | null
   convertedOrderId: string | null
   createdAt: Date
   items: QuotationItem[]
}

interface CustomerQuotationsProps {
   quotations: Quotation[]
}

const getStatusColor = (status: string) => {
   switch (status) {
      case 'PENDING':
         return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
         return 'bg-green-100 text-green-800'
      case 'REJECTED':
         return 'bg-red-100 text-red-800'
      case 'CONVERTED':
         return 'bg-blue-100 text-blue-800'
      case 'EXPIRED':
         return 'bg-gray-100 text-gray-800'
      default:
         return 'bg-gray-100 text-gray-800'
   }
}

const isExpired = (validUntil: Date) => {
   return new Date() > validUntil
}

export function CustomerQuotations({ quotations }: CustomerQuotationsProps) {
   if (quotations.length === 0) {
      return (
         <Card>
            <CardContent className="flex items-center justify-center py-8">
               <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No quotations yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                     This customer hasn't requested any quotations.
                  </p>
               </div>
            </CardContent>
         </Card>
      )
   }

   return (
      <div className="space-y-4">
         {quotations.map((quotation) => (
            <Card key={quotation.id}>
               <CardHeader>
                  <div className="flex items-center justify-between">
                     <div>
                        <CardTitle className="text-lg">
                           Quotation #{quotation.quotationNumber}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                           Created on {format(quotation.createdAt, 'MMM dd, yyyy')}
                        </p>
                     </div>
                     <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(quotation.status)}>
                           {quotation.status.toLowerCase()}
                        </Badge>
                        {isExpired(quotation.validUntil) && quotation.status === 'PENDING' && (
                           <Badge variant="destructive">Expired</Badge>
                        )}
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/quotations/${quotation.id}`}>
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
                        <h4 className="font-medium mb-2">Quotation Details</h4>
                        <div className="space-y-1 text-sm">
                           <div className="flex justify-between">
                              <span>Total Amount:</span>
                              <span className="font-medium">
                                 Rp {(quotation.totalAmount / 100).toLocaleString('id-ID')}
                              </span>
                           </div>
                           <div className="flex justify-between">
                              <span>Items:</span>
                              <span>{quotation.items.length} products</span>
                           </div>
                           <div className="flex justify-between">
                              <span>Valid Until:</span>
                              <span className={isExpired(quotation.validUntil) ? 'text-red-600' : ''}>
                                 {format(quotation.validUntil, 'MMM dd, yyyy')}
                              </span>
                           </div>
                        </div>
                     </div>
                     
                     <div>
                        <h4 className="font-medium mb-2">Status Information</h4>
                        <div className="space-y-1 text-sm">
                           {quotation.convertedOrderId && (
                              <div className="flex items-center gap-2">
                                 <span>Converted to Order:</span>
                                 <Link 
                                    href={`/orders/${quotation.convertedOrderId}`}
                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                 >
                                    View Order
                                    <ArrowRight className="h-3 w-3" />
                                 </Link>
                              </div>
                           )}
                           {quotation.notes && (
                              <div>
                                 <span className="font-medium">Notes:</span>
                                 <p className="text-muted-foreground mt-1">
                                    {quotation.notes}
                                 </p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  <div>
                     <h4 className="font-medium mb-2">Quoted Items</h4>
                     <div className="space-y-2">
                        {quotation.items.map((item) => (
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

                  {quotation.status === 'PENDING' && !isExpired(quotation.validUntil) && (
                     <div className="flex gap-2 pt-2 border-t">
                        <Button size="sm" asChild>
                           <Link href={`/quotations/${quotation.id}/approve`}>
                              Approve Quotation
                           </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/quotations/${quotation.id}/reject`}>
                              Reject Quotation
                           </Link>
                        </Button>
                     </div>
                  )}
               </CardContent>
            </Card>
         ))}
      </div>
   )
}