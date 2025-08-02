'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import { Download, Filter } from 'lucide-react'
import { formatIDRFromCents } from '@/lib/utils'
import { useSalesReportData } from '../hooks/use-sales-report-data'
import { salesReportColumns } from './sales-report-columns'

export function SalesReports() {
   const [dateFrom, setDateFrom] = useState('')
   const [dateTo, setDateTo] = useState('')
   const [customerFilter, setCustomerFilter] = useState('')
   const [categoryFilter, setCategoryFilter] = useState('ALL')

   const { data, isLoading, refetch } = useSalesReportData({
      dateFrom,
      dateTo,
      customerFilter,
      categoryFilter
   })

   const handleApplyFilters = () => {
      refetch()
   }

   const handleExportExcel = async () => {
      try {
         const response = await fetch('/api/reports/sales/export?format=excel', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               dateFrom,
               dateTo,
               customerFilter,
               categoryFilter
            })
         })

         if (response.ok) {
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `laporan-penjualan-${new Date().toISOString().split('T')[0]}.xlsx`
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
         const response = await fetch('/api/reports/sales/export?format=pdf', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               dateFrom,
               dateTo,
               customerFilter,
               categoryFilter
            })
         })

         if (response.ok) {
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `laporan-penjualan-${new Date().toISOString().split('T')[0]}.pdf`
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
         <div className="grid gap-4 md:grid-cols-3">
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                     Total Penjualan
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">
                     {data?.summary?.totalSales ? formatIDRFromCents(data.summary.totalSales) : 'Rp 0'}
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                     Jumlah Order
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">
                     {data?.summary?.totalOrders || 0}
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                     Rata-rata Order
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">
                     {data?.summary?.averageOrderValue ? formatIDRFromCents(data.summary.averageOrderValue) : 'Rp 0'}
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
                     <Label htmlFor="category">Kategori</Label>
                     <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                           <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="ALL">Semua Kategori</SelectItem>
                           <SelectItem value="MEDICAL">Medis</SelectItem>
                           <SelectItem value="MANUFACTURING">Manufaktur</SelectItem>
                           <SelectItem value="FOOD">Makanan</SelectItem>
                           <SelectItem value="GENERAL">Umum</SelectItem>
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
               <CardTitle>Detail Penjualan</CardTitle>
            </CardHeader>
            <CardContent>
               <DataTable
                  columns={salesReportColumns}
                  data={data?.orders || []}
                  searchKey="orderNumber"
                  searchPlaceholder="Cari nomor order..."
               />
            </CardContent>
         </Card>
      </div>
   )
}