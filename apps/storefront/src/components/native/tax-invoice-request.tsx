'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, AlertCircle, CheckCircle, Building } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  totalAmount: number
  taxInvoiceRequested: boolean
  customer: {
    type: 'B2B' | 'B2C'
    company?: {
      name: string
      taxId: string
      registrationNumber: string
    }
  }
}

interface TaxInvoiceRequestProps {
  invoice: Invoice
  onRequestSubmitted?: () => void
}

export function TaxInvoiceRequest({ invoice, onRequestSubmitted }: TaxInvoiceRequestProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const canRequestTaxInvoice = () => {
    if (invoice.status !== 'PAID') {
      return { canRequest: false, reason: 'Faktur harus dalam status "Dibayar" untuk meminta faktur pajak' }
    }

    if (invoice.taxInvoiceRequested) {
      return { canRequest: false, reason: 'Faktur pajak sudah diminta untuk faktur ini' }
    }

    if (invoice.customer.type !== 'B2B') {
      return { canRequest: false, reason: 'Faktur pajak hanya tersedia untuk pelanggan B2B' }
    }

    if (!invoice.customer.company) {
      return { canRequest: false, reason: 'Profil perusahaan diperlukan untuk meminta faktur pajak' }
    }

    if (!invoice.customer.company.taxId) {
      return { canRequest: false, reason: 'NPWP perusahaan diperlukan untuk faktur pajak' }
    }

    return { canRequest: true, reason: '' }
  }

  const handleRequestTaxInvoice = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/request-tax-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal meminta faktur pajak')
      }

      toast.success('Permintaan faktur pajak berhasil dikirim')
      setIsOpen(false)
      onRequestSubmitted?.()
    } catch (error) {
      console.error('Error requesting tax invoice:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal meminta faktur pajak')
    } finally {
      setIsLoading(false)
    }
  }

  const { canRequest, reason } = canRequestTaxInvoice()

  if (invoice.taxInvoiceRequested) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span>Faktur pajak sudah diminta</span>
      </div>
    )
  }

  if (!canRequest) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span>{reason}</span>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Minta Faktur Pajak
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Permintaan Faktur Pajak PPN</DialogTitle>
          <DialogDescription>
            Minta faktur pajak PPN untuk faktur {invoice.invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Building className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Informasi Perusahaan:</p>
                <div className="text-sm space-y-1">
                  <p><strong>Nama:</strong> {invoice.customer.company?.name}</p>
                  <p><strong>NPWP:</strong> {invoice.customer.company?.taxId}</p>
                  <p><strong>No. Registrasi:</strong> {invoice.customer.company?.registrationNumber}</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Detail Faktur Pajak</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="ml-2 font-medium">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(invoice.totalAmount / 100)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">PPN (11%):</span>
                <span className="ml-2 font-medium">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format((invoice.totalAmount * 0.11) / 100)}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t">
                <span className="text-muted-foreground">Total dengan PPN:</span>
                <span className="ml-2 font-medium">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format((invoice.totalAmount * 1.11) / 100)}
                </span>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Catatan Penting:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Faktur pajak akan diproses oleh admin dalam 1-2 hari kerja</li>
                  <li>Anda akan menerima notifikasi ketika faktur pajak sudah siap</li>
                  <li>Faktur pajak dapat diunduh dari halaman detail faktur</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleRequestTaxInvoice} disabled={isLoading}>
            {isLoading ? 'Mengirim...' : 'Kirim Permintaan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}