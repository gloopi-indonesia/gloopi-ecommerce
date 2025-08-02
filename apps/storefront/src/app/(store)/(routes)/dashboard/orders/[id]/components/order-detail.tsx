'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuthentication } from '@/hooks/useAuthentication'
import { formatIDR } from '@/lib/utils/currency'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  MapPin, 
  Calendar,
  User,
  Receipt,
  Loader,
  CheckCircle,
  Clock,
  X,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface OrderDetailProps {
  orderId: string
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const { customer, isLoading: authLoading } = useAuthentication()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push('/login')
      return
    }

    if (customer) {
      fetchOrder()
    }
  }, [customer, authLoading, orderId, router])

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()

      if (response.ok) {
        setOrder(data.order)
      } else {
        toast.error(data.error || 'Gagal memuat detail pesanan')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Fetch order error:', error)
      toast.error('Terjadi kesalahan saat memuat detail pesanan')
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      NEW: { label: 'Baru', variant: 'secondary' as const, icon: Clock },
      PROCESSING: { label: 'Diproses', variant: 'default' as const, icon: Package },
      SHIPPED: { label: 'Dikirim', variant: 'default' as const, icon: Truck },
      DELIVERED: { label: 'Selesai', variant: 'default' as const, icon: CheckCircle },
      CANCELLED: { label: 'Dibatalkan', variant: 'destructive' as const, icon: X },
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

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const statusBadge = getOrderStatusBadge(order.status)
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
          <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Detail pesanan dan status pengiriman
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                Status Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {statusBadge.label}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Diperbarui {formatDate(order.updatedAt)}
                </p>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                {order.statusLogs.map((log: any, index: number) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      index === 0 ? 'bg-primary' : 'bg-muted'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">
                        {getOrderStatusBadge(log.toStatus).label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(log.createdAt)} • oleh {log.adminUser.name}
                      </p>
                      {log.notes && (
                        <p className="text-sm mt-1">{log.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tracking Information */}
              {order.trackingNumber && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4" />
                    <p className="font-medium">Informasi Pengiriman</p>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">Nomor Resi:</span> {order.trackingNumber}
                  </p>
                  {order.shippedAt && (
                    <p className="text-sm">
                      <span className="font-medium">Tanggal Kirim:</span> {formatDate(order.shippedAt)}
                    </p>
                  )}
                  {order.deliveredAt && (
                    <p className="text-sm">
                      <span className="font-medium">Tanggal Terima:</span> {formatDate(order.deliveredAt)}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produk Pesanan
              </CardTitle>
              <CardDescription>
                {order.items.length} produk dalam pesanan ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any) => (
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

              {/* Order Total */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatIDR(order.subtotal)}</span>
                </div>
                {order.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Pajak</span>
                    <span>{formatIDR(order.taxAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatIDR(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informasi Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Nomor Pesanan</p>
                <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tanggal Pesanan</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
              {order.quotation && (
                <div>
                  <p className="text-sm font-medium">Nomor Penawaran</p>
                  <p className="text-sm text-muted-foreground">{order.quotation.quotationNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
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
                  {order.shippingAddress.address}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.country}
                </p>
                {order.shippingAddress.phone && (
                  <p className="text-sm text-muted-foreground">
                    Tel: {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Information */}
          {order.invoice && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Faktur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Nomor Faktur</p>
                    <p className="text-sm text-muted-foreground">{order.invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status Pembayaran</p>
                    <Badge variant={order.invoice.status === 'PAID' ? 'default' : 'secondary'}>
                      {order.invoice.status === 'PAID' ? 'Lunas' : 'Belum Bayar'}
                    </Badge>
                  </div>
                  {order.invoice.dueDate && (
                    <div>
                      <p className="text-sm font-medium">Jatuh Tempo</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.invoice.dueDate)}
                      </p>
                    </div>
                  )}
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/dashboard/invoices/${order.invoice.id}`}>
                      <Receipt className="h-4 w-4 mr-2" />
                      Lihat Faktur
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}