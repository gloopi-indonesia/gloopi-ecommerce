/**
 * Indonesian Business Document Formatting
 * Handles formatting for invoices, quotations, and other business documents
 * according to Indonesian business standards
 */

import { formatIndonesianDate, formatBusinessDate } from './date'
import { formatIDR } from './currency'

/**
 * Generate Indonesian quotation number
 * Format: QUO/YYYY/MM/XXXX
 */
export function generateQuotationNumber(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const sequence = Math.floor(Math.random() * 9999) + 1 // In real app, this should be from database
  
  return `QUO/${year}/${month}/${sequence.toString().padStart(4, '0')}`
}

/**
 * Generate Indonesian order number
 * Format: ORD/YYYY/MM/XXXX
 */
export function generateOrderNumber(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const sequence = Math.floor(Math.random() * 9999) + 1 // In real app, this should be from database
  
  return `ORD/${year}/${month}/${sequence.toString().padStart(4, '0')}`
}

/**
 * Generate Indonesian invoice number
 * Format: INV/YYYY/MM/XXXX
 */
export function generateInvoiceNumber(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const sequence = Math.floor(Math.random() * 9999) + 1 // In real app, this should be from database
  
  return `INV/${year}/${month}/${sequence.toString().padStart(4, '0')}`
}

/**
 * Generate Indonesian tax invoice number (Faktur Pajak)
 * Format: FP/YYYY/MM/XXXX
 */
export function generateTaxInvoiceNumber(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const sequence = Math.floor(Math.random() * 9999) + 1 // In real app, this should be from database
  
  return `FP/${year}/${month}/${sequence.toString().padStart(4, '0')}`
}

/**
 * Format company information for documents
 */
export interface CompanyInfo {
  name: string
  address: string
  city: string
  postalCode: string
  phone: string
  email: string
  taxId?: string // NPWP
  registrationNumber?: string
}

export function formatCompanyInfo(company: CompanyInfo): string {
  let info = `${company.name}\n`
  info += `${company.address}\n`
  info += `${company.city} ${company.postalCode}\n`
  info += `Telp: ${company.phone}\n`
  info += `Email: ${company.email}`
  
  if (company.taxId) {
    info += `\nNPWP: ${company.taxId}`
  }
  
  if (company.registrationNumber) {
    info += `\nNo. Registrasi: ${company.registrationNumber}`
  }
  
  return info
}

/**
 * Format customer information for documents
 */
export interface CustomerInfo {
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  companyName?: string
  taxId?: string // NPWP
}

export function formatCustomerInfo(customer: CustomerInfo): string {
  let info = customer.companyName ? `${customer.companyName}\n` : ''
  info += `${customer.name}\n`
  
  if (customer.address) {
    info += `${customer.address}\n`
  }
  
  if (customer.city && customer.postalCode) {
    info += `${customer.city} ${customer.postalCode}\n`
  }
  
  if (customer.phone) {
    info += `Telp: ${customer.phone}\n`
  }
  
  if (customer.email) {
    info += `Email: ${customer.email}\n`
  }
  
  if (customer.taxId) {
    info += `NPWP: ${customer.taxId}`
  }
  
  return info.trim()
}

/**
 * Document item interface
 */
export interface DocumentItem {
  name: string
  description?: string
  quantity: number
  unitPrice: number // in cents
  totalPrice: number // in cents
  unit?: string
}

/**
 * Format document items table
 */
export function formatDocumentItems(items: DocumentItem[]): string {
  let table = 'No. | Nama Produk | Jumlah | Harga Satuan | Total\n'
  table += '----|-----------|---------|--------------|---------\n'
  
  items.forEach((item, index) => {
    const no = (index + 1).toString()
    const name = item.name + (item.description ? `\n${item.description}` : '')
    const quantity = `${item.quantity} ${item.unit || 'pcs'}`
    const unitPrice = formatIDR(item.unitPrice)
    const totalPrice = formatIDR(item.totalPrice)
    
    table += `${no} | ${name} | ${quantity} | ${unitPrice} | ${totalPrice}\n`
  })
  
  return table
}

/**
 * Calculate document totals
 */
export interface DocumentTotals {
  subtotal: number // in cents
  taxRate?: number // percentage (e.g., 11 for 11%)
  taxAmount?: number // in cents
  total: number // in cents
}

export function calculateDocumentTotals(
  items: DocumentItem[],
  taxRate?: number
): DocumentTotals {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  
  let taxAmount = 0
  if (taxRate) {
    taxAmount = Math.round(subtotal * (taxRate / 100))
  }
  
  const total = subtotal + taxAmount
  
  return {
    subtotal,
    taxRate,
    taxAmount,
    total,
  }
}

/**
 * Format document totals section
 */
