'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatIDR } from '@/lib/utils/currency'
import { 
  Package, 
  Eye, 
  Search, 
  Filter,
  Truck,
  CheckCircle,
  Clock,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'

interface OrdersTabProps {
  orders: any[]
  onRefresh: () => void
}

export function OrdersTab({ orders, onRefresh }: OrdersTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

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

  const getOrderStatusDescription = (status: string) => {
    const descriptions = {
      NEW: 'Pesanan baru menunggu diproses',
      PROCESSING: 'Pesanan sedang diproses',
      SHIPPED: 'Pesanan telah dikirim',
      DELIVERED: 'Pesanan telah diterima',
      CANCELLED: 'Pesanan dibatalkan',
    }
    return descriptions[status as keyof typeof descriptions] || 'Status tidak diketahui'
  }

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.items.some((item: any) => 
                             item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
                           )
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pesanan Saya</h2>
          <p className="text-muted-foreground">
            Lacak status pesanan dan informasi pengiriman
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          <Package className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor pesanan atau produk..."
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
                <SelectItem value="NEW">Baru</SelectItem>
                <SelectItem value="PROCESSING">Diproses</SelectItem>
                <SelectItem value="SHIPPED">Dikirim</SelectItem>
                <SelectItem value="DELIVERED">Selesai</SelectItem>
                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const statusBadge = getOrderStatusBadge(order.status)
            const StatusIcon = statusBadge.icon
            
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                      <CardDescription>
                        Dipesan pada {formatDate(order.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusBadge.label}
                      </Badge>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items Preview */}
                    <div>
                      <h4 className="font-medium mb-2">Produk ({order.items.length} item)</h4>
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                            {item.product.images?.[0] && (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
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
                        {order.items.length > 2 && (
                          <p className="text-sm text-muted-foreground text-center">
                            +{order.items.length - 2} produk lainnya
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {getOrderStatusDescription(order.status)}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-sm">
                            <span className="font-medium">Resi:</span> {order.trackingNumber}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-lg font-bold">{formatIDR(order.totalAmount)}</p>
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
                <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">Tidak ada pesanan ditemukan</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Coba ubah filter pencarian Anda'
                      : 'Anda belum memiliki pesanan. Mulai berbelanja sekarang!'
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