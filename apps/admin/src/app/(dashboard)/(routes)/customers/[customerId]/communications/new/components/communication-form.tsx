'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { 
   MessageCircle, 
   Phone, 
   Mail, 
   MessageSquare,
   Send,
   ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

interface Customer {
   id: string
   name: string
   email: string
   phone: string
   type: 'B2B' | 'B2C'
   company?: {
      name: string
   } | null
}

interface Quotation {
   id: string
   quotationNumber: string
   status: string
   totalAmount: number
   createdAt: Date
}

interface CommunicationFormProps {
   customer: Customer
   quotations: Quotation[]
}

const communicationSchema = z.object({
   type: z.enum(['WHATSAPP', 'PHONE', 'EMAIL', 'SMS']),
   method: z.enum(['template', 'text']),
   templateName: z.string().optional(),
   message: z.string().optional(),
   quotationId: z.string().optional(),
   scheduleFollowUp: z.boolean().default(false),
   followUpDate: z.string().optional(),
   followUpNotes: z.string().optional(),
}).refine((data) => {
   if (data.method === 'template' && !data.templateName) {
      return false
   }
   if (data.method === 'text' && !data.message) {
      return false
   }
   if (data.scheduleFollowUp && !data.followUpDate) {
      return false
   }
   return true
}, {
   message: "Please fill in all required fields"
})

type CommunicationFormData = z.infer<typeof communicationSchema>

const messageTemplates = {
   quotation_approved: {
      name: 'Quotation Approved',
      description: 'Notify customer that their quotation has been approved',
      parameters: ['Customer Name', 'Quotation Number', 'Total Amount']
   },
   quotation_follow_up: {
      name: 'Quotation Follow-up',
      description: 'Follow up on pending quotation',
      parameters: ['Customer Name', 'Quotation Number']
   },
   order_shipped: {
      name: 'Order Shipped',
      description: 'Notify customer that order has been shipped',
      parameters: ['Order Number', 'Tracking Number']
   },
   payment_reminder: {
      name: 'Payment Reminder',
      description: 'Remind customer about pending payment',
      parameters: ['Customer Name', 'Invoice Number', 'Amount', 'Due Date']
   }
}

