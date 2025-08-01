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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  totalAmount: number
  customer: {
    id: string
    name: string
    type: 'B2B' | 'B2C'
    companyId?: string
    company?: {
      id: string
      name: string
      taxId: string
      registrationNumber: string
    }
  }
  taxInvoiceRequested: boolean
}

interface TaxInvoiceGeneratorProps {
  invoice: Invoice
  onTaxInvoiceCreated?: () => void
}

export function TaxInvoiceGenerator({ invoice, onTaxInvoiceCreated }: TaxInvoiceGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const canGenerateTaxInvoice = () => {
    if (invoice.status !== 'PAID') {
      return { canGenerate: false, reason: 'Faktur harus dalam status "Dibayar" untuk membuat faktur pajak' }
    }

    if (invoice.taxInvoiceRequested) {
      return { canGenerate: false, reason: 'Faktur pajak sudah dibuat untuk faktur ini' }
    }

    if (invoice.customer.type !== 'B2B') {
      return { canGenerate: false, reason: 'Faktur pajak hanya dapat dibuat untuk pelanggan B2B' }
    }

    if (!invoice.customer.company) {
      return { canGenerate: false, reason: 'Pelanggan harus memiliki profil perusahaan untuk faktur pajak' }
    }

    return { canGenerate: true, reason: '' }
  }

  const validateTaxInformation = () => {
    const errors: string[] = []
    const company = invoice.customer.company

    if (!company) {
      errors.push('Profil perusahaan tidak ditemukan')
      return errors
    }

    // Validate NPWP format
    if (!company.taxId) {
      errors.push('NPWP perusahaan diperlukan')
    } else if (!/^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/.test(company.taxId)) {
      errors.push('Format NPWP tidak valid (contoh: 01.234.567.8-901.000)')
    }

    if (!company.registrationNumber) {
      errors.push('Nomor registrasi perusahaan diperlukan')
    }

    return errors
  }

  const handleGenerateTaxInvoice = async () => {
    if (!selectedCompanyId) {
      toast.error('Pilih perusahaan terlebih dahulu')
      return
    }

    setIsLoading(true)
    setValidationErrors([])

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/tax-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: invoice.customer.id,
          companyId: selectedCompanyId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat faktur pajak')
      }

      toast.success('Faktur pajak berhasil dibuat')
      setIsOpen(false)
      onTaxInvoiceCreated?.()
    } catch (error) {
      console.error('Error generating tax invoice:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal membuat faktur pajak')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = () => {
    const errors = validateTaxInformation()
    setValidationErrors(errors)
    
    if (invoice.customer.company) {
      setSelectedCompanyId(invoice.customer.company.id)
    }
    
    setIsOpen(true)
  }

  const { canGenerate, reason } = canGenerateTaxInvoice()

  if (!canGenerate) {
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
        <Button variant="outline" size="sm" onClick={handleOpenDialog}>
          <FileText className="h-4 w-4 mr-2" />
          Buat Faktur Pajak
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Buat Faktur Pajak PPN</DialogTitle>
          <DialogDescription>
            Buat faktur pajak PPN untuk faktur {invoice.invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Informasi pajak tidak lengkap:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="company">Perusahaan</Label>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih perusahaan" />
              </SelectTrigger>
              <SelectContent>
                {invoice.customer.company && (
                  <SelectItem value={invoice.customer.company.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{invoice.customer.company.name}</span>
                      <span className="text-sm text-muted-foreground">
                        NPWP: {invoice.customer.company.taxId || 'Tidak ada'}
                      </span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

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

          {validationErrors.length === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Informasi pajak lengkap. Faktur pajak siap dibuat.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={handleGenerateTaxInvoice}
            disabled={isLoading || validationErrors.length > 0 || !selectedCompanyId}
          >
            {isLoading ? 'Membuat...' : 'Buat Faktur Pajak'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}