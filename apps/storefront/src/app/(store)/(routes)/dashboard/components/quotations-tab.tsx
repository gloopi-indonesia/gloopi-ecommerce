'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatIDR } from '@/lib/utils/currency'
import { 
  FileText, 
  Eye, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  X,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'

interface QuotationsTabProps {
  quotations: any[]
  onRefresh: () => void
}

export function QuotationsTab({ quotations, onRefresh }: QuotationsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

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

  const getQuotationStatusDescription = (status: string, validUntil: string) => {
    const isExpired = new Date() > new Date(validUntil)
    
    if (isExpired && status === 'PENDING') {
      return `Penawaran kedaluwarsa pada ${formatDate(validUntil)}`
    }
    
    const descriptions = {
      PENDING: `Berlaku hingga ${formatDate(validUntil)}`,
      APPROVED: 'Penawaran disetujui, menunggu konversi ke pesanan',
      REJECTED: 'Penawaran ditolak',
      CONVERTED: 'Penawaran telah dikonversi menjadi pesanan',
      EXPIRED: `Penawaran kedaluwarsa pada ${formatDate(validUntil)}`,
    }
    return descriptions[status as keyof typeof descriptions] || 'Status tidak diketahui'
  }

  // Filter and search quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter(quotation => {
      const matchesSearch = quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [quotations, searchTerm, statusFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getDaysUntilExpiry = (validUntil: string) => {
    const now = new Date()
    const expiry = new Date(validUntil)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Penawaran Saya</h2>
          <p className="text-muted-foreground">
            Lacak status penawaran dan permintaan pembelian
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Penawaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor penawaran..."
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
                <SelectItem value="PENDING">Menunggu</SelectItem>
                <SelectItem value="APPROVED">Disetujui</SelectItem>
                <SelectItem value="REJECTED">Ditolak</SelectItem>
                <SelectItem value="CONVERTED">Dikonversi</SelectItem>
                <SelectItem value="EXPIRED">Kedaluwarsa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotations List */}
      <div className="space-y-4">
        {filteredQuotations.length > 0 ? (
          filteredQuotations.map((quotation) => {
            const statusBadge = getQuotationStatusBadge(quotation.status, quotation.validUntil)
            const StatusIcon = statusBadge.icon
            const daysUntilExpiry = getDaysUntilExpiry(quotation.validUntil)
            
            return (
              <Card key={quotation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{quotation.quotationNumber}</CardTitle>
                      <CardDescription>
                        Dibuat pada {formatDate(quotation.createdAt)} • {quotation.itemCount} item
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusBadge.label}
                      </Badge>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/quotations/${quotation.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Quotation Summary */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {getQuotationStatusDescription(quotation.status, quotation.validUntil)}
                        </p>
                        
                        {/* Expiry Warning */}
                        {quotation.status === 'PENDING' && daysUntilExpiry > 0 && daysUntilExpiry <= 3 && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="h-4 w-4" />
                            <p className="text-sm font-medium">
                              Akan kedaluwarsa dalam {daysUntilExpiry} hari
                            </p>
                          </div>
                        )}
                        
                        {quotation.status === 'APPROVED' && (
                          <p className="text-sm text-green-600 font-medium">
                            Penawaran disetujui! Menunggu konversi ke pesanan.
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-lg font-bold">{formatIDR(quotation.totalAmount)}</p>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Status Penawaran</span>
                        <span className="text-muted-foreground">
                          {quotation.status === 'PENDING' && 'Menunggu Review'}
                          {quotation.status === 'APPROVED' && 'Siap Dikonversi'}
                          {quotation.status === 'CONVERTED' && 'Menjadi Pesanan'}
                          {quotation.status === 'REJECTED' && 'Ditolak'}
                          {quotation.status === 'EXPIRED' && 'Kedaluwarsa'}
                        </span>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            quotation.status === 'PENDING' ? 'bg-yellow-500 w-1/3' :
                            quotation.status === 'APPROVED' ? 'bg-blue-500 w-2/3' :
                            quotation.status === 'CONVERTED' ? 'bg-green-500 w-full' :
                            quotation.status === 'REJECTED' || quotation.status === 'EXPIRED' ? 'bg-red-500 w-full' :
                            'bg-gray-500 w-1/4'
                          }`}
                        />
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
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">Tidak ada penawaran ditemukan</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Coba ubah filter pencarian Anda'
                      : 'Anda belum memiliki penawaran. Mulai dengan menambahkan produk ke keranjang dan kirim permintaan penawaran.'
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