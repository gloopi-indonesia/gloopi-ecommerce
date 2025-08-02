'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { 
   MessageCircle, 
   Phone, 
   CheckCircle, 
   X,
   User,
   Building2,
   FileText,
   Clock
} from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

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
}

interface FollowUp {
   id: string
   type: string
   scheduledAt: Date
   notes?: string | null
   customer: Customer
   quotation?: Quotation | null
}

interface TodaysFollowUpsProps {
   followUps: FollowUp[]
}

export function TodaysFollowUps({ followUps }: TodaysFollowUpsProps) {
   const router = useRouter()
   const [_completingId, _setCompletingId] = useState<string | null>(null)
   const [completionNotes, setCompletionNotes] = useState('')

   const handleCompleteFollowUp = async (followUpId: string, notes?: string) => {
      try {
         const response = await fetch(`/api/follow-ups/${followUpId}/complete`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notes }),
         })

         if (!response.ok) {
            throw new Error('Failed to complete follow-up')
         }

         toast.success('Follow-up marked as completed')
         router.refresh()
      } catch (error) {
         console.error('Error completing follow-up:', error)
         toast.error('Failed to complete follow-up')
      }
   }

   const handleCancelFollowUp = async (followUpId: string) => {
      try {
         const response = await fetch(`/api/follow-ups/${followUpId}/cancel`, {
            method: 'PATCH',
         })

         if (!response.ok) {
            throw new Error('Failed to cancel follow-up')
         }

         toast.success('Follow-up cancelled')
         router.refresh()
      } catch (error) {
         console.error('Error cancelling follow-up:', error)
         toast.error('Failed to cancel follow-up')
      }
   }

   const getFollowUpTypeIcon = (type: string) => {
      switch (type) {
         case 'QUOTATION_FOLLOW_UP':
            return <FileText className="h-4 w-4" />
         case 'PAYMENT_REMINDER':
            return <Clock className="h-4 w-4" />
         default:
            return <MessageCircle className="h-4 w-4" />
      }
   }

   const getFollowUpTypeColor = (type: string) => {
      switch (type) {
         case 'QUOTATION_FOLLOW_UP':
            return 'bg-blue-100 text-blue-800'
         case 'PAYMENT_REMINDER':
            return 'bg-orange-100 text-orange-800'
         case 'DELIVERY_UPDATE':
            return 'bg-green-100 text-green-800'
         default:
            return 'bg-gray-100 text-gray-800'
      }
   }

   if (followUps.length === 0) {
      return (
         <Card>
            <CardContent className="flex items-center justify-center py-8">
               <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-2 text-sm font-medium">All caught up!</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                     No follow-ups scheduled for today.
                  </p>
               </div>
            </CardContent>
         </Card>
      )
   }

   return (
      <div className="space-y-4">
         {followUps.map((followUp) => (
            <Card key={followUp.id}>
               <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           {getFollowUpTypeIcon(followUp.type)}
                           <Badge className={getFollowUpTypeColor(followUp.type)}>
                              {followUp.type.replace('_', ' ').toLowerCase()}
                           </Badge>
                           <span className="text-sm text-muted-foreground">
                              {format(followUp.scheduledAt, 'HH:mm')}
                           </span>
                        </div>

                        <div className="space-y-2">
                           <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <Link 
                                 href={`/customers/${followUp.customer.id}`}
                                 className="font-medium hover:underline"
                              >
                                 {followUp.customer.name}
                              </Link>
                              <Badge variant={followUp.customer.type === 'B2B' ? 'default' : 'secondary'}>
                                 {followUp.customer.type}
                              </Badge>
                           </div>

                           {followUp.customer.company && (
                              <div className="flex items-center gap-2">
                                 <Building2 className="h-4 w-4 text-muted-foreground" />
                                 <span className="text-sm text-muted-foreground">
                                    {followUp.customer.company.name}
                                 </span>
                              </div>
                           )}

                           <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{followUp.customer.phone}</span>
                           </div>

                           {followUp.quotation && (
                              <div className="flex items-center gap-2">
                                 <FileText className="h-4 w-4 text-muted-foreground" />
                                 <Link 
                                    href={`/quotations/${followUp.quotation.id}`}
                                    className="text-sm hover:underline"
                                 >
                                    {followUp.quotation.quotationNumber}
                                 </Link>
                                 <Badge variant="outline">
                                    {followUp.quotation.status.toLowerCase()}
                                 </Badge>
                                 <span className="text-sm text-muted-foreground">
                                    Rp {(followUp.quotation.totalAmount / 100).toLocaleString('id-ID')}
                                 </span>
                              </div>
                           )}

                           {followUp.notes && (
                              <div className="mt-2 p-2 bg-muted rounded text-sm">
                                 <strong>Notes:</strong> {followUp.notes}
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="flex items-center gap-2 ml-4">
                        <Button
                           size="sm"
                           variant="outline"
                           asChild
                        >
                           <Link href={`/customers/${followUp.customer.id}/communications/new?quotationId=${followUp.quotation?.id}`}>
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Contact
                           </Link>
                        </Button>

                        <Dialog>
                           <DialogTrigger asChild>
                              <Button size="sm" variant="default">
                                 <CheckCircle className="mr-2 h-4 w-4" />
                                 Complete
                              </Button>
                           </DialogTrigger>
                           <DialogContent>
                              <DialogHeader>
                                 <DialogTitle>Complete Follow-up</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                 <p className="text-sm text-muted-foreground">
                                    Mark this follow-up as completed and add any notes about the interaction.
                                 </p>
                                 <Textarea
                                    placeholder="Add completion notes (optional)..."
                                    value={completionNotes}
                                    onChange={(e) => setCompletionNotes(e.target.value)}
                                 />
                                 <div className="flex justify-end gap-2">
                                    <Button
                                       variant="outline"
                                       onClick={() => setCompletionNotes('')}
                                    >
                                       Cancel
                                    </Button>
                                    <Button
                                       onClick={() => {
                                          handleCompleteFollowUp(followUp.id, completionNotes)
                                          setCompletionNotes('')
                                       }}
                                    >
                                       Complete Follow-up
                                    </Button>
                                 </div>
                              </div>
                           </DialogContent>
                        </Dialog>

                        <Button
                           size="sm"
                           variant="ghost"
                           onClick={() => handleCancelFollowUp(followUp.id)}
                        >
                           <X className="h-4 w-4" />
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>
         ))}
      </div>
   )
}