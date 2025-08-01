'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, Search, Download, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'

interface TaxInvoice {
  id: string
  taxInvoiceNumber: string
  ppnAmount: number
  totalWithPPN: number
  issuedAt: string
  issuedBy: string
  customer: {
    id: string
    name: string
    email: string
  }
  company: {
    id: string
    name: string
    taxId: string
  }
  invoice: {
    id: string
    invoiceNumber: string
    totalAmount: number
  }
}

interface TaxInvoicesResponse {
  taxInvoices: TaxInvoice[]
  total: number
  pages: number
  currentPage: number
}

export default function TaxInvoicesPage() {
  const [taxInvoices, setTaxInvoices] = useState<TaxInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchTaxInvoices = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tax-invoices?page=${page}&limit=10`)
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data faktur pajak')
      }

      const data: { success: boolean; data: TaxInvoicesResponse } = await response.json()
      
      if (data.success) {
        setTaxInvoices(data.data.taxInvoices)
        setTotalPages(data.data.pages)
        setCurrentPage(data.data.currentPage)
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error('Error fetching tax invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTaxInvoices(currentPage)
  }, [currentPage])

  const filteredTaxInvoices = taxInvoices.filter(
    (taxInvoice) =>
      taxInvoice.taxInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taxInvoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taxInvoice.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taxInvoice.invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faktur Pajak PPN</h1>
          <p className="text-muted-foreground">
            Kelola faktur pajak PPN untuk pelanggan B2B
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Faktur Pajak</CardTitle>
          <CardDescription>
            Total {total} faktur pajak telah dibuat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nomor faktur pajak, pelanggan, atau perusahaan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Faktur Pajak</TableHead>
                  <TableHead>Faktur Asli</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Perusahaan</TableHead>
                  <TableHead>PPN</TableHead>
                  <TableHead>Total dengan PPN</TableHead>
                  <TableHead>Tanggal Terbit</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTaxInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'Tidak ada faktur pajak yang sesuai dengan pencarian' : 'Belum ada faktur pajak'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTaxInvoices.map((taxInvoice) => (
                    <TableRow key={taxInvoice.id}>
                      <TableCell className="font-medium">
                        {taxInvoice.taxInvoiceNumber}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/invoices/${taxInvoice.invoice.id}`}
                          className="text-primary hover:underline"
                        >
                          {taxInvoice.invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{taxInvoice.customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {taxInvoice.customer.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{taxInvoice.company.name}</p>
                          <p className="text-sm text-muted-foreground">
                            NPWP: {taxInvoice.company.taxId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {formatIDR(taxInvoice.ppnAmount)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatIDR(taxInvoice.totalWithPPN)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{format(new Date(taxInvoice.issuedAt), 'dd MMM yyyy', { locale: id })}</p>
                          <p className="text-sm text-muted-foreground">
                            oleh {taxInvoice.issuedBy}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/tax-invoices/${taxInvoice.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Lihat
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement PDF download
                              console.log('Download PDF for', taxInvoice.id)
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}