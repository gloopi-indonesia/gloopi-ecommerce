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
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon, SaveIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   status: z.enum(['NEW', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
   notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface OrderStatusUpdateProps {
   order: {
      id: string
      status: string
      trackingNumber?: string | null
   }
}

export const OrderStatusUpdate: React.FC<OrderStatusUpdateProps> = ({ order }) => {
   const router = useRouter()
   const [loading, setLoading] = useState(false)

   const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         status: order.status as FormValues['status'],
         notes: '',
      },
   })

   const onSubmit = async (data: FormValues) => {
      try {
         setLoading(true)

         // Validate status transition
         if (data.status === 'SHIPPED' && !order.trackingNumber) {
            toast.error('Please add a tracking number before marking as shipped')
            return
         }

         const response = await fetch(`/api/orders/${order.id}/status`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
         })

         if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to update order status')
         }

         toast.success('Order status updated successfully')
         router.refresh()
         form.reset({ status: data.status, notes: '' })
      } catch (error) {
         console.error('Error updating order status:', error)
         toast.error(error instanceof Error ? error.message : 'Something went wrong')
      } finally {
         setLoading(false)
      }
   }

   // Get available status transitions based on current status
   const getAvailableStatuses = (currentStatus: string) => {
      const statusFlow = {
         NEW: ['PROCESSING', 'CANCELLED'],
         PROCESSING: ['SHIPPED', 'CANCELLED'],
         SHIPPED: ['DELIVERED'],
         DELIVERED: [], // Final state
         CANCELLED: [], // Final state
      }
      
      return statusFlow[currentStatus as keyof typeof statusFlow] || []
   }

   const availableStatuses = getAvailableStatuses(order.status)

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

   return (
      <div className="space-y-4">
         <div>
            <h3 className="text-lg font-medium">Order Status</h3>
            <p className="text-sm text-muted-foreground">
               Update the order status to track fulfillment progress
            </p>
         </div>

         <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current Status:</span>
            <Badge variant={getStatusVariant(order.status)}>
               {order.status}
            </Badge>
         </div>

         {availableStatuses.length > 0 ? (
            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                     control={form.control}
                     name="status"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>New Status</FormLabel>
                           <Select
                              disabled={loading}
                              onValueChange={field.onChange}
                              value={field.value}
                           >
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Select new status" />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 {availableStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                       <div className="flex items-center gap-2">
                                          <Badge variant={getStatusVariant(status)} className="text-xs">
                                             {status}
                                          </Badge>
                                       </div>
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={form.control}
                     name="notes"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Notes (Optional)</FormLabel>
                           <FormControl>
                              <Textarea
                                 disabled={loading}
                                 placeholder="Add any notes about this status change..."
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
                        <SaveIcon className="w-4 h-4 mr-2" />
                     )}
                     Update Status
                  </Button>
               </form>
            </Form>
         ) : (
            <div className="text-sm text-muted-foreground">
               No status updates available. Order is in final state.
            </div>
         )}
      </div>
   )
}