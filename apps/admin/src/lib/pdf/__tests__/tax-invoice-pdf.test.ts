import { describe, it, expect } from 'vitest'
import { generateTaxInvoicePDFHTML, getDefaultCompanyInfo } from '../tax-invoice-pdf'

describe('Tax Invoice PDF Generation', () => {
  const mockTaxInvoice = {
    id: 'tax-invoice-123',
    taxInvoiceNumber: '010.000-24.00000001',
    ppnRate: 0.11,
    ppnAmount: 11000, // IDR 110 in cents
    totalWithPPN: 111000, // IDR 1,110 in cents
    issuedAt: new Date('2024-01-15T10:00:00Z'),
    issuedBy: 'Admin User',
    createdAt: new Date(),
    updatedAt: new Date(),
    invoiceId: 'invoice-123',
    customerId: 'customer-123',
    companyId: 'company-123',
    customer: {
      id: 'customer-123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+6281234567890',
      type: 'B2B' as const,
      password: null,
      emailVerificationToken: null,
      isEmailVerified: true,
      isPhoneVerified: true,
      companyId: 'company-123',
      taxInformation: null,
      communicationPreferences: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    company: {
      id: 'company-123',
      name: 'PT Test Company',
      taxId: '01.234.567.8-901.000',
      registrationNumber: 'REG-123456',
      industry: 'MANUFACTURING' as const,
      email: 'company@test.com',
      phone: '+6221123456',
      website: 'https://test.com',
      contactPerson: 'Jane Smith',
      address: 'Jl. Test No. 123',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '12345',
      country: 'Indonesia',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    invoice: {
      id: 'invoice-123',
      invoiceNumber: 'INV-2024-001',
      orderId: 'order-123',
      customerId: 'customer-123',
      subtotal: 100000, // IDR 1,000 in cents
      taxAmount: 0,
      totalAmount: 100000,
      status: 'PAID' as const,
      dueDate: new Date(),
      paidAt: new Date(),
      paymentMethod: 'bank_transfer',
      paymentNotes: null,
      taxInvoiceRequested: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: {
        id: 'customer-123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+6281234567890',
        type: 'B2B' as const,
        password: null,
        emailVerificationToken: null,
        isEmailVerified: true,
        isPhoneVerified: true,
        companyId: 'company-123',
        taxInformation: null,
        communicationPreferences: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      items: [
        {
          id: 'item-1',
          quantity: 10,
          unitPrice: 10000, // IDR 100 in cents
          totalPrice: 100000, // IDR 1,000 in cents
          product: {
            name: 'Sarung Tangan Nitrile',
            sku: 'GLV-NTR-001'
          }
        }
      ]
    }
  }

  describe('generateTaxInvoicePDFHTML', () => {
    it('should generate valid HTML for tax invoice', () => {
      const companyInfo = getDefaultCompanyInfo()
      const html = generateTaxInvoicePDFHTML({
        taxInvoice: mockTaxInvoice,
        companyInfo
      })

      // Check that HTML contains required elements
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html lang="id">')
      expect(html).toContain('Faktur Pajak')
      expect(html).toContain('Pajak Pertambahan Nilai')
      
      // Check tax invoice number
      expect(html).toContain(mockTaxInvoice.taxInvoiceNumber)
      
      // Check company information
      expect(html).toContain(companyInfo.name)
      expect(html).toContain(companyInfo.npwp)
      
      // Check customer company information
      expect(html).toContain(mockTaxInvoice.company.name)
      expect(html).toContain(mockTaxInvoice.company.taxId)
      
      // Check customer contact information
      expect(html).toContain(mockTaxInvoice.customer.name)
      expect(html).toContain(mockTaxInvoice.customer.email)
      
      // Check invoice reference
      expect(html).toContain(mockTaxInvoice.invoice.invoiceNumber)
      
      // Check product items
      expect(html).toContain('Sarung Tangan Nitrile')
      expect(html).toContain('GLV-NTR-001')
      
      // Check amounts (formatted as IDR)
      expect(html).toMatch(/Rp\s+1\.000/) // Subtotal
      expect(html).toMatch(/Rp\s+110/) // PPN amount  
      expect(html).toMatch(/Rp\s+1\.110/) // Total with PPN
      
      // Check PPN rate
      expect(html).toContain('11%')
      
      // Check issued by
      expect(html).toContain(mockTaxInvoice.issuedBy)
    })

    it('should handle multiple items correctly', () => {
      const taxInvoiceWithMultipleItems = {
        ...mockTaxInvoice,
        invoice: {
          ...mockTaxInvoice.invoice,
          items: [
            {
              id: 'item-1',
              quantity: 10,
              unitPrice: 10000,
              totalPrice: 100000,
              product: {
                name: 'Sarung Tangan Nitrile',
                sku: 'GLV-NTR-001'
              }
            },
            {
              id: 'item-2',
              quantity: 5,
              unitPrice: 20000,
              totalPrice: 100000,
              product: {
                name: 'Sarung Tangan Latex',
                sku: 'GLV-LTX-001'
              }
            }
          ]
        }
      }

      const companyInfo = getDefaultCompanyInfo()
      const html = generateTaxInvoicePDFHTML({
        taxInvoice: taxInvoiceWithMultipleItems,
        companyInfo
      })

      // Check that both items are included
      expect(html).toContain('Sarung Tangan Nitrile')
      expect(html).toContain('GLV-NTR-001')
      expect(html).toContain('Sarung Tangan Latex')
      expect(html).toContain('GLV-LTX-001')
      
      // Check item numbering
      expect(html).toContain('<td class="text-center">1</td>')
      expect(html).toContain('<td class="text-center">2</td>')
    })

    it('should format Indonesian date correctly', () => {
      const companyInfo = getDefaultCompanyInfo()
      const html = generateTaxInvoicePDFHTML({
        taxInvoice: mockTaxInvoice,
        companyInfo
      })

      // Check that date is formatted in Indonesian
      expect(html).toContain('15 Januari 2024')
    })

    it('should include proper CSS styling', () => {
      const companyInfo = getDefaultCompanyInfo()
      const html = generateTaxInvoicePDFHTML({
        taxInvoice: mockTaxInvoice,
        companyInfo
      })

      // Check that CSS styles are included
      expect(html).toContain('<style>')
      expect(html).toContain('font-family: \'Arial\', sans-serif')
      expect(html).toContain('.items-table')
      expect(html).toContain('.signature-section')
      expect(html).toContain('@media print')
    })
  })

  describe('getDefaultCompanyInfo', () => {
    it('should return default company information', () => {
      const companyInfo = getDefaultCompanyInfo()

      expect(companyInfo).toEqual({
        name: 'PT Gloopi Indonesia',
        address: 'Jl. Industri Raya No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
        phone: '+62 21 1234 5678',
        email: 'info@gloopi.co.id',
        npwp: '01.234.567.8-901.000'
      })
    })

    it('should have valid NPWP format', () => {
      const companyInfo = getDefaultCompanyInfo()
      const npwpRegex = /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/

      expect(companyInfo.npwp).toMatch(npwpRegex)
    })

    it('should have valid email format', () => {
      const companyInfo = getDefaultCompanyInfo()
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      expect(companyInfo.email).toMatch(emailRegex)
    })

    it('should have valid phone format', () => {
      const companyInfo = getDefaultCompanyInfo()

      expect(companyInfo.phone).toMatch(/^\+62/)
    })
  })
})