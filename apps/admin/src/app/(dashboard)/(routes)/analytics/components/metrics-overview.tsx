'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatIDRFromCents } from '@/lib/utils'
import { 
   TrendingUp, 
   TrendingDown, 
   DollarSign, 
   ShoppingCart, 
   Users, 
   Package,
   Target,
   Repeat
} from 'lucide-react'

interface MetricsOverviewProps {
   data?: {
      totalRevenue: number
      totalOrders: number
      totalCustomers: number
      totalQuotations: number
      conversionRate: number
      averageOrderValue: number
      repeatCustomerRate: number
      revenueGrowth: number
   }
   isLoading: boolean
}

export function MetricsOverview({ data, isLoading }: MetricsOverviewProps) {
   if (isLoading) {
      return (
         <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
               <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <Skeleton className="h-4 w-24" />
                     <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                     <Skeleton className="h-8 w-32" />
                     <Skeleton className="h-3 w-20 mt-2" />
                  </CardContent>
               </Card>
            ))}
         </div>
      )
   }

   if (!data) {
      return (
         <div className="grid gap-4 md:grid-cols-4">
            <Card>
               <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                     No data available
                  </div>
               </CardContent>
            </Card>
         </div>
      )
   }

   const metrics = [
      {
         title: 'Total Revenue',
         value: formatIDRFromCents(data.totalRevenue),
         icon: DollarSign,
         change: data.revenueGrowth,
         changeType: data.revenueGrowth >= 0 ? 'positive' : 'negative'
      },
      {
         title: 'Total Orders',
         value: data.totalOrders.toLocaleString(),
         icon: ShoppingCart,
         change: null,
         changeType: 'neutral'
      },
      {
         title: 'Total Customers',
         value: data.totalCustomers.toLocaleString(),
         icon: Users,
         change: null,
         changeType: 'neutral'
      },
      {
         title: 'Total Quotations',
         value: data.totalQuotations.toLocaleString(),
         icon: Package,
         change: null,
         changeType: 'neutral'
      },
      {
         title: 'Conversion Rate',
         value: `${data.conversionRate.toFixed(1)}%`,
         icon: Target,
         change: null,
         changeType: 'neutral'
      },
      {
         title: 'Average Order Value',
         value: formatIDRFromCents(data.averageOrderValue),
         icon: TrendingUp,
         change: null,
         changeType: 'neutral'
      },
      {
         title: 'Repeat Customer Rate',
         value: `${data.repeatCustomerRate.toFixed(1)}%`,
         icon: Repeat,
         change: null,
         changeType: 'neutral'
      },
      {
         title: 'Revenue Growth',
         value: `${data.revenueGrowth >= 0 ? '+' : ''}${data.revenueGrowth.toFixed(1)}%`,
         icon: data.revenueGrowth >= 0 ? TrendingUp : TrendingDown,
         change: null,
         changeType: data.revenueGrowth >= 0 ? 'positive' : 'negative'
      }
   ]

   return (
      <div className="grid gap-4 md:grid-cols-4">
         {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
               <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        {metric.title}
                     </CardTitle>
                     <Icon className={`h-4 w-4 ${
                        metric.changeType === 'positive' ? 'text-green-600' :
                        metric.changeType === 'negative' ? 'text-red-600' :
                        'text-muted-foreground'
                     }`} />
                  </CardHeader>
                  <CardContent>
                     <div className={`text-2xl font-bold ${
                        metric.changeType === 'positive' ? 'text-green-600' :
                        metric.changeType === 'negative' ? 'text-red-600' :
                        ''
                     }`}>
                        {metric.value}
                     </div>
                     {metric.change !== null && (
                        <p className={`text-xs ${
                           metric.changeType === 'positive' ? 'text-green-600' :
                           metric.changeType === 'negative' ? 'text-red-600' :
                           'text-muted-foreground'
                        }`}>
                           {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}% from last period
                        </p>
                     )}
                  </CardContent>
               </Card>
            )
         })}
      </div>
   )
}