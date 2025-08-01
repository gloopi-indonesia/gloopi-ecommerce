'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CheckIcon, FileTextIcon, Loader2Icon, PlusIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as z from 'zod'

const invoiceFormSchema = z.object({
   dueDate: z.string().min(1, 'Due date is required'),
})

const paymentFormSchema = z.object({
   paymentMethod: z.string().min(1, 'Payment method is required'),
   paymentNotes: z.string().optional(),
})

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>
type PaymentFormValues = z.infer<typeof paymentFormSchema>

interface InvoiceManagementProps {
   order: {
      id: string
      totalAmount: number
      invoice?: {
         id: string
         invoiceNumber: string
         status: string
         dueDate: Date
         paidAt?: Date | null
         paymentMethod?: string | null
         paymentNotes?: string | null
         taxInvoiceRequested: boolean
      } | null
   }
}

export const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ order }) => {
   const router = useRouter()
   const [loading, setLoading] = useState(false)
   const [showPaymentForm, setShowPaymentForm] = useState(false)

   const invoiceForm = useForm<InvoiceFormValues>({
      resolver: zodResolver(invoiceFormSchema),
      defaultValues: {
         dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days from now
      },
   })

   const paymentForm = useForm<PaymentFormValues>({
      resolver: zodResolver(paymentFormSchema),
      defaultValues: {
         paymentMethod: '',
         paymentNotes: '',
      },
   })

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

   const onCreateInvoice = async (data: InvoiceFormValues) => {
      try {
         setLoading(true)

         const response = await fetch(`/api/orders/${order.id}/invoice`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
         })

         if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to create invoice')
         }

         toast.success('Invoice created successfully')
         router.refresh()
      } catch (error) {
         console.error('Error creating invoice:', error)
         toast.error(error instanceof Error ? error.message : 'Something went wrong')
      } finally {
         setLoading(false)
      }
   }

   const onMarkAsPaid = async (data: PaymentFormValues) => {
      try {
         setLoading(true)

         const response = await fetch(`/api/invoices/${order.invoice?.id}/payment`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
         })

         if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to mark invoice as paid')
         }

         toast.success('Invoice marked as paid successfully')
         setShowPaymentForm(false)
         router.refresh()
      } catch (error) {
         console.error('Error marking invoice as paid:', error)
         toast.error(error instanceof Error ? error.message : 'Something went wrong')
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="space-y-4">
         <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
               <FileTextIcon className="w-5 h-5" />
               Invoice Management
            </h3>
            <p className="text-sm text-muted-foreground">
               Generate and manage invoices for this order
            </p>
         </div>

         {!order.invoice ? (
            // Create Invoice Form
            <div className="space-y-4">
               <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">No invoice generated yet</p>
                  <p className="text-sm text-muted-foreground">
                     Create an invoice for this order to track payment status
                  </p>
               </div>

               <Form {...invoiceForm}>
                  <form onSubmit={invoiceForm.handleSubmit(onCreateInvoice)} className="space-y-4">
                     <FormField
                        control={invoiceForm.control}
                        name="dueDate"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Due Date</FormLabel>
                              <FormControl>
                                 <Input
                                    type="date"
                                    disabled={loading}
                                    {...field}
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                     <Button type="submit" disabled={loading}>
                        {loading ? (
                           <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                           <PlusIcon className="w-4 h-4 mr-2" />
                        )}
                        Generate Invoice
                     </Button>
                  </form>
               </Form>
            </div>
         ) : (
            // Invoice Details and Management
            <div className="space-y-4">
               <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                     <div>
                        <p className="font-medium">{order.invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                           Due: {format(new Date(order.invoice.dueDate), 'PPP')}
                        </p>
                     </div>
                     <Badge variant={getInvoiceStatusVariant(order.invoice.status)}>
                        {order.invoice.status === 'PAID' && <CheckIcon className="w-3 h-3 mr-1" />}
                        {order.invoice.status === 'OVERDUE' && <XIcon className="w-3 h-3 mr-1" />}
                        {order.invoice.status}
                     </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-medium">{formatIDR(order.totalAmount)}</p>
                     </div>
                     <div>
                        <p className="text-muted-foreground">Tax Invoice Requested</p>
                        <p className="font-medium">
                           {order.invoice.taxInvoiceRequested ? 'Yes' : 'No'}
                        </p>
                     </div>
                  </div>

                  {order.invoice.paidAt && (
                     <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">
                           Paid on {format(new Date(order.invoice.paidAt), 'PPP')}
                        </p>
                        {order.invoice.paymentMethod && (
                           <p className="text-sm">
                              Payment method: {order.invoice.paymentMethod}
                           </p>
                        )}
                        {order.invoice.paymentNotes && (
                           <p className="text-sm text-muted-foreground">
                              Notes: {order.invoice.paymentNotes}
                           </p>
                        )}
                     </div>
                  )}
               </div>

               <div className="flex gap-2">
                  <Link href={`/invoices/${order.invoice.id}`}>
                     <Button variant="outline" size="sm">
                        <FileTextIcon className="w-4 h-4 mr-1" />
                        View Invoice
                     </Button>
                  </Link>

                  {order.invoice.status === 'PENDING' && (
                     <Button
                        variant="default"
                        size="sm"
                        onClick={() => setShowPaymentForm(!showPaymentForm)}
                     >
                        <CheckIcon className="w-4 h-4 mr-1" />
                        Mark as Paid
                     </Button>
                  )}
               </div>

               {showPaymentForm && order.invoice.status === 'PENDING' && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                     <h4 className="font-medium mb-3">Mark Invoice as Paid</h4>
                     <Form {...paymentForm}>
                        <form onSubmit={paymentForm.handleSubmit(onMarkAsPaid)} className="space-y-4">
                           <FormField
                              control={paymentForm.control}
                              name="paymentMethod"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Payment Method</FormLabel>
                                    <Select
                                       disabled={loading}
                                       onValueChange={field.onChange}
                                       value={field.value}
                                    >
                                       <FormControl>
                                          <SelectTrigger>
                                             <SelectValue placeholder="Select payment method" />
                                          </SelectTrigger>
                                       </FormControl>
                                       <SelectContent>
                                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                          <SelectItem value="cash">Cash</SelectItem>
                                          <SelectItem value="check">Check</SelectItem>
                                          <SelectItem value="other">Other</SelectItem>
                                       </SelectContent>
                                    </Select>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />

                           <FormField
                              control={paymentForm.control}
                              name="paymentNotes"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Payment Notes (Optional)</FormLabel>
                                    <FormControl>
                                       <Textarea
                                          disabled={loading}
                                          placeholder="Add any notes about the payment..."
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />

                           <div className="flex gap-2">
                              <Button type="submit" disabled={loading}>
                                 {loading ? (
                                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                                 ) : (
                                    <CheckIcon className="w-4 h-4 mr-2" />
                                 )}
                                 Confirm Payment
                              </Button>
                              <Button
                                 type="button"
                                 variant="outline"
                                 onClick={() => setShowPaymentForm(false)}
                              >
                                 Cancel
                              </Button>
                           </div>
                        </form>
                     </Form>
                  </div>
               )}
            </div>
         )}
      </div>
   )
}