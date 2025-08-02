'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatIDR } from '@/lib/utils/currency'
import { 
  Package, 
  Receipt, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface DashboardOverviewProps {
  orders: any[]
  invoices: any[]
  quotations: any[]
  onRefresh: () => void
}

export function DashboardOverview({ 
  orders, 
  invoices, 
  quotations, 
  onRefresh 
}: DashboardOverviewProps) {
  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    activeOrders: orders.filter(o => ['NEW', 'PROCESSING', 'SHIPPED'].includes(o.status)).length,
    completedOrders: orders.filter(o => o.status === 'DELIVERED').length,
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(i => i.status === 'PAID').length,
    overdueInvoices: invoices.filter(i => i.isOverdue).length,
    pendingQuotations: quotations.filter(q => q.status === 'PENDING').length,
    approvedQuotations: quotations.filter(q => q.status === 'APPROVED').length,
  }

  // Recent activities
  const recentOrders = orders.slice(0, 3)
  const recentInvoices = invoices.slice(0, 3)
  const pendingQuotations = quotations.filter(q => q.status === 'PENDING').slice(0, 3)

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      NEW: { label: 'Baru', variant: 'secondary' as const },
      PROCESSING: { label: 'Diproses', variant: 'default' as const },
      SHIPPED: { label: 'Dikirim', variant: 'default' as const },
      DELIVERED: { label: 'Selesai', variant: 'default' as const },
      CANCELLED: { label: 'Dibatalkan', variant: 'destructive' as const },
    }
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }
  }

  const getInvoiceStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return { label: 'Terlambat', variant: 'destructive' as const }
    }
    
    const statusConfig = {
      PENDING: { label: 'Belum Bayar', variant: 'secondary' as const },
      PAID: { label: 'Lunas', variant: 'default' as const },
      OVERDUE: { label: 'Terlambat', variant: 'destructive' as const },
      CANCELLED: { label: 'Dibatalkan', variant: 'destructive' as const },
    }
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }
  }

  const getQuotationStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Menunggu', variant: 'secondary' as const },
      APPROVED: { label: 'Disetujui', variant: 'default' as const },
      REJECTED: { label: 'Ditolak', variant: 'destructive' as const },
      CONVERTED: { label: 'Dikonversi', variant: 'default' as const },
      EXPIRED: { label: 'Kedaluwarsa', variant: 'destructive' as const },
    }
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ringkasan Dashboard</h2>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeOrders} aktif, {stats.completedOrders} selesai
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faktur</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.paidInvoices} lunas
              {stats.overdueInvoices > 0 && (
                <span className="text-red-600 ml-1">
                  , {stats.overdueInvoices} terlambat
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penawaran</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotations.length}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingQuotations} menunggu, {stats.approvedQuotations} disetujui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {stats.overdueInvoices > 0 ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overdueInvoices > 0 ? 'Perhatian' : 'Baik'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueInvoices > 0 
                ? `${stats.overdueInvoices} faktur terlambat`
                : 'Semua faktur up to date'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Pesanan Terbaru
            </CardTitle>
            <CardDescription>
              {recentOrders.length} pesanan terbaru
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                const statusBadge = getOrderStatusBadge(order.status)
                return (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatIDR(order.totalAmount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada pesanan
              </p>
            )}
            {recentOrders.length > 0 && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard?tab=orders">
                  Lihat Semua Pesanan
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Faktur Terbaru
            </CardTitle>
            <CardDescription>
              {recentInvoices.length} faktur terbaru
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((invoice) => {
                const statusBadge = getInvoiceStatusBadge(invoice.status, invoice.isOverdue)
                return (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatIDR(invoice.totalAmount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada faktur
              </p>
            )}
            {recentInvoices.length > 0 && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard?tab=invoices">
                  Lihat Semua Faktur
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pending Quotations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Penawaran Menunggu
            </CardTitle>
            <CardDescription>
              {pendingQuotations.length} penawaran menunggu persetujuan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingQuotations.length > 0 ? (
              pendingQuotations.map((quotation) => {
                const statusBadge = getQuotationStatusBadge(quotation.status)
                return (
                  <div key={quotation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{quotation.quotationNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatIDR(quotation.totalAmount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/quotations/${quotation.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Tidak ada penawaran menunggu
              </p>
            )}
            {quotations.length > 0 && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard?tab=quotations">
                  Lihat Semua Penawaran
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}