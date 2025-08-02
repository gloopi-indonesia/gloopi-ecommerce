import { useState, useEffect, useCallback } from 'react'
import { SalesReportRow } from '../components/sales-report-columns'

interface SalesReportFilters {
   dateFrom: string
   dateTo: string
   customerFilter: string
   categoryFilter: string
}

interface SalesReportSummary {
   totalSales: number
   totalOrders: number
   averageOrderValue: number
}

interface SalesReportData {
   summary: SalesReportSummary
   orders: SalesReportRow[]
}

export function useSalesReportData(filters: SalesReportFilters) {
   const [data, setData] = useState<SalesReportData | null>(null)
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState<string | null>(null)

   const fetchData = useCallback(async () => {
      setIsLoading(true)
      setError(null)

      try {
         const queryParams = new URLSearchParams()
         if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
         if (filters.dateTo) queryParams.append('dateTo', filters.dateTo)
         if (filters.customerFilter) queryParams.append('customer', filters.customerFilter)
         if (filters.categoryFilter && filters.categoryFilter !== 'ALL') queryParams.append('category', filters.categoryFilter)

         const response = await fetch(`/api/reports/sales?${queryParams.toString()}`)

         if (!response.ok) {
            throw new Error('Failed to fetch sales report data')
         }

         const result = await response.json()
         setData(result)
      } catch (err) {
         setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
         setIsLoading(false)
      }
   }, [filters.dateFrom, filters.dateTo, filters.customerFilter, filters.categoryFilter])

   useEffect(() => {
      fetchData()
   }, [fetchData]) // Initial load

   return {
      data,
      isLoading,
      error,
      refetch: fetchData
   }
}