export function formatDocumentTotals(totals: DocumentTotals): string {
  let section = `Subtotal: ${formatIDR(totals.subtotal)}\n`
  
  if (totals.taxRate && totals.taxAmount) {
    section += `PPN ${totals.taxRate}%: ${formatIDR(totals.taxAmount)}\n`
  }
  
  section += `**Total: ${formatIDR(totals.total)}**`
  
  return section
}

/**
 * Format document header
 */
export function formatDocumentHeader(
  documentType: 'PENAWARAN' | 'PESANAN' | 'FAKTUR' | 'FAKTUR PAJAK',
  documentNumber: string,
  date: Date
): string {
  return `**${documentType}**\n` +
         `Nomor: ${documentNumber}\n` +
         `Tanggal: ${formatBusinessDate(date)}`
}

/**
 * Format payment terms in Indonesian
 */
export function formatPaymentTerms(daysNet: number = 30): string {
  if (daysNet === 0) {
    return 'Pembayaran: Tunai'
  } else if (daysNet === 30) {
    return 'Pembayaran: Net 30 hari'
  } else {
    return `Pembayaran: Net ${daysNet} hari`
  }
}

/**
 * Format document footer with terms and conditions
 */
export function formatDocumentFooter(
  documentType: 'quotation' | 'order' | 'invoice' | 'tax-invoice'
): string {
  const commonTerms = [
    'Barang yang sudah dibeli tidak dapat dikembalikan kecuali ada kesepakatan khusus.',
    'Pembayaran dapat dilakukan melalui transfer bank atau tunai.',
    'Untuk pertanyaan lebih lanjut, silakan hubungi kami.',
  ]

  switch (documentType) {
    case 'quotation':
      return [
        'Syarat dan Ketentuan:',
        '• Penawaran ini berlaku selama 30 hari dari tanggal penerbitan.',
        '• Harga dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.',
        '• Konfirmasi pesanan diperlukan untuk memproses penawaran ini.',
        ...commonTerms,
      ].join('\n')

    case 'order':
      return [
        'Syarat dan Ketentuan:',
        '• Pesanan akan diproses setelah pembayaran diterima.',
        '• Waktu pengiriman 3-7 hari kerja setelah pembayaran.',
        '• Biaya pengiriman ditanggung oleh pembeli.',
        ...commonTerms,
      ].join('\n')

    case 'invoice':
      return [
        'Syarat dan Ketentuan:',
        '• Pembayaran paling lambat 30 hari setelah tanggal faktur.',
        '• Keterlambatan pembayaran akan dikenakan denda 2% per bulan.',
        '• Faktur pajak dapat diminta setelah pembayaran lunas.',
        ...commonTerms,
      ].join('\n')

    case 'tax-invoice':
      return [
        'Keterangan:',
        '• Faktur pajak ini merupakan bukti pungutan PPN yang sah.',
        '• Simpan faktur pajak ini untuk keperluan pelaporan pajak.',
        '• Hubungi kami jika ada kesalahan dalam faktur pajak ini.',
        ...commonTerms,
      ].join('\n')

    default:
      return commonTerms.join('\n')
  }
}

/**
 * Format complete business document
 */
export interface BusinessDocument {
  type: 'quotation' | 'order' | 'invoice' | 'tax-invoice'
  number: string
  date: Date
  company: CompanyInfo
  customer: CustomerInfo
  items: DocumentItem[]
  taxRate?: number
  paymentTerms?: number
  notes?: string
}

export function formatBusinessDocument(doc: BusinessDocument): string {
  const documentTypes: Record<BusinessDocument['type'], 'PENAWARAN' | 'PESANAN' | 'FAKTUR' | 'FAKTUR PAJAK'> = {
    quotation: 'PENAWARAN',
    order: 'PESANAN',
    invoice: 'FAKTUR',
    'tax-invoice': 'FAKTUR PAJAK',
  }

  const totals = calculateDocumentTotals(doc.items, doc.taxRate)

  let document = formatDocumentHeader(
    documentTypes[doc.type],
    doc.number,
    doc.date
  )

  document += '\n\n**Dari:**\n'
  document += formatCompanyInfo(doc.company)

  document += '\n\n**Kepada:**\n'
  document += formatCustomerInfo(doc.customer)

  document += '\n\n**Detail Produk:**\n'
  document += formatDocumentItems(doc.items)

  document += '\n\n**Ringkasan:**\n'
  document += formatDocumentTotals(totals)

  if (doc.paymentTerms !== undefined) {
    document += '\n\n' + formatPaymentTerms(doc.paymentTerms)
  }

  if (doc.notes) {
    document += '\n\n**Catatan:**\n'
    document += doc.notes
  }

  document += '\n\n' + formatDocumentFooter(doc.type)

  return document
}