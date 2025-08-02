'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import { Download, Filter, AlertTriangle } from 'lucide-react'
import { formatIDRFromCents } from '@/lib/utils'
import { usePaymentReportData } from '../hooks/use-payment-report-data'
import { paymentReportColumns } from './payment-report-columns'

export function PaymentReports() {
   const [dateFrom, setDateFrom] = useState('')
   const [dateTo, setDateTo] = useState('')
   const [customerFilter, setCustomerFilter] = useState('')
   const [statusFilter, setStatusFilter] = useState('')
   
   const { data, isLoading, refetch } = usePaymentReportData({
      dateFrom,
      dateTo,
      customerFilter,
      statusFilter
   })

   const handleApplyFilters = () => {
      refetch()
   }

   const handleExportExcel = async () => {
      try {
         const response = await fetch('/api/reports/payments/export?format=excel', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               dateFrom,
               dateTo,
               customerFilter,
               statusFilter
            })
         })
         
         if (response.ok) {
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `laporan-pembayaran-${new Date().toISOString().split('T')[0]}.xlsx`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
         }
      } catch (error) {
         console.error('Error exporting Excel:', error)
      }
   }

   const handleExportPDF = async () => {
      try {
         const response = await fetch('/api/reports/payments/export?format=pdf', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               dateFrom,
               dateTo,
               customerFilter,
               statusFilter
            })
         })
         
         if (response.ok) {
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `laporan-pembayaran-${new Date().toISOString().split('T')[0]}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
         }
      } catch (error) {
         console.error('Error exporting PDF:', error)
      }
   }

   return (
      <div className="space-y-4">
         {/* Summary Cards */}
         <div className="grid gap-4 md:grid-cols-4">
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                     Total Tagihan
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">
                     {data?.summary?.totalInvoices ? formatIDRFromCents(data.summary.totalInvoices) : 'Rp 0'}
                  </div>
               </CardContent>
            </Card>
            
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                     Sudah Dibayar
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                     {data?.summary?.totalPaid ? formatIDRFromCents(data.summary.totalPaid) : 'Rp 0'}
                  </div>
               </CardContent>
            </Card>
            
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                     Belum Dibayar
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                     {data?.summary?.totalPending ? formatIDRFromCents(data.summary.totalPending) : 'Rp 0'}
                  </div>
               </CardContent>
            </Card>
            
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-1">
                     <AlertTriangle className="h-4 w-4 text-red-500" />
                     Terlambat
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                     {data?.summary?.totalOverdue ? formatIDRFromCents(data.summary.totalOverdue) : 'Rp 0'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                     {data?.summary?.overdueCount || 0} tagihan
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Filters */}
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Laporan
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                     <Label htmlFor="dateFrom">Tanggal Mulai</Label>
                     <Input
                        id="dateFrom"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                     />
                  </div>
                  
                  <div className="space-y-2">
                     <Label htmlFor="dateTo">Tanggal Selesai</Label>
                     <Input
                        id="dateTo"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                     />
                  </div>
                  
                  <div className="space-y-2">
                     <Label htmlFor="customer">Pelanggan</Label>
                     <Input
                        id="customer"
                        placeholder="Nama pelanggan..."
                        value={customerFilter}
                        onChange={(e) => setCustomerFilter(e.target.value)}
                     />
                  </div>
                  
                  <div className="space-y-2">
                     <Label htmlFor="status">Status</Label>
                     <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                           <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="">Semua Status</SelectItem>
                           <SelectItem value="PENDING">Belum Dibayar</SelectItem>
                           <SelectItem value="PAID">Sudah Dibayar</SelectItem>
                           <SelectItem value="OVERDUE">Terlambat</SelectItem>
                           <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>
               
               <div className="flex gap-2 mt-4">
                  <Button onClick={handleApplyFilters} disabled={isLoading}>
                     Terapkan Filter
                  </Button>
                  <Button variant="outline" onClick={handleExportExcel}>
                     <Download className="h-4 w-4 mr-2" />
                     Export Excel
                  </Button>
                  <Button variant="outline" onClick={handleExportPDF}>
                     <Download className="h-4 w-4 mr-2" />
                     Export PDF
                  </Button>
               </div>
            </CardContent>
         </Card>

         {/* Data Table */}
         <Card>
            <CardHeader>
               <CardTitle>Detail Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
               <DataTable
                  columns={paymentReportColumns}
                  data={data?.invoices || []}
                  searchKey="invoiceNumber"
                  searchPlaceholder="Cari nomor invoice..."
               />
            </CardContent>
         </Card>
      </div>
   )
}