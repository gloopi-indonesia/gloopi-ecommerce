import { TaxInvoiceWithRelations } from '@/lib/services/tax-invoice'

export interface TaxInvoicePDFData {
  taxInvoice: TaxInvoiceWithRelations
  companyInfo: {
    name: string
    address: string
    city: string
    province: string
    postalCode: string
    phone: string
    email: string
    npwp: string
  }
}

/**
 * Generate HTML template for Indonesian PPN Tax Invoice
 */
export function generateTaxInvoicePDFHTML(data: TaxInvoicePDFData): string {
  const { taxInvoice, companyInfo } = data
  
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount / 100)
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date))
  }

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Faktur Pajak ${taxInvoice.taxInvoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        
        .container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        
        .header h1 {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
          text-transform: uppercase;
        }
        
        .header h2 {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        
        .invoice-info div {
          flex: 1;
        }
        
        .invoice-info h3 {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        
        .invoice-info p {
          margin-bottom: 3px;
        }
        
        .invoice-number {
          text-align: center;
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
        }
        
        .invoice-number h3 {
          font-size: 16px;
          font-weight: bold;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .items-table th,
        .items-table td {
          border: 1px solid #333;
          padding: 8px;
          text-align: left;
        }
        
        .items-table th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
        }
        
        .items-table .text-right {
          text-align: right;
        }
        
        .items-table .text-center {
          text-align: center;
        }
        
        .totals {
          margin-top: 20px;
          float: right;
          width: 300px;
        }
        
        .totals table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .totals td {
          padding: 5px 10px;
          border-bottom: 1px solid #ddd;
        }
        
        .totals .total-row {
          font-weight: bold;
          border-top: 2px solid #333;
          border-bottom: 2px solid #333;
        }
        
        .signature-section {
          clear: both;
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }
        
        .signature-box {
          width: 200px;
          text-align: center;
        }
        
        .signature-box h4 {
          margin-bottom: 60px;
          font-size: 12px;
        }
        
        .signature-box p {
          border-top: 1px solid #333;
          padding-top: 5px;
          font-size: 11px;
        }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
        
        @media print {
          .container {
            max-width: none;
            margin: 0;
            padding: 15px;
          }
          
          body {
            font-size: 11px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>Faktur Pajak</h1>
          <h2>Pajak Pertambahan Nilai</h2>
          <p>Sesuai dengan Peraturan Direktur Jenderal Pajak Nomor PER-03/PJ/2022</p>
        </div>
        
        <!-- Invoice Number -->
        <div class="invoice-number">
          <h3>Nomor Seri Faktur Pajak: ${taxInvoice.taxInvoiceNumber}</h3>
        </div>
        
        <!-- Company and Customer Info -->
        <div class="invoice-info">
          <div>
            <h3>Pengusaha Kena Pajak Penjual</h3>
            <p><strong>${companyInfo.name}</strong></p>
            <p>${companyInfo.address}</p>
            <p>${companyInfo.city}, ${companyInfo.province} ${companyInfo.postalCode}</p>
            <p>Telp: ${companyInfo.phone}</p>
            <p>Email: ${companyInfo.email}</p>
            <p><strong>NPWP: ${companyInfo.npwp}</strong></p>
          </div>
          
          <div>
            <h3>Pengusaha Kena Pajak Pembeli</h3>
            <p><strong>${taxInvoice.company.name}</strong></p>
            <p>${taxInvoice.company.address}</p>
            <p>${taxInvoice.company.city}, ${taxInvoice.company.province} ${taxInvoice.company.postalCode}</p>
            <p><strong>NPWP: ${taxInvoice.company.taxId}</strong></p>
            <br>
            <p><strong>Kontak:</strong></p>
            <p>${taxInvoice.customer.name}</p>
            <p>${taxInvoice.customer.email}</p>
            <p>${taxInvoice.customer.phone}</p>
          </div>
        </div>
        
        <!-- Invoice Details -->
        <div style="margin-bottom: 20px;">
          <p><strong>Tanggal Faktur:</strong> ${formatDate(taxInvoice.issuedAt)}</p>
          <p><strong>Faktur Referensi:</strong> ${taxInvoice.invoice.invoiceNumber}</p>
        </div>
        
        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 5%;">No</th>
              <th style="width: 40%;">Nama Barang Kena Pajak / Jasa Kena Pajak</th>
              <th style="width: 10%;">Kuantitas</th>
              <th style="width: 15%;">Harga Satuan</th>
              <th style="width: 15%;">Harga Jual</th>
              <th style="width: 15%;">Dasar Pengenaan Pajak</th>
            </tr>
          </thead>
          <tbody>
            ${taxInvoice.invoice.items.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>
                  <strong>${item.product.name}</strong><br>
                  <small>SKU: ${item.product.sku}</small>
                </td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatIDR(item.unitPrice)}</td>
                <td class="text-right">${formatIDR(item.totalPrice)}</td>
                <td class="text-right">${formatIDR(item.totalPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Totals -->
        <div class="totals">
          <table>
            <tr>
              <td>Jumlah Harga Jual:</td>
              <td class="text-right">${formatIDR(taxInvoice.invoice.subtotal)}</td>
            </tr>
            <tr>
              <td>Dasar Pengenaan Pajak:</td>
              <td class="text-right">${formatIDR(taxInvoice.invoice.subtotal)}</td>
            </tr>
            <tr>
              <td>PPN (${(taxInvoice.ppnRate * 100).toFixed(0)}%):</td>
              <td class="text-right">${formatIDR(taxInvoice.ppnAmount)}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Jumlah yang harus dibayar:</strong></td>
              <td class="text-right"><strong>${formatIDR(taxInvoice.totalWithPPN)}</strong></td>
            </tr>
          </tbody>
        </div>
        
        <!-- Signature Section -->
        <div class="signature-section">
          <div class="signature-box">
            <h4>Pembeli</h4>
            <p>${taxInvoice.customer.name}</p>
          </div>
          
          <div class="signature-box">
            <h4>Penjual</h4>
            <p>${taxInvoice.issuedBy}</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>Faktur Pajak ini telah dibuat sesuai dengan ketentuan yang berlaku</p>
          <p>Diterbitkan pada: ${formatDate(taxInvoice.issuedAt)} oleh ${taxInvoice.issuedBy}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate PDF buffer from tax invoice data
 * Note: This is a placeholder for PDF generation
 * In a real implementation, you would use a library like puppeteer or jsPDF
 */
export async function generateTaxInvoicePDF(data: TaxInvoicePDFData): Promise<Buffer> {
  // This is a placeholder implementation
  // In production, you would use puppeteer or similar to generate actual PDF
  const html = generateTaxInvoicePDFHTML(data)
  
  // For now, return the HTML as a buffer
  // Replace this with actual PDF generation
  return Buffer.from(html, 'utf-8')
}

/**
 * Get default company information for PDF generation
 */
export function getDefaultCompanyInfo() {
  return {
    name: 'PT Gloopi Indonesia',
    address: 'Jl. Industri Raya No. 123',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postalCode: '12345',
    phone: '+62 21 1234 5678',
    email: 'info@gloopi.co.id',
    npwp: '01.234.567.8-901.000'
  }
}