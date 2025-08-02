import { useState, useEffect, useCallback } from 'react'
import { PaymentReportRow } from '../components/payment-report-columns'

interface PaymentReportFilters {
   dateFrom: string
   dateTo: string
   customerFilter: string
   statusFilter: string
}

interface PaymentReportSummary {
   totalInvoices: number
   totalPaid: number
   totalPending: number
   totalOverdue: number
   overdueCount: number
}

interface PaymentReportData {
   summary: PaymentReportSummary
   invoices: PaymentReportRow[]
}

export function usePaymentReportData(filters: PaymentReportFilters) {
   const [data, setData] = useState<PaymentReportData | null>(null)
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
         if (filters.statusFilter && filters.statusFilter !== 'ALL') queryParams.append('status', filters.statusFilter)

         const response = await fetch(`/api/reports/payments?${queryParams.toString()}`)

         if (!response.ok) {
            throw new Error('Failed to fetch payment report data')
         }

         const result = await response.json()
         setData(result)
      } catch (err) {
         setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
         setIsLoading(false)
      }
   }, [filters.dateFrom, filters.dateTo, filters.customerFilter, filters.statusFilter])

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