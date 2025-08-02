'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { formatIDRFromCents } from '@/lib/utils'

interface ProductPerformanceProps {
   data?: {
      topProducts: Array<{
         id: string
         name: string
         sku: string
         totalSold: number
         revenue: number
         useCase: string
      }>
      industryBreakdown: Array<{
         industry: string
         count: number
         revenue: number
         percentage: number
      }>
      categoryPerformance: Array<{
         category: string
         products: number
         orders: number
         revenue: number
      }>
   }
   isLoading: boolean
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function ProductPerformance({ data, isLoading }: ProductPerformanceProps) {
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
                  No product performance data available
               </div>
            </CardContent>
         </Card>
      )
   }

   const useCaseColors = {
      'MEDICAL': '#0088FE',
      'MANUFACTURING': '#00C49F', 
      'FOOD': '#FFBB28',
      'GENERAL': '#FF8042'
   }

   return (
      <div className="grid gap-4 md:grid-cols-2">
         <Card>
            <CardHeader>
               <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {data.topProducts.slice(0, 10).map((product, index) => (
                     <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                 #{index + 1}
                              </span>
                              <div>
                                 <div className="font-medium">{product.name}</div>
                                 <div className="text-sm text-muted-foreground">
                                    SKU: {product.sku}
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="text-right space-y-1">
                           <div className="font-medium">
                              {formatIDRFromCents(product.revenue)}
                           </div>
                           <div className="text-sm text-muted-foreground">
                              {product.totalSold} sold
                           </div>
                           <Badge variant="outline" className="text-xs">
                              {product.useCase}
                           </Badge>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
               <CardTitle>Industry Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-center mb-4">
                  <ResponsiveContainer width="100%" height={250}>
                     <PieChart>
                        <Pie
                           data={data.industryBreakdown}
                           cx="50%"
                           cy="50%"
                           labelLine={false}
                           label={({ industry, percentage }) => `${industry}: ${percentage.toFixed(1)}%`}
                           outerRadius={80}
                           fill="#8884d8"
                           dataKey="count"
                        >
                           {data.industryBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                        </Pie>
                        <Tooltip 
                           formatter={(value, name) => [
                              `${value} orders`,
                              'Orders'
                           ]}
                        />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="space-y-2">
                  {data.industryBreakdown.map((industry, index) => (
                     <div key={industry.industry} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                           />
                           <span className="text-sm font-medium">{industry.industry}</span>
                        </div>
                        <div className="text-right">
                           <div className="text-sm font-medium">
                              {formatIDRFromCents(industry.revenue)}
                           </div>
                           <div className="text-xs text-muted-foreground">
                              {industry.count} orders
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="md:col-span-2">
            <CardHeader>
               <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
               <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.categoryPerformance}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis 
                        dataKey="category" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                     />
                     <YAxis yAxisId="left" />
                     <YAxis yAxisId="right" orientation="right" />
                     <Tooltip 
                        formatter={(value, name) => [
                           name === 'revenue' ? formatIDRFromCents(value as number) : value,
                           name === 'orders' ? 'Orders' : 
                           name === 'products' ? 'Products' : 'Revenue'
                        ]}
                     />
                     <Bar yAxisId="left" dataKey="orders" fill="#0088FE" name="Orders" />
                     <Bar yAxisId="left" dataKey="products" fill="#00C49F" name="Products" />
                  </BarChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>
      </div>
   )
}