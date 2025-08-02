'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatIDR } from '@/lib/utils/currency'
import { 
  Receipt, 
  Eye, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { TaxInvoiceRequestDialog } from './tax-invoice-request-dialog'

interface InvoicesTabProps {
  invoices: any[]
  onRefresh: () => void
}

export function InvoicesTab({ invoices, onRefresh }: InvoicesTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const getInvoiceStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return { label: 'Terlambat', variant: 'destructive' as const, icon: AlertTriangle }
    }
    
    const statusConfig = {
      PENDING: { label: 'Belum Bayar', variant: 'secondary' as const, icon: Clock },
      PAID: { label: 'Lunas', variant: 'default' as const, icon: CheckCircle },
      OVERDUE: { label: 'Terlambat', variant: 'destructive' as const, icon: AlertTriangle },
      CANCELLED: { label: 'Dibatalkan', variant: 'destructive' as const, icon: AlertTriangle },
    }
    return statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: Clock 
    }
  }

  const getInvoiceStatusDescription = (status: string, isOverdue: boolean, dueDate: string) => {
    if (isOverdue) {
      return `Pembayaran terlambat sejak ${formatDate(dueDate)}`
    }
    
    const descriptions = {
      PENDING: `Jatuh tempo ${formatDate(dueDate)}`,
      PAID: 'Pembayaran telah diterima',
      OVERDUE: `Pembayaran terlambat sejak ${formatDate(dueDate)}`,
      CANCELLED: 'Faktur dibatalkan',
    }
    return descriptions[status as keyof typeof descriptions] || 'Status tidak diketahui'
  }

  // Filter and search invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesStatus = true
      if (statusFilter === 'overdue') {
        matchesStatus = invoice.isOverdue
      } else if (statusFilter !== 'all') {
        matchesStatus = invoice.status === statusFilter
      }
      
      return matchesSearch && matchesStatus
    })
  }, [invoices, searchTerm, statusFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleRequestTaxInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/request-tax-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        onRefresh()
      } else {
        toast.error(data.error || 'Gagal meminta faktur pajak')
      }
    } catch (error) {
      console.error('Tax invoice request error:', error)
      toast.error('Terjadi kesalahan saat meminta faktur pajak')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Faktur Saya</h2>
          <p className="text-muted-foreground">
            Kelola pembayaran dan faktur pajak
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          <Receipt className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Faktur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor faktur atau pesanan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PENDING">Belum Bayar</SelectItem>
                <SelectItem value="PAID">Lunas</SelectItem>
                <SelectItem value="overdue">Terlambat</SelectItem>
                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => {
            const statusBadge = getInvoiceStatusBadge(invoice.status, invoice.isOverdue)
            const StatusIcon = statusBadge.icon
            
            return (
              <Card key={invoice.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
                      <CardDescription>
                        Pesanan: {invoice.order.orderNumber} • {formatDate(invoice.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusBadge.label}
                      </Badge>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Invoice Items Preview */}
                    <div>
                      <h4 className="font-medium mb-2">Produk ({invoice.items.length} item)</h4>
                      <div className="space-y-2">
                        {invoice.items.slice(0, 2).map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div>
                              <p className="font-medium text-sm">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} x {formatIDR(item.unitPrice)}
                              </p>
                            </div>
                            <p className="font-medium text-sm">
                              {formatIDR(item.totalPrice)}
                            </p>
                          </div>
                        ))}
                        {invoice.items.length > 2 && (
                          <p className="text-sm text-muted-foreground text-center">
                            +{invoice.items.length - 2} produk lainnya
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Invoice Summary */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {getInvoiceStatusDescription(invoice.status, invoice.isOverdue, invoice.dueDate)}
                        </p>
                        {invoice.paidAt && (
                          <p className="text-sm text-green-600">
                            Dibayar pada {formatDate(invoice.paidAt)}
                          </p>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-lg font-bold">{formatIDR(invoice.totalAmount)}</p>
                        </div>
                        
                        {/* Tax Invoice Actions */}
                        {invoice.status === 'PAID' && (
                          <div className="flex gap-2">
                            {invoice.taxInvoice ? (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Faktur Pajak
                              </Button>
                            ) : invoice.taxInvoiceRequested ? (
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Diproses
                              </Badge>
                            ) : (
                              <TaxInvoiceRequestDialog
                                invoice={invoice}
                                onRequest={() => handleRequestTaxInvoice(invoice.id)}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">Tidak ada faktur ditemukan</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Coba ubah filter pencarian Anda'
                      : 'Anda belum memiliki faktur. Faktur akan dibuat setelah pesanan diproses.'
                    }
                  </p>
                </div>
                {!searchTerm && statusFilter === 'all' && (
                  <Button asChild>
                    <Link href="/products">
                      Mulai Berbelanja
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}