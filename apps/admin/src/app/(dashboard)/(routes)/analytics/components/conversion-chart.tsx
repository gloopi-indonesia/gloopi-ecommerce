'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface ConversionChartProps {
   data?: {
      daily: Array<{
         date: string
         quotations: number
         orders: number
         conversionRate: number
      }>
      summary: {
         totalQuotations: number
         totalOrders: number
         overallConversionRate: number
      }
   }
   isLoading: boolean
}

export function ConversionChart({ data, isLoading }: ConversionChartProps) {
   if (isLoading) {
      return (
         <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
               <CardHeader>
                  <Skeleton className="h-6 w-48" />
               </CardHeader>
               <CardContent>
                  <Skeleton className="h-80 w-full" />
               </CardContent>
            </Card>
            
            <Card>
               <CardHeader>
                  <Skeleton className="h-6 w-32" />
               </CardHeader>
               <CardContent className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
               </CardContent>
            </Card>
         </div>
      )
   }

   if (!data) {
      return (
         <Card>
            <CardContent className="p-6">
               <div className="text-center text-muted-foreground">
                  No conversion data available
               </div>
            </CardContent>
         </Card>
      )
   }

   return (
      <div className="grid gap-4 md:grid-cols-3">
         <Card className="md:col-span-2">
            <CardHeader>
               <CardTitle>Quotation to Order Conversion Trend</CardTitle>
            </CardHeader>
            <CardContent>
               <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.daily}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { 
                           month: 'short', 
                           day: 'numeric' 
                        })}
                     />
                     <YAxis yAxisId="left" />
                     <YAxis yAxisId="right" orientation="right" />
                     <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('id-ID')}
                        formatter={(value, name) => [
                           name === 'conversionRate' ? `${value}%` : value,
                           name === 'quotations' ? 'Quotations' :
                           name === 'orders' ? 'Orders' : 'Conversion Rate'
                        ]}
                     />
                     <Legend />
                     <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="quotations" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Quotations"
                     />
                     <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        name="Orders"
                     />
                     <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="conversionRate" 
                        stroke="#ffc658" 
                        strokeWidth={2}
                        name="Conversion Rate (%)"
                     />
                  </LineChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>
         
         <Card>
            <CardHeader>
               <CardTitle>Conversion Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                     Total Quotations
                  </div>
                  <div className="text-2xl font-bold">
                     {data.summary.totalQuotations.toLocaleString()}
                  </div>
               </div>
               
               <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                     Total Orders
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                     {data.summary.totalOrders.toLocaleString()}
                  </div>
               </div>
               
               <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                     Overall Conversion Rate
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                     {data.summary.overallConversionRate.toFixed(1)}%
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
   )
}