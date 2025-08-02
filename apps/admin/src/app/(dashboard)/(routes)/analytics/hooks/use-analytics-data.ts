import { useState, useEffect, useCallback } from 'react'

interface AnalyticsFilters {
   dateFrom: string
   dateTo: string
   period: string
}

interface AnalyticsData {
   overview: {
      totalRevenue: number
      totalOrders: number
      totalCustomers: number
      totalQuotations: number
      conversionRate: number
      averageOrderValue: number
      repeatCustomerRate: number
      revenueGrowth: number
   }
   conversion: {
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
   customers: {
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
   products: {
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
   revenue: {
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
}

export function useAnalyticsData(filters: AnalyticsFilters) {
   const [data, setData] = useState<AnalyticsData | null>(null)
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState<string | null>(null)

   const fetchData = useCallback(async () => {
      setIsLoading(true)
      setError(null)
      
      try {
         const queryParams = new URLSearchParams()
         if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
         if (filters.dateTo) queryParams.append('dateTo', filters.dateTo)
         if (filters.period) queryParams.append('period', filters.period)

         const response = await fetch(`/api/analytics?${queryParams.toString()}`)
         
         if (!response.ok) {
            throw new Error('Failed to fetch analytics data')
         }
         
         const result = await response.json()
         setData(result)
      } catch (err) {
         setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
         setIsLoading(false)
      }
   }, [filters.dateFrom, filters.dateTo, filters.period])

   useEffect(() => {
      fetchData()
   }, [fetchData])

   return {
      data,
      isLoading,
      error,
      refetch: fetchData
   }
}