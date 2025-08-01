'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
   MessageCircle, 
   Phone, 
   Mail, 
   MessageSquare,
   Plus,
   ArrowUpDown
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useState } from 'react'

interface AdminUser {
   id: string
   name: string
   email: string
}

interface Communication {
   id: string
   type: 'WHATSAPP' | 'PHONE' | 'EMAIL' | 'SMS'
   direction: 'INBOUND' | 'OUTBOUND'
   content: string
   status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
   createdAt: Date
   adminUser: AdminUser
}

interface CustomerCommunicationsProps {
   communications: Communication[]
   customerId: string
}

const getCommunicationIcon = (type: string) => {
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

const getCommunicationTypeColor = (type: string) => {
   switch (type) {
      case 'WHATSAPP':
         return 'bg-green-100 text-green-800'
      case 'PHONE':
         return 'bg-blue-100 text-blue-800'
      case 'EMAIL':
         return 'bg-purple-100 text-purple-800'
      case 'SMS':
         return 'bg-orange-100 text-orange-800'
      default:
         return 'bg-gray-100 text-gray-800'
   }
}

const getStatusColor = (status: string) => {
   switch (status) {
      case 'SENT':
         return 'bg-blue-100 text-blue-800'
      case 'DELIVERED':
         return 'bg-green-100 text-green-800'
      case 'READ':
         return 'bg-green-100 text-green-800'
      case 'FAILED':
         return 'bg-red-100 text-red-800'
      default:
         return 'bg-gray-100 text-gray-800'
   }
}

export function CustomerCommunications({ communications, customerId }: CustomerCommunicationsProps) {
   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

   const sortedCommunications = [...communications].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
   })

   const toggleSortOrder = () => {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
   }

   if (communications.length === 0) {
      return (
         <Card>
            <CardHeader>
               <div className="flex items-center justify-between">
                  <CardTitle>Communications</CardTitle>
                  <Button size="sm" asChild>
                     <Link href={`/customers/${customerId}/communications/new`}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Communication
                     </Link>
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
               <div className="text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No communications yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                     Start a conversation with this customer.
                  </p>
                  <Button className="mt-4" asChild>
                     <Link href={`/customers/${customerId}/communications/new`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Send Message
                     </Link>
                  </Button>
               </div>
            </CardContent>
         </Card>
      )
   }

   return (
      <Card>
         <CardHeader>
            <div className="flex items-center justify-between">
               <CardTitle>Communications ({communications.length})</CardTitle>
               <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={toggleSortOrder}>
                     <ArrowUpDown className="mr-2 h-4 w-4" />
                     {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  </Button>
                  <Button size="sm" asChild>
                     <Link href={`/customers/${customerId}/communications/new`}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Communication
                     </Link>
                  </Button>
               </div>
            </div>
         </CardHeader>
         <CardContent>
            <div className="space-y-4">
               {sortedCommunications.map((communication) => (
                  <div key={communication.id} className="border rounded-lg p-4">
                     <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                           <div className="flex items-center gap-2">
                              {getCommunicationIcon(communication.type)}
                              <Badge className={getCommunicationTypeColor(communication.type)}>
                                 {communication.type.toLowerCase()}
                              </Badge>
                           </div>
                           <Badge variant={communication.direction === 'OUTBOUND' ? 'default' : 'secondary'}>
                              {communication.direction.toLowerCase()}
                           </Badge>
                           <Badge className={getStatusColor(communication.status)}>
                              {communication.status.toLowerCase()}
                           </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                           {format(communication.createdAt, 'MMM dd, yyyy HH:mm')}
                        </div>
                     </div>
                     
                     <div className="mb-3">
                        <p className="text-sm whitespace-pre-wrap">{communication.content}</p>
                     </div>
                     
                     <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                           {communication.direction === 'OUTBOUND' ? 'Sent by' : 'Received by'}: {communication.adminUser.name}
                        </span>
                        {communication.status === 'FAILED' && (
                           <Button variant="outline" size="sm">
                              Retry
                           </Button>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </CardContent>
      </Card>
   )
}