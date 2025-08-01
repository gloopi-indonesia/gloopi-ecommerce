import { Badge } from '@/components/ui/badge'
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { TaxInvoiceGenerator } from '@/components/tax-invoice-generator'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { CheckIcon, FileTextIcon, XIcon } from 'lucide-react'
import Link from 'next/link'

const InvoiceDetailPage = async ({ params }: { params: { invoiceId: string } }) => {
   const invoice = await prisma.invoice.findUnique({
      where: {
         id: params.invoiceId,
      },
      include: {
         customer: {
            include: {
               company: true,
            },
         },
         order: {
            include: {
               quotation: true,
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
         taxInvoice: true,
      },
   })

   if (!invoice) {
      return (
         <div className="flex-col">
            <div className="flex-1 pt-6 pb-12">
               <Heading title="Invoice Not Found" description="The requested invoice could not be found." />
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

   // Helper function to get invoice status badge variant
   function getInvoiceStatusVariant(status: string) {
      switch (status) {
         case 'PENDING':
            return 'secondary'
         case 'PAID':
            return 'default'
         case 'OVERDUE':
            return 'destructive'
         case 'CANCELLED':
            return 'outline'
         default:
            return 'secondary'
      }
   }

   return (
      <div className="flex-col">
         <div className="flex-1 pt-6 pb-12 space-y-6">
            <div className="flex items-center justify-between">
               <Heading
                  title={`Invoice ${invoice.invoiceNumber}`}
                  description="Invoice details and payment information"
               />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="space-y-6">
                  <Card>
                     <CardHeader>
                        <div className="flex items-center justify-between">
                           <div>
                              <CardTitle className="flex items-center gap-2">
                                 <FileTextIcon className="w-5 h-5" />
                                 {invoice.invoiceNumber}
                              </CardTitle>
                              <CardDescription>
                                 From order {invoice.order.quotation.quotationNumber}
                              </CardDescription>
                           </div>
                           <Badge variant={getInvoiceStatusVariant(invoice.status)}>
                              {invoice.status === 'PAID' && <CheckIcon className="w-3 h-3 mr-1" />}
                              {invoice.status === 'OVERDUE' && <XIcon className="w-3 h-3 mr-1" />}
                              {invoice.status}
                           </Badge>
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                              <p className="text-2xl font-bold">{formatIDR(invoice.totalAmount)}</p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                              <p className="text-sm">{format(invoice.dueDate, 'PPP')}</p>
                           </div>
                        </div>
                        {invoice.paidAt && (
                           <div>
                              <p className="text-sm font-medium text-muted-foreground">Paid On</p>
                              <p className="text-sm">{format(invoice.paidAt, 'PPP')}</p>
                              {invoice.paymentMethod && (
                                 <p className="text-sm text-muted-foreground">
                                    via {invoice.paymentMethod.replace('_', ' ')}
                                 </p>
                              )}
                           </div>
                        )}
                     </CardContent>
                  </Card>

                  <Card>
                     <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <p className="text-sm font-medium text-muted-foreground">Name</p>
                              <p className="font-medium">{invoice.customer.name}</p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-muted-foreground">Type</p>
                              <Badge variant="outline">{invoice.customer.type}</Badge>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-muted-foreground">Email</p>
                              <p className="text-sm">{invoice.customer.email}</p>
                           </div>
                           <div>
                              <p className="text-sm font-medium text-muted-foreground">Phone</p>
                              <p className="text-sm">{invoice.customer.phone}</p>
                           </div>
                        </div>
                        {invoice.customer.company && (
                           <div>
                              <p className="text-sm font-medium text-muted-foreground">Company</p>
                              <p className="font-medium">{invoice.customer.company.name}</p>
                              <p className="text-sm text-muted-foreground">
                                 Tax ID: {invoice.customer.company.taxId}
                              </p>
                           </div>
                        )}
                     </CardContent>
                  </Card>
               </div>
               
               <div className="space-y-6">
                  <Card>
                     <CardHeader>
                        <CardTitle>Invoice Items</CardTitle>
                        <CardDescription>{invoice.items.length} items</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-4">
                           {invoice.items.map((item) => (
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
                              <p className="text-xl font-bold">{formatIDR(invoice.totalAmount)}</p>
                           </div>
                        </div>
                     </CardContent>
                  </Card>

                  <Card>
                     <CardHeader>
                        <div className="flex items-center justify-between">
                           <div>
                              <CardTitle>Tax Invoice (PPN)</CardTitle>
                              <CardDescription>Indonesian tax invoice details</CardDescription>
                           </div>
                           {!invoice.taxInvoice && (
                              <TaxInvoiceGenerator 
                                 invoice={{
                                    id: invoice.id,
                                    invoiceNumber: invoice.invoiceNumber,
                                    status: invoice.status,
                                    totalAmount: invoice.totalAmount,
                                    customer: {
                                       id: invoice.customer.id,
                                       name: invoice.customer.name,
                                       type: invoice.customer.type,
                                       companyId: invoice.customer.companyId,
                                       company: invoice.customer.company ? {
                                          id: invoice.customer.company.id,
                                          name: invoice.customer.company.name,
                                          taxId: invoice.customer.company.taxId,
                                          registrationNumber: invoice.customer.company.registrationNumber
                                       } : undefined
                                    },
                                    taxInvoiceRequested: invoice.taxInvoiceRequested
                                 }}
                                 onTaxInvoiceCreated={() => {
                                    // Refresh the page to show the new tax invoice
                                    window.location.reload()
                                 }}
                              />
                           )}
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        {invoice.taxInvoice ? (
                           <>
                              <div>
                                 <p className="text-sm font-medium text-muted-foreground">Tax Invoice Number</p>
                                 <p className="font-medium">{invoice.taxInvoice.taxInvoiceNumber}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <p className="text-sm font-medium text-muted-foreground">PPN Rate</p>
                                    <p className="text-sm">{(invoice.taxInvoice.ppnRate * 100).toFixed(0)}%</p>
                                 </div>
                                 <div>
                                    <p className="text-sm font-medium text-muted-foreground">PPN Amount</p>
                                    <p className="text-sm">{formatIDR(invoice.taxInvoice.ppnAmount)}</p>
                                 </div>
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-muted-foreground">Total with PPN</p>
                                 <p className="text-lg font-bold">{formatIDR(invoice.taxInvoice.totalWithPPN)}</p>
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-muted-foreground">Issued</p>
                                 <p className="text-sm">{format(invoice.taxInvoice.issuedAt, 'PPP')}</p>
                              </div>
                              <div className="flex gap-2">
                                 <Link 
                                    href={`/tax-invoices/${invoice.taxInvoice.id}`}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                                 >
                                    <FileTextIcon className="h-4 w-4 mr-2" />
                                    View Details
                                 </Link>
                                 <a 
                                    href={`/api/tax-invoices/${invoice.taxInvoice.id}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                                 >
                                    <FileTextIcon className="h-4 w-4 mr-2" />
                                    Download PDF
                                 </a>
                              </div>
                           </>
                        ) : (
                           <div className="text-center py-8">
                              <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">
                                 {invoice.taxInvoiceRequested 
                                    ? 'Tax invoice has been requested and is being processed'
                                    : 'No tax invoice has been created for this invoice'
                                 }
                              </p>
                           </div>
                        )}
                     </CardContent>
                  </Card>
               </div>
            </div>
         </div>
      </div>
   )
}

export default InvoiceDetailPage