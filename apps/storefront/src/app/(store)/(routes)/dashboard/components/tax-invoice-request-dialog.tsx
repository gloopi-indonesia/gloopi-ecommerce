'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuthentication } from '@/hooks/useAuthentication'
import { FileText, Loader } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface TaxInvoiceRequestDialogProps {
  invoice: any
  onRequest: () => void
}

export function TaxInvoiceRequestDialog({ invoice, onRequest }: TaxInvoiceRequestDialogProps) {
  const { customer } = useAuthentication()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [taxInfo, setTaxInfo] = useState({
    companyName: customer?.company?.name || '',
    taxId: customer?.company?.taxId || '',
    address: customer?.company?.address || '',
    city: customer?.company?.city || '',
    province: customer?.company?.province || '',
    postalCode: customer?.company?.postalCode || '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!taxInfo.companyName || !taxInfo.taxId) {
      toast.error('Nama perusahaan dan NPWP wajib diisi')
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/invoices/${invoice.id}/request-tax-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taxInformation: taxInfo,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setIsOpen(false)
        onRequest()
      } else {
        toast.error(data.error || 'Gagal meminta faktur pajak')
      }
    } catch (error) {
      console.error('Tax invoice request error:', error)
      toast.error('Terjadi kesalahan saat meminta faktur pajak')
    } finally {
      setIsLoading(false)
    }
  }

  const canRequestTaxInvoice = () => {
    if (invoice.status !== 'PAID') {
      return { canRequest: false, reason: 'Faktur pajak hanya dapat diminta untuk faktur yang sudah dibayar' }
    }
    
    if (customer?.type !== 'B2B') {
      return { canRequest: false, reason: 'Faktur pajak hanya dapat diminta oleh pelanggan B2B' }
    }
    
    if (invoice.taxInvoice) {
      return { canRequest: false, reason: 'Faktur pajak sudah tersedia' }
    }
    
    if (invoice.taxInvoiceRequested) {
      return { canRequest: false, reason: 'Permintaan faktur pajak sedang diproses' }
    }
    
    return { canRequest: true, reason: '' }
  }

  const { canRequest, reason } = canRequestTaxInvoice()

  if (!canRequest) {
    return (
      <Button variant="outline" size="sm" disabled title={reason}>
        <FileText className="h-4 w-4 mr-2" />
        Minta Faktur Pajak
      </Button>
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
          <DialogTitle>Permintaan Faktur Pajak (PPN)</DialogTitle>
          <DialogDescription>
            Lengkapi informasi berikut untuk meminta faktur pajak. Faktur pajak akan diproses dalam 1-2 hari kerja.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Nama Perusahaan *</Label>
              <Input
                id="companyName"
                value={taxInfo.companyName}
                onChange={(e) => setTaxInfo(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="PT. Nama Perusahaan"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="taxId">NPWP *</Label>
              <Input
                id="taxId"
                value={taxInfo.taxId}
                onChange={(e) => setTaxInfo(prev => ({ ...prev, taxId: e.target.value }))}
                placeholder="12.345.678.9-012.345"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Alamat Perusahaan</Label>
              <Input
                id="address"
                value={taxInfo.address}
                onChange={(e) => setTaxInfo(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Jl. Nama Jalan No. 123"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Kota</Label>
                <Input
                  id="city"
                  value={taxInfo.city}
                  onChange={(e) => setTaxInfo(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Jakarta"
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="province">Provinsi</Label>
                <Input
                  id="province"
                  value={taxInfo.province}
                  onChange={(e) => setTaxInfo(prev => ({ ...prev, province: e.target.value }))}
                  placeholder="DKI Jakarta"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                value={taxInfo.notes}
                onChange={(e) => setTaxInfo(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan tambahan untuk faktur pajak..."
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Permintaan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}