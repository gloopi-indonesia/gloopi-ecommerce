'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Download, FileText, Building, User } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'

interface TaxInvoiceDetail {
  id: string
  taxInvoiceNumber: string
  ppnRate: number
  ppnAmount: number
  totalWithPPN: number
  issuedAt: string
  issuedBy: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  company: {
    id: string
    name: string
    taxId: string
    registrationNumber: string
    address: string
    city: string
    province: string
    postalCode: string
  }
  invoice: {
    id: string
    invoiceNumber: string
    subtotal: number
    totalAmount: number
    dueDate: string
    paidAt: string
    customer: {
      name: string
    }
    items: Array<{
      id: string
      quantity: number
      unitPrice: number
      totalPrice: number
      product: {
        name: string
        sku: string
      }
    }>
  }
}

export default function TaxInvoiceDetailPage() {
  const params = useParams()
  const [taxInvoice, setTaxInvoice] = useState<TaxInvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTaxInvoice = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/tax-invoices/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Faktur pajak tidak ditemukan')
        }

        const data = await response.json()
        
        if (data.success) {
          setTaxInvoice(data.data)
        } else {
          throw new Error(data.error || 'Gagal mengambil data faktur pajak')
        }
      } catch (error) {
        console.error('Error fetching tax invoice:', error)
        setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTaxInvoice()
    }
  }, [params.id])

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount / 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Memuat faktur pajak...</p>
        </div>
      </div>
    )
  }

  if (error || !taxInvoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Faktur Pajak Tidak Ditemukan</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href="/tax-invoices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/tax-invoices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Faktur Pajak {taxInvoice.taxInvoiceNumber}
            </h1>
            <p className="text-muted-foreground">
              Diterbitkan pada {format(new Date(taxInvoice.issuedAt), 'dd MMMM yyyy', { locale: id })}
            </p>
          </div>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Unduh PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tax Invoice Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Detail Faktur Pajak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invoice Reference */}
            <div>
              <h4 className="font-medium mb-2">Faktur Referensi</h4>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{taxInvoice.invoice.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    Dibayar pada {format(new Date(taxInvoice.invoice.paidAt), 'dd MMM yyyy', { locale: id })}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/invoices/${taxInvoice.invoice.id}`}>
                    Lihat Faktur
                  </Link>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Tax Calculation */}
            <div>
              <h4 className="font-medium mb-4">Perhitungan PPN</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal (Dasar Pengenaan Pajak)</span>
                  <span className="font-medium">{formatIDR(taxInvoice.invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN ({(taxInvoice.ppnRate * 100).toFixed(0)}%)</span>
                  <span className="font-medium">{formatIDR(taxInvoice.ppnAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total dengan PPN</span>
                  <span>{formatIDR(taxInvoice.totalWithPPN)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div>
              <h4 className="font-medium mb-4">Rincian Barang</h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Harga Satuan</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxInvoice.invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatIDR(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatIDR(item.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer and Company Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informasi Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{taxInvoice.customer.name}</p>
                <p className="text-sm text-muted-foreground">{taxInvoice.customer.email}</p>
                <p className="text-sm text-muted-foreground">{taxInvoice.customer.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Informasi Perusahaan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{taxInvoice.company.name}</p>
                <p className="text-sm text-muted-foreground">
                  NPWP: {taxInvoice.company.taxId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Reg: {taxInvoice.company.registrationNumber}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium">Alamat:</p>
                <p className="text-sm text-muted-foreground">
                  {taxInvoice.company.address}
                </p>
                <p className="text-sm text-muted-foreground">
                  {taxInvoice.company.city}, {taxInvoice.company.province} {taxInvoice.company.postalCode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Issue Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Penerbitan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Tanggal Terbit:</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(taxInvoice.issuedAt), 'dd MMMM yyyy HH:mm', { locale: id })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Diterbitkan oleh:</p>
                <p className="text-sm text-muted-foreground">{taxInvoice.issuedBy}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}