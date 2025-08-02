import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
   Calendar,
   Clock,
   AlertTriangle,
   CheckCircle
} from 'lucide-react'

import { TodaysFollowUps } from './components/todays-follow-ups'
import { OverdueFollowUps } from './components/overdue-follow-ups'
import { FollowUpMetrics } from './components/follow-up-metrics'
import { communicationManager } from '@/lib/services/communication-manager'

export default async function FollowUpsPage() {
   const [todaysFollowUps, overdueFollowUps, metrics] = await Promise.all([
      communicationManager.getTodaysPendingFollowUps(),
      communicationManager.getOverdueFollowUps(),
      communicationManager.getCommunicationMetrics()
   ])

   return (
      <div className="space-y-6">
         <div>
            <Heading 
               title="Follow-ups & Communications" 
               description="Manage customer follow-ups and track communication effectiveness" 
            />
         </div>
         <Separator />

         {/* Metrics Overview */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Follow-ups</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{todaysFollowUps.length}</div>
                  <p className="text-xs text-muted-foreground">
                     Scheduled for today
                  </p>
               </CardContent>
            </Card>
            
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold text-red-600">{overdueFollowUps.length}</div>
                  <p className="text-xs text-muted-foreground">
                     Need immediate attention
                  </p>
               </CardContent>
            </Card>
            
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">
                     {metrics.followUpEffectiveness.conversionRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                     Follow-ups to conversions
                  </p>
               </CardContent>
            </Card>
            
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Communications</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalCommunications}</div>
                  <p className="text-xs text-muted-foreground">
                     This month
                  </p>
               </CardContent>
            </Card>
         </div>

         {/* Follow-ups Tabs */}
         <Tabs defaultValue="today" className="space-y-4">
            <TabsList>
               <TabsTrigger value="today" className="relative">
                  Today's Follow-ups
                  {todaysFollowUps.length > 0 && (
                     <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                        {todaysFollowUps.length}
                     </Badge>
                  )}
               </TabsTrigger>
               <TabsTrigger value="overdue" className="relative">
                  Overdue
                  {overdueFollowUps.length > 0 && (
                     <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                        {overdueFollowUps.length}
                     </Badge>
                  )}
               </TabsTrigger>
               <TabsTrigger value="metrics">
                  Analytics
               </TabsTrigger>
            </TabsList>
            
            <TabsContent value="today">
               <TodaysFollowUps followUps={todaysFollowUps} />
            </TabsContent>
            
            <TabsContent value="overdue">
               <OverdueFollowUps followUps={overdueFollowUps} />
            </TabsContent>
            
            <TabsContent value="metrics">
               <FollowUpMetrics metrics={metrics} />
            </TabsContent>
         </Tabs>
      </div>
   )
}