'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from 'recharts'
import { formatIDRFromCents } from '@/lib/utils'

interface RevenueComparisonProps {
   data?: {
      monthly: Array<{
         month: string
         b2bRevenue: number
         b2cRevenue: number
         totalRevenue: number
      }>
      comparison: {
         b2b: {
            revenue: number
            percentage: number
            growth: number
         }
         b2c: {
            revenue: number
            percentage: number
            growth: number
         }
      }
      trends: Array<{
         period: string
         b2bGrowth: number
         b2cGrowth: number
         totalGrowth: number
      }>
   }
   isLoading: boolean
}

export function RevenueComparison({ data, isLoading }: RevenueComparisonProps) {
   if (isLoading) {
      return (
         <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 3 }).map((_, i) => (
               <Card key={i} className={i === 0 ? "md:col-span-2" : ""}>
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
                  No revenue comparison data available
               </div>
            </CardContent>
         </Card>
      )
   }

   return (
      <div className="grid gap-4 md:grid-cols-2">
         <Card className="md:col-span-2">
            <CardHeader>
               <CardTitle>B2B vs B2C Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
               <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.monthly}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                     />
                     <YAxis 
                        tickFormatter={(value) => formatIDRFromCents(value).replace('Rp ', 'Rp')}
                     />
                     <Tooltip 
                        formatter={(value) => formatIDRFromCents(value as number)}
                        labelStyle={{ color: '#000' }}
                     />
                     <Legend />
                     <Bar 
                        dataKey="b2bRevenue" 
                        stackId="a" 
                        fill="#0088FE" 
                        name="B2B Revenue"
                     />
                     <Bar 
                        dataKey="b2cRevenue" 
                        stackId="a" 
                        fill="#00C49F" 
                        name="B2C Revenue"
                     />
                  </BarChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
               <CardTitle>Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-4">
                  <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">B2B Revenue</span>
                        <span className="text-lg font-bold text-blue-600">
                           {data.comparison.b2b.percentage.toFixed(1)}%
                        </span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                           className="bg-blue-600 h-2 rounded-full" 
                           style={{ width: `${data.comparison.b2b.percentage}%` }}
                        />
                     </div>
                     <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatIDRFromCents(data.comparison.b2b.revenue)}</span>
                        <span className={data.comparison.b2b.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                           {data.comparison.b2b.growth >= 0 ? '+' : ''}{data.comparison.b2b.growth.toFixed(1)}%
                        </span>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">B2C Revenue</span>
                        <span className="text-lg font-bold text-green-600">
                           {data.comparison.b2c.percentage.toFixed(1)}%
                        </span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                           className="bg-green-600 h-2 rounded-full" 
                           style={{ width: `${data.comparison.b2c.percentage}%` }}
                        />
                     </div>
                     <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatIDRFromCents(data.comparison.b2c.revenue)}</span>
                        <span className={data.comparison.b2c.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                           {data.comparison.b2c.growth >= 0 ? '+' : ''}{data.comparison.b2c.growth.toFixed(1)}%
                        </span>
                     </div>
                  </div>
               </div>

               <div className="pt-4 border-t">
                  <div className="text-center">
                     <div className="text-2xl font-bold">
                        {formatIDRFromCents(data.comparison.b2b.revenue + data.comparison.b2c.revenue)}
                     </div>
                     <div className="text-sm text-muted-foreground">
                        Total Revenue
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
               <CardTitle>Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
               <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.trends}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis 
                        dataKey="period" 
                        tick={{ fontSize: 12 }}
                     />
                     <YAxis 
                        tickFormatter={(value) => `${value}%`}
                     />
                     <Tooltip 
                        formatter={(value) => [`${value}%`, '']}
                        labelStyle={{ color: '#000' }}
                     />
                     <Legend />
                     <Line 
                        type="monotone" 
                        dataKey="b2bGrowth" 
                        stroke="#0088FE" 
                        strokeWidth={2}
                        name="B2B Growth"
                     />
                     <Line 
                        type="monotone" 
                        dataKey="b2cGrowth" 
                        stroke="#00C49F" 
                        strokeWidth={2}
                        name="B2C Growth"
                     />
                     <Line 
                        type="monotone" 
                        dataKey="totalGrowth" 
                        stroke="#FFBB28" 
                        strokeWidth={2}
                        name="Total Growth"
                     />
                  </LineChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>
      </div>
   )
}