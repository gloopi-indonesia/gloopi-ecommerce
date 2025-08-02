/**
 * Indonesian Localization Demo Component
 * Demonstrates the usage of Indonesian localization utilities
 * This component can be used for testing and as a reference
 */

'use client'

import { useLocalization } from '@/hooks/use-localization'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function LocalizationDemo() {
  const { currency, date, number, messages, documents } = useLocalization()

  // Sample data for demonstration
  const sampleData = {
    prices: [50000, 150000, 1500000, 15000000],
    dates: [new Date(), new Date('2024-01-15'), new Date('2023-12-25')],
    numbers: [1234, 5678.90, 1000000, 0.15],
    quantities: [
      { value: 100, unit: 'piece' as const },
      { value: 5, unit: 'box' as const },
      { value: 2.5, unit: 'kg' as const },
    ],
    fileSize: 1048576, // 1MB in bytes
    phoneNumbers: ['08123456789', '6281234567890', '021-12345678'],
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Demo Lokalisasi Indonesia</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrasi sistem lokalisasi bahasa Indonesia untuk platform Gloopi
        </p>
      </div>

      {/* Currency Formatting */}
      <Card>
        <CardHeader>
          <CardTitle>Format Mata Uang (IDR)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleData.prices.map((price, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="text-sm text-muted-foreground">
                  {price} cents →
                </span>
                <div className="space-x-2">
                  <Badge variant="outline">{currency.format(price)}</Badge>
                  <Badge variant="secondary">{currency.formatCompact(price)}</Badge>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <h4 className="font-semibold text-blue-900">Range Harga:</h4>
            <p className="text-blue-800">
              {currency.formatRange(sampleData.prices[0], sampleData.prices[3])}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Date Formatting */}
      <Card>
        <CardHeader>
          <CardTitle>Format Tanggal Indonesia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sampleData.dates.map((dateValue, index) => (
            <div key={index} className="p-3 bg-muted rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Lengkap:</span> {date.format(dateValue, 'full')}
                </div>
                <div>
                  <span className="font-medium">Panjang:</span> {date.format(dateValue, 'long')}
                </div>
                <div>
                  <span className="font-medium">Sedang:</span> {date.format(dateValue, 'medium')}
                </div>
                <div>
                  <span className="font-medium">Relatif:</span> {date.formatRelative(dateValue)}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Number Formatting */}
      <Card>
        <CardHeader>
          <CardTitle>Format Angka Indonesia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleData.numbers.map((num, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="text-sm text-muted-foreground">
                  {num} →
                </span>
                <div className="space-x-2">
                  <Badge variant="outline">{number.format(num, 2)}</Badge>
                  <Badge variant="secondary">{number.formatCompact(num)}</Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Format Kuantitas:</h4>
            {sampleData.quantities.map((qty, index) => (
              <div key={index} className="p-2 bg-green-50 rounded text-green-800">
                {number.formatQuantity(qty.value, qty.unit)}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Format Nomor Telepon:</h4>
            {sampleData.phoneNumbers.map((phone, index) => (
              <div key={index} className="flex justify-between p-2 bg-blue-50 rounded">
                <span className="text-blue-600">{phone}</span>
                <span className="text-blue-800 font-mono">
                  {number.formatPhone(phone)}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-purple-50 rounded">
            <h4 className="font-semibold text-purple-900">Ukuran File:</h4>
            <p className="text-purple-800">
              {sampleData.fileSize} bytes = {number.formatFileSize(sampleData.fileSize)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Pesan dan Label</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-red-700 mb-2">Pesan Error:</h4>
              <div className="space-y-1 text-sm">
                <div className="p-2 bg-red-50 text-red-800 rounded">
                  {messages.error('INVALID_CREDENTIALS')}
                </div>
                <div className="p-2 bg-red-50 text-red-800 rounded">
                  {messages.error('QUOTATION_EXPIRED')}
                </div>
                <div className="p-2 bg-red-50 text-red-800 rounded">
                  {messages.error('PRODUCT_OUT_OF_STOCK')}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-green-700 mb-2">Pesan Sukses:</h4>
              <div className="space-y-1 text-sm">
                <div className="p-2 bg-green-50 text-green-800 rounded">
                  {messages.success('QUOTATION_CREATED')}
                </div>
                <div className="p-2 bg-green-50 text-green-800 rounded">
                  {messages.success('ORDER_SHIPPED')}
                </div>
                <div className="p-2 bg-green-50 text-green-800 rounded">
                  {messages.success('INVOICE_PAID')}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Status:</h4>
              <div className="space-y-1 text-sm">
                <Badge className="bg-yellow-100 text-yellow-800">
                  {messages.status('QUOTATION_PENDING')}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  {messages.status('ORDER_PROCESSING')}
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  {messages.status('INVOICE_PAID')}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">Label Form:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {(['CUSTOMER_NAME', 'PRODUCT_NAME', 'ORDER_NUMBER', 'INVOICE_NUMBER'] as const).map((label) => (
                <div key={label} className="p-2 bg-gray-50 rounded">
                  {messages.formLabel(label)}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Numbers */}
      <Card>
        <CardHeader>
          <CardTitle>Nomor Dokumen Bisnis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded">
              <h4 className="font-semibold text-blue-900">Nomor Penawaran:</h4>
              <p className="font-mono text-blue-800">{documents.generateQuotationNumber()}</p>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <h4 className="font-semibold text-green-900">Nomor Pesanan:</h4>
              <p className="font-mono text-green-800">{documents.generateOrderNumber()}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <h4 className="font-semibold text-purple-900">Nomor Faktur:</h4>
              <p className="font-mono text-purple-800">{documents.generateInvoiceNumber()}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded">
              <h4 className="font-semibold text-orange-900">Nomor Faktur Pajak:</h4>
              <p className="font-mono text-orange-800">{documents.generateTaxInvoiceNumber()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}