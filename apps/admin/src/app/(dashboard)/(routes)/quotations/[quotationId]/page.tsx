import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { quotationManager } from '@/lib/services/quotation-manager'
import { QuotationStatus } from '@prisma/client'
import { format } from 'date-fns'
import { ArrowLeft, Package, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { QuotationActions } from './components/quotation-actions'
import { QuotationStatusLog } from './components/quotation-status-log'

interface QuotationDetailPageProps {
  params: {
    quotationId: string
  }
}

// Helper function to format IDR currency
const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100) // Convert from cents to rupiah
}

// Helper function to get status badge variant
const getStatusBadgeVariant = (status: QuotationStatus) => {
  switch (status) {
    case QuotationStatus.PENDING:
      return 'outline'
    case QuotationStatus.APPROVED:
      return 'default'
    case QuotationStatus.REJECTED:
      return 'destructive'
    case QuotationStatus.CONVERTED:
      return 'secondary'
    case QuotationStatus.EXPIRED:
      return 'outline'
    default:
      return 'outline'
  }
}

export default async function QuotationDetailPage({ params }: QuotationDetailPageProps) {
  const quotation = await quotationManager.getQuotationById(params.quotationId)

  if (!quotation) {
    notFound()
  }

  const isExpired = new Date() > quotation.validUntil

  return (
    <div className="block space-y-6 my-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/quotations">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotations
          </Button>
        </Link>
        <div className="flex-1">
          <Heading
            title={`Quotation ${quotation.quotationNumber}`}
            description={`Created on ${format(quotation.createdAt, 'MMMM dd, yyyy')}`}
          />
        </div>
        <Badge variant={getStatusBadgeVariant(quotation.status)} className="text-sm">
          {quotation.status}
        </Badge>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{quotation.customer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="font-medium">{quotation.customer.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">{quotation.customer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="font-medium">{quotation.customer.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {quotation.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p>{quotation.shippingAddress.address}</p>
                  <p>
                    {quotation.shippingAddress.city}, {quotation.shippingAddress.province}{' '}
                    {quotation.shippingAddress.postalCode}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quotation Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items ({quotation.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotation.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {item.product.images[0] && (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                        <p className="text-sm">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatIDR(item.totalPrice)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatIDR(item.unitPrice)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quotation.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{quotation.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quotation Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Quotation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatIDR(quotation.subtotal)}</span>
                </div>
                {quotation.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatIDR(quotation.taxAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatIDR(quotation.totalAmount)}</span>
                </div>
              </div>
              
              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valid Until</span>
                  <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                    {format(quotation.validUntil, 'MMM dd, yyyy')}
                  </span>
                </div>
                {isExpired && (
                  <p className="text-sm text-red-600">This quotation has expired</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <QuotationActions quotation={quotation} />

          {/* Status Log */}
          <QuotationStatusLog quotation={quotation} />
        </div>
      </div>
    </div>
  )
}