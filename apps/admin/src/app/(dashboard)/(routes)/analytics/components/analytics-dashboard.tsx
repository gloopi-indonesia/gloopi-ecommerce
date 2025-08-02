'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatIDRFromCents } from '@/lib/utils'
import { useAnalyticsData } from '../hooks/use-analytics-data'
import { MetricsOverview } from './metrics-overview'
import { ConversionChart } from './conversion-chart'
import { CustomerAnalytics } from './customer-analytics'
import { ProductPerformance } from './product-performance'
import { RevenueComparison } from './revenue-comparison'

export function AnalyticsDashboard() {
   const [dateFrom, setDateFrom] = useState('')
   const [dateTo, setDateTo] = useState('')
   const [period, setPeriod] = useState('30d')
   
   const { data, isLoading, refetch } = useAnalyticsData({
      dateFrom,
      dateTo,
      period
   })

   const handleApplyFilters = () => {
      refetch()
   }

   return (
      <div className="space-y-4">
         {/* Filters */}
         <Card>
            <CardHeader>
               <CardTitle>Filter Analytics</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                     <Label htmlFor="period">Period</Label>
                     <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger>
                           <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="7d">Last 7 days</SelectItem>
                           <SelectItem value="30d">Last 30 days</SelectItem>
                           <SelectItem value="90d">Last 90 days</SelectItem>
                           <SelectItem value="1y">Last year</SelectItem>
                           <SelectItem value="custom">Custom range</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  
                  {period === 'custom' && (
                     <>
                        <div className="space-y-2">
                           <Label htmlFor="dateFrom">From Date</Label>
                           <Input
                              id="dateFrom"
                              type="date"
                              value={dateFrom}
                              onChange={(e) => setDateFrom(e.target.value)}
                           />
                        </div>
                        
                        <div className="space-y-2">
                           <Label htmlFor="dateTo">To Date</Label>
                           <Input
                              id="dateTo"
                              type="date"
                              value={dateTo}
                              onChange={(e) => setDateTo(e.target.value)}
                           />
                        </div>
                     </>
                  )}
                  
                  <div className="flex items-end">
                     <Button onClick={handleApplyFilters} disabled={isLoading}>
                        Apply Filters
                     </Button>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Key Metrics Overview */}
         <MetricsOverview data={data?.overview} isLoading={isLoading} />

         {/* Analytics Tabs */}
         <Tabs defaultValue="conversion" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
               <TabsTrigger value="conversion">Conversion</TabsTrigger>
               <TabsTrigger value="customers">Customers</TabsTrigger>
               <TabsTrigger value="products">Products</TabsTrigger>
               <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>
            
            <TabsContent value="conversion" className="space-y-4">
               <ConversionChart data={data?.conversion} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="customers" className="space-y-4">
               <CustomerAnalytics data={data?.customers} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="products" className="space-y-4">
               <ProductPerformance data={data?.products} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="revenue" className="space-y-4">
               <RevenueComparison data={data?.revenue} isLoading={isLoading} />
            </TabsContent>
         </Tabs>
      </div>
   )
}