'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
   TrendingUp, 
   MessageCircle, 
   Phone, 
   Mail, 
   MessageSquare,
   CheckCircle,
   Clock,
   Target
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface CommunicationMetrics {
   totalCommunications: number
   communicationsByType: Record<string, number>
   communicationsByStatus: Record<string, number>
   responseRate: number
   averageResponseTime: number
   followUpEffectiveness: {
      totalFollowUps: number
      completedFollowUps: number
      conversionRate: number
   }
   monthlyTrends: Array<{
      month: string
      communications: number
      followUps: number
      conversions: number
   }>
}

interface FollowUpMetricsProps {
   metrics: CommunicationMetrics
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const getCommunicationIcon = (type: string) => {
   switch (type.toLowerCase()) {
      case 'whatsapp':
         return <MessageCircle className="h-4 w-4" />
      case 'phone':
         return <Phone className="h-4 w-4" />
      case 'email':
         return <Mail className="h-4 w-4" />
      case 'sms':
         return <MessageSquare className="h-4 w-4" />
      default:
         return <MessageCircle className="h-4 w-4" />
   }
}

export function FollowUpMetrics({ metrics }: FollowUpMetricsProps) {
   const communicationTypeData = Object.entries(metrics.communicationsByType).map(([type, count]) => ({
      name: type.toLowerCase(),
      value: count,
      percentage: metrics.totalCommunications > 0 ? (count / metrics.totalCommunications * 100).toFixed(1) : '0'
   }))

   const statusData = Object.entries(metrics.communicationsByStatus).map(([status, count]) => ({
      name: status.toLowerCase(),
      value: count,
      percentage: metrics.totalCommunications > 0 ? (count / metrics.totalCommunications * 100).toFixed(1) : '0'
   }))

   const completionRate = metrics.followUpEffectiveness.totalFollowUps > 0 
      ? (metrics.followUpEffectiveness.completedFollowUps / metrics.followUpEffectiveness.totalFollowUps * 100)
      : 0

   return (
      <div className="space-y-6">
         {/* Key Metrics Cards */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{metrics.responseRate.toFixed(1)}%</div>
                  <Progress value={metrics.responseRate} className="mt-2" />
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Follow-up Completion</CardTitle>
                  <CheckCircle className="h-4 w-4 text-blue-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
                  <Progress value={completionRate} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                     {metrics.followUpEffectiveness.completedFollowUps} of {metrics.followUpEffectiveness.totalFollowUps} completed
                  </p>
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <Target className="h-4 w-4 text-purple-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{metrics.followUpEffectiveness.conversionRate.toFixed(1)}%</div>
                  <Progress value={metrics.followUpEffectiveness.conversionRate} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                     Follow-ups to approved quotations
                  </p>
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">
                     {metrics.averageResponseTime > 0 ? `${metrics.averageResponseTime.toFixed(1)}h` : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                     Average time to respond
                  </p>
               </CardContent>
            </Card>
         </div>

         {/* Charts Section */}
         <div className="grid gap-6 md:grid-cols-2">
            {/* Communication Types */}
            <Card>
               <CardHeader>
                  <CardTitle>Communication Types</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     {communicationTypeData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              {getCommunicationIcon(item.name)}
                              <span className="capitalize">{item.name}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.value}</span>
                              <Badge variant="outline">{item.percentage}%</Badge>
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>

            {/* Communication Status */}
            <Card>
               <CardHeader>
                  <CardTitle>Message Status Distribution</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     {statusData.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div 
                                 className="w-3 h-3 rounded-full" 
                                 style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="capitalize">{item.name}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.value}</span>
                              <Badge variant="outline">{item.percentage}%</Badge>
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Monthly Trends Chart */}
         {metrics.monthlyTrends.length > 0 && (
            <Card>
               <CardHeader>
                  <CardTitle>Monthly Communication Trends</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics.monthlyTrends}>
                           <CartesianGrid strokeDasharray="3 3" />
                           <XAxis dataKey="month" />
                           <YAxis />
                           <Tooltip />
                           <Line 
                              type="monotone" 
                              dataKey="communications" 
                              stroke="#8884d8" 
                              strokeWidth={2}
                              name="Communications"
                           />
                           <Line 
                              type="monotone" 
                              dataKey="followUps" 
                              stroke="#82ca9d" 
                              strokeWidth={2}
                              name="Follow-ups"
                           />
                           <Line 
                              type="monotone" 
                              dataKey="conversions" 
                              stroke="#ffc658" 
                              strokeWidth={2}
                              name="Conversions"
                           />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               </CardContent>
            </Card>
         )}

         {/* Performance Insights */}
         <Card>
            <CardHeader>
               <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                     <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Communication Effectiveness</h4>
                        <div className="space-y-2 text-sm">
                           <div className="flex justify-between">
                              <span>Total Messages Sent:</span>
                              <span className="font-medium">{metrics.totalCommunications}</span>
                           </div>
                           <div className="flex justify-between">
                              <span>Response Rate:</span>
                              <span className={`font-medium ${metrics.responseRate > 70 ? 'text-green-600' : metrics.responseRate > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                 {metrics.responseRate.toFixed(1)}%
                              </span>
                           </div>
                           <div className="flex justify-between">
                              <span>Most Used Channel:</span>
                              <span className="font-medium capitalize">
                                 {Object.entries(metrics.communicationsByType).reduce((a, b) => 
                                    metrics.communicationsByType[a[0]] > metrics.communicationsByType[b[0]] ? a : b
                                 )[0].toLowerCase()}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Follow-up Performance</h4>
                        <div className="space-y-2 text-sm">
                           <div className="flex justify-between">
                              <span>Total Follow-ups:</span>
                              <span className="font-medium">{metrics.followUpEffectiveness.totalFollowUps}</span>
                           </div>
                           <div className="flex justify-between">
                              <span>Completion Rate:</span>
                              <span className={`font-medium ${completionRate > 80 ? 'text-green-600' : completionRate > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                 {completionRate.toFixed(1)}%
                              </span>
                           </div>
                           <div className="flex justify-between">
                              <span>Conversion Rate:</span>
                              <span className={`font-medium ${metrics.followUpEffectiveness.conversionRate > 30 ? 'text-green-600' : metrics.followUpEffectiveness.conversionRate > 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                                 {metrics.followUpEffectiveness.conversionRate.toFixed(1)}%
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Recommendations */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                     <h4 className="font-medium mb-2 text-blue-900">Recommendations</h4>
                     <ul className="space-y-1 text-sm text-blue-800">
                        {metrics.responseRate < 50 && (
                           <li>• Consider improving message templates or timing to increase response rates</li>
                        )}
                        {completionRate < 70 && (
                           <li>• Focus on completing more follow-ups to improve customer relationships</li>
                        )}
                        {metrics.followUpEffectiveness.conversionRate < 20 && (
                           <li>• Review follow-up strategies to improve conversion from follow-ups to sales</li>
                        )}
                        {Object.values(metrics.communicationsByType).every(v => v === 0) && (
                           <li>• Start using multiple communication channels for better customer reach</li>
                        )}
                     </ul>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
   )
}