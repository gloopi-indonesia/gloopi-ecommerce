'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { Heading } from '@/components/native/heading'
import { Clock, CheckCircle, Package, XCircle, AlertCircle } from 'lucide-react'

interface QuotationSummary {
  id: string
  quotationNumber: string
  status: string
  totalAmount: number
  validUntil: string
  createdAt: string
  itemCount: number
}

export default function QuotationsPage() {
  const router = useRouter()
  const { authenticated } = useAuthenticated()
  const [authLoading, setAuthLoading] = useState(true)
  const [quotations, setQuotations] = useState<QuotationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setAuthLoading(false)
    if (!authenticated) {
      router.push('/login')
      return
    }
    fetchQuotations()
  }, [authenticated, router])

  const fetchQuotations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/quotations')
      
      if (!response.ok) {
        throw new Error('Gagal memuat data penawaran')
      }

      const data = await response.json()
      setQuotations(data.quotations || [])
    } catch (error) {
      console.error('Error fetching quotations:', error)
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

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
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Menunggu Review
          </Badge>
        )
      case 'APPROVED':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Disetujui
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Ditolak
          </Badge>
        )
      case 'CONVERTED':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            Dikonversi ke Pesanan
          </Badge>
        )
      case 'EXPIRED':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Kedaluwarsa
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchQuotations}>Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Heading
        title="Riwayat Penawaran"
        description="Lihat semua permintaan penawaran yang pernah Anda ajukan."
      />

      {quotations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Anda belum memiliki riwayat penawaran.
            </p>
            <Button onClick={() => router.push('/products')}>
              Mulai Belanja
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quotations.map((quotation) => (
            <Card key={quotation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {quotation.quotationNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {quotation.itemCount} produk • Dibuat {formatDate(quotation.createdAt)}
                    </p>
                  </div>
                  {getStatusBadge(quotation.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-semibold">{formatIDR(quotation.totalAmount)}</p>
                    <p className="text-sm text-muted-foreground">
                      Berlaku hingga: {formatDate(quotation.validUntil)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/quotations/${quotation.id}/confirmation`)}
                  >
                    Lihat Detail
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}