export function CommunicationForm({ customer, quotations }: CommunicationFormProps) {
   const router = useRouter()
   const [isLoading, setIsLoading] = useState(false)
   const [_selectedTemplate, setSelectedTemplate] = useState<string>('')

   const form = useForm<CommunicationFormData>({
      resolver: zodResolver(communicationSchema),
      defaultValues: {
         type: 'WHATSAPP',
         method: 'template',
         scheduleFollowUp: false,
      },
   })

   const watchType = form.watch('type')
   const watchMethod = form.watch('method')
   const watchScheduleFollowUp = form.watch('scheduleFollowUp')

   const onSubmit = async (data: CommunicationFormData) => {
      try {
         setIsLoading(true)

         // Send the communication
         const response = await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               to: customer.phone,
               type: data.method,
               templateName: data.templateName,
               message: data.message,
               customerId: customer.id,
               quotationId: data.quotationId,
               parameters: getTemplateParameters(data.templateName, data.quotationId),
            }),
         })

         if (!response.ok) {
            throw new Error('Failed to send message')
         }

         // Schedule follow-up if requested
         if (data.scheduleFollowUp && data.followUpDate) {
            const followUpResponse = await fetch('/api/follow-ups', {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                  customerId: customer.id,
                  quotationId: data.quotationId,
                  type: 'QUOTATION_FOLLOW_UP',
                  scheduledAt: new Date(data.followUpDate).toISOString(),
                  notes: data.followUpNotes,
               }),
            })

            if (!followUpResponse.ok) {
               console.error('Failed to schedule follow-up')
            }
         }

         toast.success('Message sent successfully!')
         router.push(`/customers/${customer.id}`)
         router.refresh()
      } catch (error) {
         console.error('Communication error:', error)
         toast.error('Failed to send message. Please try again.')
      } finally {
         setIsLoading(false)
      }
   }

   const getTemplateParameters = (templateName?: string, quotationId?: string) => {
      if (!templateName) return {}

      const quotation = quotations.find(q => q.id === quotationId)
      
      switch (templateName) {
         case 'quotation_approved':
            return {
               '1': customer.name,
               '2': quotation?.quotationNumber || '',
               '3': quotation ? `Rp ${(quotation.totalAmount / 100).toLocaleString('id-ID')}` : ''
            }
         case 'quotation_follow_up':
            return {
               '1': customer.name,
               '2': quotation?.quotationNumber || ''
            }
         case 'payment_reminder':
            return {
               '1': customer.name,
               '2': quotation?.quotationNumber || '',
               '3': quotation ? `Rp ${(quotation.totalAmount / 100).toLocaleString('id-ID')}` : '',
               '4': new Date().toLocaleDateString('id-ID')
            }
         default:
            return {}
      }
   }

   const _getCommunicationIcon = (type: string) => {
      switch (type) {
         case 'WHATSAPP':
            return <MessageCircle className="h-4 w-4" />
         case 'PHONE':
            return <Phone className="h-4 w-4" />
         case 'EMAIL':
            return <Mail className="h-4 w-4" />
         case 'SMS':
            return <MessageSquare className="h-4 w-4" />
         default:
            return <MessageCircle className="h-4 w-4" />
      }
   }

   return (
      <div className="max-w-2xl space-y-6">
         <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
               <Link href={`/customers/${customer.id}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Customer
               </Link>
            </Button>
         </div>

         <Card>
            <CardHeader>
               <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between">
                  <div>
                     <h3 className="font-medium">{customer.name}</h3>
                     <p className="text-sm text-muted-foreground">{customer.email}</p>
                     <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                     <Badge variant={customer.type === 'B2B' ? 'default' : 'secondary'}>
                        {customer.type}
                     </Badge>
                     {customer.company && (
                        <p className="text-sm text-muted-foreground mt-1">
                           {customer.company.name}
                        </p>
                     )}
                  </div>
               </div>
            </CardContent>
         </Card>

         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <Card>
                  <CardHeader>
                     <CardTitle>Communication Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Communication Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                 <FormControl>
                                    <SelectTrigger>
                                       <SelectValue placeholder="Select communication type" />
                                    </SelectTrigger>
                                 </FormControl>
                                 <SelectContent>
                                    <SelectItem value="WHATSAPP">
                                       <div className="flex items-center gap-2">
                                          <MessageCircle className="h-4 w-4" />
                                          WhatsApp
                                       </div>
                                    </SelectItem>
                                    <SelectItem value="PHONE">
                                       <div className="flex items-center gap-2">
                                          <Phone className="h-4 w-4" />
                                          Phone Call
                                       </div>
                                    </SelectItem>
                                    <SelectItem value="EMAIL">
                                       <div className="flex items-center gap-2">
                                          <Mail className="h-4 w-4" />
                                          Email
                                       </div>
                                    </SelectItem>
                                    <SelectItem value="SMS">
                                       <div className="flex items-center gap-2">
                                          <MessageSquare className="h-4 w-4" />
                                          SMS
                                       </div>
                                    </SelectItem>
                                 </SelectContent>
                              </Select>
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                     {watchType === 'WHATSAPP' && (
                        <FormField
                           control={form.control}
                           name="method"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>Message Method</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                       <SelectTrigger>
                                          <SelectValue placeholder="Select message method" />
                                       </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                       <SelectItem value="template">Template Message</SelectItem>
                                       <SelectItem value="text">Custom Text</SelectItem>
                                    </SelectContent>
                                 </Select>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     )}

                     {watchMethod === 'template' && (
                        <FormField
                           control={form.control}
                           name="templateName"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>Message Template</FormLabel>
                                 <Select 
                                    onValueChange={(value) => {
                                       field.onChange(value)
                                       setSelectedTemplate(value)
                                    }} 
                                    defaultValue={field.value}
                                 >
                                    <FormControl>
                                       <SelectTrigger>
                                          <SelectValue placeholder="Select a template" />
                                       </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                       {Object.entries(messageTemplates).map(([key, template]) => (
                                          <SelectItem key={key} value={key}>
                                             <div>
                                                <div className="font-medium">{template.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                   {template.description}
                                                </div>
                                             </div>
                                          </SelectItem>
                                       ))}
                                    </SelectContent>
                                 </Select>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     )}

                     {watchMethod === 'text' && (
                        <FormField
                           control={form.control}
                           name="message"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>Message Content</FormLabel>
                                 <FormControl>
                                    <Textarea
                                       placeholder="Enter your message..."
                                       className="min-h-[100px]"
                                       {...field}
                                    />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     )}

                     {quotations.length > 0 && (
                        <FormField
                           control={form.control}
                           name="quotationId"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>Related Quotation (Optional)</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                       <SelectTrigger>
                                          <SelectValue placeholder="Select a quotation" />
                                       </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                       {quotations.map((quotation) => (
                                          <SelectItem key={quotation.id} value={quotation.id}>
                                             <div className="flex items-center justify-between w-full">
                                                <span>{quotation.quotationNumber}</span>
                                                <div className="flex items-center gap-2 ml-4">
                                                   <Badge variant="outline">
                                                      {quotation.status.toLowerCase()}
                                                   </Badge>
                                                   <span className="text-sm">
                                                      Rp {(quotation.totalAmount / 100).toLocaleString('id-ID')}
                                                   </span>
                                                </div>
                                             </div>
                                          </SelectItem>
                                       ))}
                                    </SelectContent>
                                 </Select>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     )}
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader>
                     <CardTitle>Follow-up Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="scheduleFollowUp"
                        render={({ field }) => (
                           <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                 <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                 />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                 <FormLabel>
                                    Schedule Follow-up Reminder
                                 </FormLabel>
                                 <p className="text-sm text-muted-foreground">
                                    Set a reminder to follow up with this customer
                                 </p>
                              </div>
                           </FormItem>
                        )}
                     />

                     {watchScheduleFollowUp && (
                        <>
                           <FormField
                              control={form.control}
                              name="followUpDate"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Follow-up Date</FormLabel>
                                    <FormControl>
                                       <Input
                                          type="datetime-local"
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />

                           <FormField
                              control={form.control}
                              name="followUpNotes"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Follow-up Notes (Optional)</FormLabel>
                                    <FormControl>
                                       <Textarea
                                          placeholder="Add notes for the follow-up..."
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </>
                     )}
                  </CardContent>
               </Card>

               <div className="flex items-center gap-4">
                  <Button type="submit" disabled={isLoading}>
                     {isLoading ? (
                        <>
                           <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                           Sending...
                        </>
                     ) : (
                        <>
                           <Send className="mr-2 h-4 w-4" />
                           Send Message
                        </>
                     )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                     <Link href={`/customers/${customer.id}`}>
                        Cancel
                     </Link>
                  </Button>
               </div>
            </form>
         </Form>
      </div>
   )
}