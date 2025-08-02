/**
 * Indonesian Localization Demo Component for Storefront
 * Demonstrates customer-facing localization features
 */

'use client'

import { useLocalization } from '@/hooks/use-localization'

export function LocalizationDemo() {
  const { currency, date, number, messages } = useLocalization()

  // Sample product data
  const sampleProducts = [
    {
      name: 'Sarung Tangan Nitrile Medis',
      price: 25000, // in cents
      originalPrice: 30000,
      quantity: 100,
      category: 'medical',
    },
    {
      name: 'Sarung Tangan Latex Industri',
      price: 15000,
      originalPrice: null,
      quantity: 50,
      category: 'manufacturing',
    },
  ]

  const sampleOrder = {
    orderNumber: 'ORD/2024/01/0123',
    orderDate: new Date('2024-01-15'),
    status: 'ORDER_PROCESSING' as const,
    estimatedDelivery: new Date('2024-01-22'),
    items: sampleProducts,
    total: 40000,
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Demo Lokalisasi Storefront
        </h1>
        <p className="text-gray-600 mt-2">
          Contoh penggunaan bahasa Indonesia untuk pelanggan
        </p>
      </div>

      {/* Product Display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {messages.ui('PRODUCTS')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleProducts.map((product, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              
              <div className="mt-2 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-green-600">
                    {currency.format(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {currency.format(product.originalPrice)}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600">
                  {messages.formLabel('QUANTITY')}: {number.formatQuantity(product.quantity, 'piece')}
                </p>
                
                <div className="mt-3 space-x-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                    {messages.ui('ADD_TO_CART')}
                  </button>
                  <button className="border border-gray-300 px-4 py-2 rounded text-sm">
                    {messages.ui('VIEW')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {messages.ui('ORDER_STATUS')}
        </h2>
        
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold">{sampleOrder.orderNumber}</h3>
              <p className="text-sm text-gray-600">
                {messages.ui('ORDER_DATE')}: {date.format(sampleOrder.orderDate, 'long')}
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {messages.status(sampleOrder.status)}
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{messages.ui('ESTIMATED_DELIVERY')}:</span>
              <span>{date.format(sampleOrder.estimatedDelivery, 'long')}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>{messages.ui('TOTAL')}:</span>
              <span>{currency.format(sampleOrder.total)}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <button className="text-blue-600 text-sm hover:underline">
              {messages.ui('TRACK_SHIPMENT')}
            </button>
          </div>
        </div>
      </div>

      {/* Form Example */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Contoh Formulir
        </h2>
        
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {messages.formLabel('FULL_NAME')}
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Masukkan nama lengkap"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {messages.formLabel('EMAIL')}
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="contoh@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {messages.formLabel('PHONE')}
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="08123456789"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {messages.formLabel('COMPANY_NAME')} {messages.formLabel('OPTIONAL')}
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Nama perusahaan (opsional)"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {messages.formLabel('ADDRESS')}
            </label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
              placeholder="Alamat lengkap"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              {messages.ui('SUBMIT')}
            </button>
            <button
              type="button"
              className="border border-gray-300 px-6 py-2 rounded hover:bg-gray-50"
            >
              {messages.ui('CANCEL')}
            </button>
          </div>
        </form>
      </div>

      {/* Error and Success Messages */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Contoh Pesan Sistem
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <div className="flex">
              <div className="text-red-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Terjadi Kesalahan
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {messages.error('INVALID_EMAIL')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <div className="flex">
              <div className="text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Berhasil!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  {messages.success('PO_REQUEST_SUBMITTED')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <div className="flex">
              <div className="text-blue-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Informasi
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Pesanan Anda sedang diproses. Estimasi pengiriman 3-7 hari kerja.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Number Formatting Examples */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Format Angka dan Mata Uang
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-green-600">
              {currency.format(125000)}
            </div>
            <div className="text-sm text-gray-600">Harga Produk</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-blue-600">
              {number.format(1234)}
            </div>
            <div className="text-sm text-gray-600">Jumlah Terjual</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {number.formatFileSize(2048576)}
            </div>
            <div className="text-sm text-gray-600">Ukuran Katalog</div>
          </div>
        </div>
      </div>
    </div>
  )
}