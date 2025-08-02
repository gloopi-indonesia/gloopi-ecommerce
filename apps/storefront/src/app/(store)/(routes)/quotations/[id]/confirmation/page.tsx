'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/native/separator'
import { CheckCircle, Clock, Package, Phone, Mail, MapPin } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'

interface QuotationData {
  id: string
  quotationNumber: string
  status: string
  subtotal: number
  totalAmount: number
  validUntil: string
  notes?: string
  createdAt: string

  customer: {
    name: string
    email: string
    phone: string
    type: string
    company?: {
      name: string
      industry: string
    }
  }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    product: {
      id: string
      name: string
      images: string[]
      sku: string
    }
  }>
  shippingAddress?: {
    address: string
    city: string
    province: string
    postalCode: string
  }
}

export default function QuotationConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const [quotation, setQuotation] = useState<QuotationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const quotationId = params.id as string

  const fetchQuotation = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/quotations/${quotationId}`)
      
      if (!response.ok) {
        throw new Error('Gagal memuat data penawaran')
      }

      const data = await response.json()
      setQuotation(data)
    } catch (error) {
      console.error('Error fetching quotation:', error)
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (quotationId) {
      fetchQuotation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationId])

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount / 100)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Menunggu Review</Badge>
      case 'APPROVED':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Disetujui</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Ditolak</Badge>
      case 'CONVERTED':
        return <Badge variant="default"><Package className="w-3 h-3 mr-1" />Dikonversi ke Pesanan</Badge>
      case 'EXPIRED':
        return <Badge variant="outline">Kedaluwarsa</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="w-12 h-12" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !quotation) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              {error || 'Data penawaran tidak ditemukan'}
            </p>
            <Button onClick={() => router.push('/products')}>
              Kembali ke Produk
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <h1 className="text-2xl font-bold">Permintaan Penawaran Berhasil Dikirim!</h1>
        </div>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Terima kasih atas permintaan penawaran Anda. Tim kami akan segera meninjau permintaan Anda 
          dan mengirimkan penawaran resmi dalam waktu 1-2 hari kerja.
        </p>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="text-sm">
            <span className="font-medium">Nomor Penawaran: </span>
            <span className="font-mono">{quotation.quotationNumber}</span>
          </div>
          {getStatusBadge(quotation.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Produk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quotation.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={item.product.images?.[0] || '/placeholder.png'}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.product.sku}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatIDR(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-medium">{formatIDR(item.totalPrice)}</p>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total Estimasi</span>
                <span>{formatIDR(quotation.totalAmount)}</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                * Harga final akan dikonfirmasi dalam penawaran resmi
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pelanggan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-sm">{quotation.customer.email}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Telepon</span>
                  </div>
                  <p className="text-sm">{quotation.customer.phone}</p>
                </div>
              </div>

              {quotation.customer.company && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Perusahaan</span>
                  </div>
                  <p className="text-sm">{quotation.customer.company.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Industri: {quotation.customer.company.industry}
                  </p>
                </div>
              )}

              {quotation.shippingAddress && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Alamat Pengiriman</span>
                  </div>
                  <p className="text-sm">
                    {quotation.shippingAddress.address}<br />
                    {quotation.shippingAddress.city}, {quotation.shippingAddress.province} {quotation.shippingAddress.postalCode}
                  </p>
                </div>
              )}

              {quotation.notes && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Catatan</span>
                  <p className="text-sm text-muted-foreground">{quotation.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary & Actions */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status Penawaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {getStatusBadge(quotation.status)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Dibuat:</span>
                  <span>{formatDate(quotation.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Berlaku hingga:</span>
                  <span>{formatDate(quotation.validUntil)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Langkah Selanjutnya</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Tim kami akan meninjau permintaan Anda dalam 1-2 hari kerja</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Anda akan menerima penawaran resmi melalui email</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Tim sales kami mungkin akan menghubungi Anda untuk konfirmasi detail</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/products')} 
                  className="w-full"
                >
                  Lanjut Belanja
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/profile')} 
                  className="w-full"
                >
                  Lihat Riwayat Penawaran
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Butuh Bantuan?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>+62 21 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>sales@gloopi.com</span>
              </div>
              <p className="text-muted-foreground">
                Hubungi tim sales kami jika Anda memiliki pertanyaan tentang penawaran ini.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}