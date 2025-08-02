'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuthentication } from '@/hooks/useAuthentication'
import { formatIDR } from '@/lib/utils/currency'
import { 
  ArrowLeft, 
  Receipt, 
  Package, 
  Calendar,
  User,
  Building,
  Loader,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { TaxInvoiceRequestDialog } from '../../../components/tax-invoice-request-dialog'

interface InvoiceDetailProps {
  invoiceId: string
}

export function InvoiceDetail({ invoiceId }: InvoiceDetailProps) {
  const { customer, isLoading: authLoading } = useAuthentication()
  const [invoice, setInvoice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push('/login')
      return
    }

    if (customer) {
      fetchInvoice()
    }
  }, [customer, authLoading, invoiceId, router])

  const fetchInvoice = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/invoices/${invoiceId}`)
      const data = await response.json()

      if (response.ok) {
        setInvoice(data.invoice)
      } else {
        toast.error(data.error || 'Gagal memuat detail faktur')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Fetch invoice error:', error)
      toast.error('Terjadi kesalahan saat memuat detail faktur')
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleRequestTaxInvoice = async () => {
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
        fetchInvoice() // Refresh invoice data
      } else {
        toast.error(data.error || 'Gagal meminta faktur pajak')
      }
    } catch (error) {
      console.error('Tax invoice request error:', error)
      toast.error('Terjadi kesalahan saat meminta faktur pajak')
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  const statusBadge = getInvoiceStatusBadge(invoice.status, invoice.isOverdue)
  const StatusIcon = statusBadge.icon

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground">
            Detail faktur dan status pembayaran
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                Status Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {statusBadge.label}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Diperbarui {formatDate(invoice.updatedAt)}
                </p>
              </div>

              {/* Payment Information */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Tanggal Faktur:</span>
                  <span className="text-sm font-medium">{formatDate(invoice.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Jatuh Tempo:</span>
                  <span className={`text-sm font-medium ${
                    invoice.isOverdue ? 'text-red-600' : ''
                  }`}>
                    {formatDate(invoice.dueDate)}
                  </span>
                </div>
                {invoice.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-sm">Tanggal Bayar:</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatDate(invoice.paidAt)}
                    </span>
                  </div>
                )}
                {invoice.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-sm">Metode Bayar:</span>
                    <span className="text-sm font-medium">{invoice.paymentMethod}</span>
                  </div>
                )}
              </div>

              {/* Overdue Warning */}
              {invoice.isOverdue && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="font-medium">Pembayaran Terlambat</p>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Faktur ini sudah melewati tanggal jatuh tempo. Silakan segera lakukan pembayaran.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Detail Produk
              </CardTitle>
              <CardDescription>
                {invoice.items.length} produk dalam faktur ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {item.product.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.product.sku}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.product.brand?.name} • {item.product.useCase}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.quantity} x {formatIDR(item.unitPrice)}
                      </p>
                      <p className="text-lg font-bold">
                        {formatIDR(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Invoice Total */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatIDR(invoice.subtotal)}</span>
                </div>
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Pajak</span>
                    <span>{formatIDR(invoice.taxAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatIDR(invoice.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Invoice Section */}
          {invoice.status === 'PAID' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Faktur Pajak (PPN)
                </CardTitle>
                <CardDescription>
                  Kelola permintaan faktur pajak untuk keperluan bisnis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoice.taxInvoice ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <p className="font-medium">Faktur Pajak Tersedia</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Nomor Faktur Pajak:</span>
                          <span className="font-medium">{invoice.taxInvoice.taxInvoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tanggal Terbit:</span>
                          <span className="font-medium">{formatDate(invoice.taxInvoice.issuedAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>PPN ({(invoice.taxInvoice.ppnRate * 100).toFixed(0)}%):</span>
                          <span className="font-medium">{formatIDR(invoice.taxInvoice.ppnAmount)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total dengan PPN:</span>
                          <span>{formatIDR(invoice.taxInvoice.totalWithPPN)}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Faktur Pajak
                    </Button>
                  </div>
                ) : invoice.taxInvoiceRequested ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                      <Clock className="h-4 w-4" />
                      <p className="font-medium">Permintaan Sedang Diproses</p>
                    </div>
                    <p className="text-sm text-blue-700">
                      Permintaan faktur pajak Anda sedang diproses oleh tim admin. 
                      Faktur pajak akan tersedia dalam 1-2 hari kerja.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Anda dapat meminta faktur pajak (PPN) untuk faktur yang sudah dibayar. 
                      Faktur pajak diperlukan untuk keperluan bisnis dan pelaporan pajak.
                    </p>
                    <TaxInvoiceRequestDialog
                      invoice={invoice}
                      onRequest={handleRequestTaxInvoice}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Informasi Faktur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Nomor Faktur</p>
                <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Nomor Pesanan</p>
                <p className="text-sm text-muted-foreground">{invoice.order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tanggal Faktur</p>
                <p className="text-sm text-muted-foreground">{formatDate(invoice.createdAt)}</p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/orders/${invoice.order.id}`}>
                  <Package className="h-4 w-4 mr-2" />
                  Lihat Pesanan
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Nama</p>
                <p className="text-sm text-muted-foreground">{invoice.customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{invoice.customer.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Telepon</p>
                <p className="text-sm text-muted-foreground">{invoice.customer.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Jenis Akun</p>
                <Badge variant="outline">
                  {invoice.customer.type === 'B2B' ? 'Perusahaan' : 'Individu'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Company Information (for B2B) */}
          {invoice.customer.company && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informasi Perusahaan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Nama Perusahaan</p>
                  <p className="text-sm text-muted-foreground">{invoice.customer.company.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">NPWP</p>
                  <p className="text-sm text-muted-foreground">{invoice.customer.company.taxId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Alamat</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.customer.company.address}, {invoice.customer.company.city}, {invoice.customer.company.province}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}