'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { formatIDRFromCents } from '@/lib/utils'

interface CustomerAnalyticsProps {
   data?: {
      acquisition: Array<{
         date: string
         newCustomers: number
         b2bCustomers: number
         b2cCustomers: number
      }>
      retention: {
         repeatCustomers: number
         oneTimeCustomers: number
         repeatRate: number
      }
      segmentation: {
         b2b: {
            count: number
            revenue: number
            averageOrderValue: number
         }
         b2c: {
            count: number
            revenue: number
            averageOrderValue: number
         }
      }
   }
   isLoading: boolean
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function CustomerAnalytics({ data, isLoading }: CustomerAnalyticsProps) {
   if (isLoading) {
      return (
         <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
               <Card key={i}>
                  <CardHeader>
                     <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                     <Skeleton className="h-64 w-full" />
                  </CardContent>
               </Card>
            ))}
         </div>
      )
   }

   if (!data) {
      return (
         <Card>
            <CardContent className="p-6">
               <div className="text-center text-muted-foreground">
                  No customer analytics data available
               </div>
            </CardContent>
         </Card>
      )
   }

   const retentionData = [
      { name: 'Repeat Customers', value: data.retention.repeatCustomers, color: '#0088FE' },
      { name: 'One-time Customers', value: data.retention.oneTimeCustomers, color: '#00C49F' }
   ]

   const segmentationData = [
      { name: 'B2B', value: data.segmentation.b2b.count, color: '#0088FE' },
      { name: 'B2C', value: data.segmentation.b2c.count, color: '#00C49F' }
   ]

   return (
      <div className="grid gap-4 md:grid-cols-2">
         <Card>
            <CardHeader>
               <CardTitle>Customer Acquisition Trend</CardTitle>
            </CardHeader>
            <CardContent>
               <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.acquisition}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { 
                           month: 'short', 
                           day: 'numeric' 
                        })}
                     />
                     <YAxis />
                     <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('id-ID')}
                     />
                     <Bar dataKey="b2bCustomers" stackId="a" fill="#0088FE" name="B2B" />
                     <Bar dataKey="b2cCustomers" stackId="a" fill="#00C49F" name="B2C" />
                  </BarChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
               <CardTitle>Customer Retention</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                     <PieChart>
                        <Pie
                           data={retentionData}
                           cx="50%"
                           cy="50%"
                           labelLine={false}
                           label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                           outerRadius={80}
                           fill="#8884d8"
                           dataKey="value"
                        >
                           {retentionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                     {data.retention.repeatRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                     Repeat Customer Rate
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
               <CardTitle>Customer Segmentation</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                     <PieChart>
                        <Pie
                           data={segmentationData}
                           cx="50%"
                           cy="50%"
                           labelLine={false}
                           label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                           outerRadius={80}
                           fill="#8884d8"
                           dataKey="value"
                        >
                           {segmentationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
               <CardTitle>Revenue by Customer Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <span className="text-sm font-medium">B2B Revenue</span>
                     <span className="text-lg font-bold text-blue-600">
                        {formatIDRFromCents(data.segmentation.b2b.revenue)}
                     </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                     Avg Order: {formatIDRFromCents(data.segmentation.b2b.averageOrderValue)}
                  </div>
               </div>
               
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <span className="text-sm font-medium">B2C Revenue</span>
                     <span className="text-lg font-bold text-green-600">
                        {formatIDRFromCents(data.segmentation.b2c.revenue)}
                     </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                     Avg Order: {formatIDRFromCents(data.segmentation.b2c.averageOrderValue)}
                  </div>
               </div>
               
               <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                     B2B vs B2C Ratio: {data.segmentation.b2b.count}:{data.segmentation.b2c.count}
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
   )
}