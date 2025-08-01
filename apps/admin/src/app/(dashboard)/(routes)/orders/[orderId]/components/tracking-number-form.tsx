'use client'

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
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon, SaveIcon, TruckIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   trackingNumber: z.string().min(1, 'Tracking number is required'),
})

type FormValues = z.infer<typeof formSchema>

interface TrackingNumberFormProps {
   order: {
      id: string
      trackingNumber?: string | null
      status: string
   }
}

export const TrackingNumberForm: React.FC<TrackingNumberFormProps> = ({ order }) => {
   const router = useRouter()
   const [loading, setLoading] = useState(false)

   const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         trackingNumber: order.trackingNumber || '',
      },
   })

   const onSubmit = async (data: FormValues) => {
      try {
         setLoading(true)

         const response = await fetch(`/api/orders/${order.id}/tracking`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
         })

         if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to update tracking number')
         }

         toast.success('Tracking number updated successfully')
         router.refresh()
      } catch (error) {
         console.error('Error updating tracking number:', error)
         toast.error(error instanceof Error ? error.message : 'Something went wrong')
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="space-y-4">
         <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
               <TruckIcon className="w-5 h-5" />
               Tracking Number
            </h3>
            <p className="text-sm text-muted-foreground">
               Add or update the shipping tracking number (resi) for this order
            </p>
         </div>

         {order.trackingNumber && (
            <div className="p-3 bg-muted rounded-lg">
               <p className="text-sm font-medium">Current Tracking Number:</p>
               <p className="font-mono text-sm">{order.trackingNumber}</p>
            </div>
         )}

         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                  control={form.control}
                  name="trackingNumber"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>
                           {order.trackingNumber ? 'Update Tracking Number' : 'Add Tracking Number'}
                        </FormLabel>
                        <FormControl>
                           <Input
                              disabled={loading}
                              placeholder="Enter tracking number (e.g., JNE123456789)"
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
                  {order.trackingNumber ? 'Update' : 'Add'} Tracking Number
               </Button>
            </form>
         </Form>

         {order.status === 'PROCESSING' && order.trackingNumber && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
               <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> You can now update the order status to "SHIPPED" since a tracking number is available.
               </p>
            </div>
         )}
      </div>
   )
}