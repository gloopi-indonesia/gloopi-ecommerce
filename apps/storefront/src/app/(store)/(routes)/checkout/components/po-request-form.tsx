'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/native/separator'
import { useCartContext } from '@/state/Cart'

import { isVariableValid } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

const poRequestSchema = z.object({
  // Customer Information
  customerType: z.enum(['B2B', 'B2C'], {
    required_error: 'Pilih jenis pelanggan',
  }),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  
  // Company Information (for B2B)
  companyName: z.string().optional(),
  companyRegistrationNumber: z.string().optional(),
  taxId: z.string().optional(), // NPWP
  industry: z.enum(['MEDICAL', 'MANUFACTURING', 'FOOD', 'OTHER']).optional(),
  
  // Shipping Address (optional)
  needsShipping: z.boolean().default(false),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingProvince: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  
  // Additional Information
  notes: z.string().optional(),
  urgency: z.enum(['NORMAL', 'URGENT', 'VERY_URGENT']).default('NORMAL'),
}).refine((data) => {
  // If B2B, company information is required
  if (data.customerType === 'B2B') {
    return data.companyName && data.companyName.length > 0
  }
  return true
}, {
  message: 'Nama perusahaan wajib diisi untuk pelanggan B2B',
  path: ['companyName'],
}).refine((data) => {
  // If needs shipping, address fields are required
  if (data.needsShipping) {
    return data.shippingAddress && data.shippingCity && data.shippingProvince && data.shippingPostalCode
  }
  return true
}, {
  message: 'Alamat pengiriman lengkap wajib diisi',
  path: ['shippingAddress'],
})

type PORequestFormData = z.infer<typeof poRequestSchema>

export function PORequestForm() {
  const router = useRouter()
  const { cart } = useCartContext()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PORequestFormData>({
    resolver: zodResolver(poRequestSchema),
    defaultValues: {
      customerType: 'B2C',
      needsShipping: false,
      urgency: 'NORMAL',
    },
  })

  const customerType = form.watch('customerType')
  const needsShipping = form.watch('needsShipping')

  const calculateTotal = () => {
    if (!isVariableValid(cart?.items)) return 0
    
    return cart.items.reduce((total: number, item: any) => {
      const quantity = item.quantity || item.count || 0
      const price = item.product?.basePrice || item.product?.price || 0
      return total + (quantity * price)
    }, 0)
  }

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount / 100) // Convert from cents
  }

  const onSubmit = async (data: PORequestFormData) => {
    try {
      setIsSubmitting(true)

      if (!isVariableValid(cart?.items) || cart.items.length === 0) {
        toast.error('Keranjang belanja kosong')
        return
      }

      const response = await fetch('/api/quotations/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          cartItems: cart.items,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengirim permintaan penawaran')
      }

      toast.success('Permintaan penawaran berhasil dikirim!')
      
      // Redirect to quotation confirmation page
      router.push(`/quotations/${result.quotationId}/confirmation`)
      
    } catch (error) {
      console.error('Error submitting PO request:', error)
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isVariableValid(cart?.items) || cart.items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Keranjang belanja Anda kosong.</p>
          <Button 
            onClick={() => router.push('/products')} 
            className="mt-4"
          >
            Lihat Produk
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.items.map((item: any, index: number) => {
              const quantity = item.quantity || item.count || 0
              const price = item.product?.basePrice || item.product?.price || 0
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={item.product?.images?.[0] || '/placeholder.png'}
                      alt={item.product?.name || 'Product'}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {quantity} x {formatIDR(price)}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatIDR(quantity * price)}
                  </p>
                </div>
              )
            })}
            
            <Separator />
            
            <div className="flex justify-between items-center font-semibold">
              <span>Total Estimasi</span>
              <span>{formatIDR(calculateTotal())}</span>
            </div>
            
            <div className="text-xs text-muted-foreground">
              * Harga final akan dikonfirmasi dalam penawaran resmi
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PO Request Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Permintaan Penawaran</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Type */}
                <FormField
                  control={form.control}
                  name="customerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Pelanggan *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis pelanggan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="B2C">Individu (B2C)</SelectItem>
                          <SelectItem value="B2B">Perusahaan (B2B)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap *</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama lengkap" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon *</FormLabel>
                        <FormControl>
                          <Input placeholder="08xxxxxxxxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="nama@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company Information (B2B only) */}
                {customerType === 'B2B' && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-medium">Informasi Perusahaan</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Perusahaan *</FormLabel>
                            <FormControl>
                              <Input placeholder="PT. Nama Perusahaan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industri</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih industri" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MEDICAL">Medis</SelectItem>
                                <SelectItem value="MANUFACTURING">Manufaktur</SelectItem>
                                <SelectItem value="FOOD">Makanan</SelectItem>
                                <SelectItem value="OTHER">Lainnya</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyRegistrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nomor Registrasi Perusahaan</FormLabel>
                            <FormControl>
                              <Input placeholder="Nomor SIUP/NIB" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="taxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NPWP</FormLabel>
                            <FormControl>
                              <Input placeholder="xx.xxx.xxx.x-xxx.xxx" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Shipping Information */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="needsShipping"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Saya memerlukan pengiriman
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Centang jika Anda memerlukan pengiriman produk
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {needsShipping && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                      <h3 className="font-medium">Alamat Pengiriman</h3>
                      
                      <FormField
                        control={form.control}
                        name="shippingAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alamat Lengkap *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Jalan, nomor, RT/RW, kelurahan, kecamatan"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="shippingCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kota *</FormLabel>
                              <FormControl>
                                <Input placeholder="Jakarta" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="shippingProvince"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provinsi *</FormLabel>
                              <FormControl>
                                <Input placeholder="DKI Jakarta" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="shippingPostalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kode Pos *</FormLabel>
                              <FormControl>
                                <Input placeholder="12345" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tingkat Urgensi</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NORMAL">Normal (3-5 hari kerja)</SelectItem>
                            <SelectItem value="URGENT">Mendesak (1-2 hari kerja)</SelectItem>
                            <SelectItem value="VERY_URGENT">Sangat Mendesak (Hari ini)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan Tambahan</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Spesifikasi khusus, pertanyaan, atau informasi tambahan lainnya..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Mengirim Permintaan...' : 'Kirim Permintaan Penawaran'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}