'use client'

import { useEffect, useState } from 'react'
import { Bell, X, MessageCircle, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface FollowUpNotification {
   id: string
   type: string
   scheduledAt: Date
   customer: {
      id: string
      name: string
      phone: string
   }
   quotation?: {
      id: string
      quotationNumber: string
   } | null
   isOverdue: boolean
}

export function FollowUpNotifications() {
   const [notifications, setNotifications] = useState<FollowUpNotification[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const [isOpen, setIsOpen] = useState(false)

   useEffect(() => {
      fetchNotifications()
      
      // Set up polling for new notifications every 5 minutes
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
      
      return () => clearInterval(interval)
   }, [])

   const fetchNotifications = async () => {
      try {
         const [todayResponse, overdueResponse] = await Promise.all([
            fetch('/api/follow-ups?type=today'),
            fetch('/api/follow-ups?type=overdue')
         ])

         if (todayResponse.ok && overdueResponse.ok) {
            const [todayData, overdueData] = await Promise.all([
               todayResponse.json(),
               overdueResponse.json()
            ])

            const todayNotifications = todayData.data.map((item: any) => ({
               ...item,
               isOverdue: false
            }))

            const overdueNotifications = overdueData.data.map((item: any) => ({
               ...item,
               isOverdue: true
            }))

            setNotifications([...overdueNotifications, ...todayNotifications])
         }
      } catch (error) {
         console.error('Failed to fetch follow-up notifications:', error)
      } finally {
         setIsLoading(false)
      }
   }

   const dismissNotification = async (notificationId: string) => {
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
   }

   const overdueCount = notifications.filter(n => n.isOverdue).length
   const _todayCount = notifications.filter(n => !n.isOverdue).length
   const totalCount = notifications.length

   if (isLoading) {
      return (
         <Button variant="ghost" size="sm" disabled>
            <Bell className="h-4 w-4" />
         </Button>
      )
   }

   return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
         <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
               <Bell className="h-4 w-4" />
               {totalCount > 0 && (
                  <Badge 
                     variant={overdueCount > 0 ? "destructive" : "default"}
                     className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                     {totalCount}
                  </Badge>
               )}
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-80 p-0" align="end">
            <Card className="border-0 shadow-none">
               <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                     <CardTitle className="text-sm font-medium">Follow-up Reminders</CardTitle>
                     {totalCount > 0 && (
                        <Button variant="ghost" size="sm" asChild>
                           <Link href="/follow-ups">
                              View All
                           </Link>
                        </Button>
                     )}
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  {totalCount === 0 ? (
                     <div className="p-4 text-center text-sm text-muted-foreground">
                        No pending follow-ups
                     </div>
                  ) : (
                     <div className="max-h-80 overflow-y-auto">
                        {notifications.slice(0, 5).map((notification) => (
                           <div 
                              key={notification.id} 
                              className={`p-3 border-b last:border-b-0 ${
                                 notification.isOverdue ? 'bg-red-50 border-red-100' : ''
                              }`}
                           >
                              <div className="flex items-start justify-between gap-2">
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 mb-1">
                                       {notification.isOverdue ? (
                                          <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                                       ) : (
                                          <Clock className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                       )}
                                       <Badge 
                                          variant={notification.isOverdue ? "destructive" : "secondary"}
                                          className="text-xs"
                                       >
                                          {notification.type.replace('_', ' ').toLowerCase()}
                                       </Badge>
                                    </div>
                                    
                                    <p className="text-sm font-medium truncate">
                                       {notification.customer.name}
                                    </p>
                                    
                                    <p className="text-xs text-muted-foreground">
                                       {notification.customer.phone}
                                    </p>
                                    
                                    {notification.quotation && (
                                       <p className="text-xs text-muted-foreground">
                                          {notification.quotation.quotationNumber}
                                       </p>
                                    )}
                                    
                                    <p className="text-xs text-muted-foreground">
                                       {notification.isOverdue ? 'Overdue: ' : 'Due: '}
                                       {format(new Date(notification.scheduledAt), 'MMM dd, HH:mm')}
                                    </p>
                                 </div>
                                 
                                 <div className="flex items-center gap-1">
                                    <Button
                                       size="sm"
                                       variant="ghost"
                                       className="h-6 w-6 p-0"
                                       asChild
                                    >
                                       <Link href={`/customers/${notification.customer.id}/communications/new?quotationId=${notification.quotation?.id}`}>
                                          <MessageCircle className="h-3 w-3" />
                                       </Link>
                                    </Button>
                                    
                                    <Button
                                       size="sm"
                                       variant="ghost"
                                       className="h-6 w-6 p-0"
                                       onClick={() => dismissNotification(notification.id)}
                                    >
                                       <X className="h-3 w-3" />
                                    </Button>
                                 </div>
                              </div>
                           </div>
                        ))}
                        
                        {notifications.length > 5 && (
                           <div className="p-3 text-center">
                              <Button variant="ghost" size="sm" asChild>
                                 <Link href="/follow-ups">
                                    View {notifications.length - 5} more
                                 </Link>
                              </Button>
                           </div>
                        )}
                     </div>
                  )}
               </CardContent>
            </Card>
         </PopoverContent>
      </Popover>
   )
}