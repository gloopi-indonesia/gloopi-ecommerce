'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuthentication } from '@/hooks/useAuthentication'
import { formatIDR } from '@/lib/utils/currency'
import { 
  ArrowLeft, 
  FileText, 
  Package, 
  Calendar,
  User,
  MapPin,
  Loader,
  CheckCircle,
  Clock,
  X,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface QuotationDetailProps {
  quotationId: string
}

export function QuotationDetail({ quotationId }: QuotationDetailProps) {
  const { customer, isLoading: authLoading } = useAuthentication()
  const [quotation, setQuotation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push('/login')
      return
    }

    if (customer) {
      fetchQuotation()
    }
  }, [customer, authLoading, quotationId, router])

  const fetchQuotation = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/quotations/${quotationId}`)
      const data = await response.json()

      if (response.ok) {
        setQuotation(data.quotation)
      } else {
        toast.error(data.error || 'Gagal memuat detail penawaran')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Fetch quotation error:', error)
      toast.error('Terjadi kesalahan saat memuat detail penawaran')
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const getQuotationStatusBadge = (status: string, validUntil: string) => {
    const isExpired = new Date() > new Date(validUntil)
    
    if (isExpired && status === 'PENDING') {
      return { label: 'Kedaluwarsa', variant: 'destructive' as const, icon: AlertTriangle }
    }
    
    const statusConfig = {
      PENDING: { label: 'Menunggu', variant: 'secondary' as const, icon: Clock },
      APPROVED: { label: 'Disetujui', variant: 'default' as const, icon: CheckCircle },
      REJECTED: { label: 'Ditolak', variant: 'destructive' as const, icon: X },
      CONVERTED: { label: 'Dikonversi', variant: 'default' as const, icon: CheckCircle },
      EXPIRED: { label: 'Kedaluwarsa', variant: 'destructive' as const, icon: AlertTriangle },
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

  const getDaysUntilExpiry = (validUntil: string) => {
    const now = new Date()
    const expiry = new Date(validUntil)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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

  if (!quotation) {
    return null
  }

  const statusBadge = getQuotationStatusBadge(quotation.status, quotation.validUntil)
  const StatusIcon = statusBadge.icon
  const daysUntilExpiry = getDaysUntilExpiry(quotation.validUntil)

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
          <h1 className="text-3xl font-bold">{quotation.quotationNumber}</h1>
          <p className="text-muted-foreground">
            Detail penawaran dan status persetujuan
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quotation Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                Status Penawaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {statusBadge.label}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Diperbarui {formatDate(quotation.updatedAt)}
                </p>
              </div>

              {/* Status Information */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Tanggal Penawaran:</span>
                  <span className="text-sm font-medium">{formatDate(quotation.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Berlaku Hingga:</span>
                  <span className={`text-sm font-medium ${
                    daysUntilExpiry <= 0 ? 'text-red-600' : daysUntilExpiry <= 3 ? 'text-amber-600' : ''
                  }`}>
                    {formatDate(quotation.validUntil)}
                  </span>
                </div>
              </div>

              {/* Expiry Warning */}
              {quotation.status === 'PENDING' && daysUntilExpiry > 0 && daysUntilExpiry <= 3 && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="font-medium">Perhatian</p>
                  </div>
                  <p className="text-sm text-amber-700 mt-1">
                    Penawaran akan kedaluwarsa dalam {daysUntilExpiry} hari. 
                    Silakan hubungi tim sales jika memerlukan perpanjangan.
                  </p>
                </div>
              )}

              {/* Status Messages */}
              {quotation.status === 'APPROVED' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <p className="font-medium">Penawaran Disetujui</p>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Penawaran Anda telah disetujui dan akan segera dikonversi menjadi pesanan.
                  </p>
                </div>
              )}

              {quotation.status === 'REJECTED' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <X className="h-4 w-4" />
                    <p className="font-medium">Penawaran Ditolak</p>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Penawaran Anda tidak dapat diproses. Silakan hubungi tim sales untuk informasi lebih lanjut.
                  </p>
                </div>
              )}

              {quotation.status === 'CONVERTED' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <CheckCircle className="h-4 w-4" />
                    <p className="font-medium">Penawaran Dikonversi</p>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Penawaran telah dikonversi menjadi pesanan. Anda dapat melihat detail pesanan di tab Pesanan.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quotation Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produk yang Diminta
              </CardTitle>
              <CardDescription>
                {quotation.items?.length || 0} produk dalam penawaran ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotation.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {item.product?.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.product?.sku}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.product?.brand?.name} • {item.product?.useCase}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Catatan: {item.notes}
                        </p>
                      )}
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
                )) || (
                  <p className="text-center text-muted-foreground py-4">
                    Tidak ada produk dalam penawaran ini
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              {/* Quotation Total */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatIDR(quotation.subtotal || 0)}</span>
                </div>
                {quotation.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Pajak</span>
                    <span>{formatIDR(quotation.taxAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatIDR(quotation.totalAmount || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quotation Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informasi Penawaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Nomor Penawaran</p>
                <p className="text-sm text-muted-foreground">{quotation.quotationNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tanggal Dibuat</p>
                <p className="text-sm text-muted-foreground">{formatDate(quotation.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Berlaku Hingga</p>
                <p className="text-sm text-muted-foreground">{formatDate(quotation.validUntil)}</p>
              </div>
              {quotation.notes && (
                <div>
                  <p className="text-sm font-medium">Catatan</p>
                  <p className="text-sm text-muted-foreground">{quotation.notes}</p>
                </div>
              )}
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
                <p className="text-sm text-muted-foreground">{customer?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{customer?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Telepon</p>
                <p className="text-sm text-muted-foreground">{customer?.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Jenis Akun</p>
                <Badge variant="outline">
                  {customer?.type === 'B2B' ? 'Perusahaan' : 'Individu'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {quotation.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Alamat Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{customer?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {quotation.shippingAddress.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {quotation.shippingAddress.city}, {quotation.shippingAddress.province} {quotation.shippingAddress.postalCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {quotation.shippingAddress.country}
                  </p>
                  {quotation.shippingAddress.phone && (
                    <p className="text-sm text-muted-foreground">
                      Tel: {quotation.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Butuh Bantuan?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Jika Anda memiliki pertanyaan tentang penawaran ini, silakan hubungi tim sales kami.
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Hubungi Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}