'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { format, formatDistanceToNow } from 'date-fns'
import { 
   MessageCircle, 
   Phone, 
   CheckCircle, 
   X,
   User,
   Building2,
   FileText,
   AlertTriangle,
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

interface OverdueFollowUpsProps {
   followUps: FollowUp[]
}

export function OverdueFollowUps({ followUps }: OverdueFollowUpsProps) {
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

   const getOverdueSeverity = (scheduledAt: Date) => {
      const hoursOverdue = (Date.now() - scheduledAt.getTime()) / (1000 * 60 * 60)
      
      if (hoursOverdue > 72) return 'critical' // More than 3 days
      if (hoursOverdue > 24) return 'high' // More than 1 day
      return 'medium' // Less than 1 day
   }

   const getSeverityColor = (severity: string) => {
      switch (severity) {
         case 'critical':
            return 'bg-red-100 text-red-800 border-red-200'
         case 'high':
            return 'bg-orange-100 text-orange-800 border-orange-200'
         default:
            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      }
   }

   if (followUps.length === 0) {
      return (
         <Card>
            <CardContent className="flex items-center justify-center py-8">
               <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-2 text-sm font-medium">No overdue follow-ups!</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                     All follow-ups are up to date.
                  </p>
               </div>
            </CardContent>
         </Card>
      )
   }

   return (
      <div className="space-y-4">
         {followUps.map((followUp) => {
            const severity = getOverdueSeverity(followUp.scheduledAt)
            
            return (
               <Card key={followUp.id} className={`border-l-4 ${getSeverityColor(severity)}`}>
                  <CardContent className="p-6">
                     <div className="flex items-start justify-between">
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              {getFollowUpTypeIcon(followUp.type)}
                              <Badge className={getFollowUpTypeColor(followUp.type)}>
                                 {followUp.type.replace('_', ' ').toLowerCase()}
                              </Badge>
                              <Badge variant="destructive">
                                 Overdue {formatDistanceToNow(followUp.scheduledAt, { addSuffix: true })}
                              </Badge>
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

                              <div className="flex items-center gap-2">
                                 <Clock className="h-4 w-4 text-muted-foreground" />
                                 <span className="text-sm text-muted-foreground">
                                    Originally scheduled: {format(followUp.scheduledAt, 'MMM dd, yyyy HH:mm')}
                                 </span>
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

                              {severity === 'critical' && (
                                 <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                                    <strong>Critical:</strong> This follow-up is more than 3 days overdue and requires immediate attention.
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
                                 Contact Now
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
                                    <DialogTitle>Complete Overdue Follow-up</DialogTitle>
                                 </DialogHeader>
                                 <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                       Mark this overdue follow-up as completed and add notes about the interaction.
                                    </p>
                                    <Textarea
                                       placeholder="Add completion notes (recommended for overdue items)..."
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
            )
         })}
      </div>
   )
}