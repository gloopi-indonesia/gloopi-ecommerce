import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { TaxInvoiceService } from '../tax-invoice'
import prisma from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    taxInvoice: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    invoice: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    customer: {
      findUnique: vi.fn(),
    },
    company: {
      findUnique: vi.fn(),
    },
  },
}))

describe('TaxInvoiceService', () => {
  let taxInvoiceService: TaxInvoiceService

  beforeEach(() => {
    taxInvoiceService = new TaxInvoiceService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('generateTaxInvoiceNumber', () => {
    it('should generate first tax invoice number for the year', async () => {
      const currentYear = new Date().getFullYear().toString().slice(-2)
      
      // Mock no existing tax invoices
      vi.mocked(prisma.taxInvoice.findFirst).mockResolvedValue(null)

      // Access private method through any
      const number = await (taxInvoiceService as any).generateTaxInvoiceNumber()

      expect(number).toBe(`010.000-${currentYear}.00000001`)
      expect(prisma.taxInvoice.findFirst).toHaveBeenCalledWith({
        where: {
          taxInvoiceNumber: {
            contains: `-${currentYear}.`
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    })

    it('should generate sequential tax invoice number', async () => {
      const currentYear = new Date().getFullYear().toString().slice(-2)
      
      // Mock existing tax invoice
      vi.mocked(prisma.taxInvoice.findFirst).mockResolvedValue({
        id: 'existing-id',
        taxInvoiceNumber: `010.000-${currentYear}.00000005`,
        invoiceId: 'invoice-id',
        customerId: 'customer-id',
        companyId: 'company-id',
        ppnRate: 0.11,
        ppnAmount: 11000,
        totalWithPPN: 111000,
        issuedAt: new Date(),
        issuedBy: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const number = await (taxInvoiceService as any).generateTaxInvoiceNumber()

      expect(number).toBe(`010.000-${currentYear}.00000006`)
    })
  })

  describe('createTaxInvoice', () => {
    const mockInvoiceData = {
      invoiceId: 'invoice-123',
      customerId: 'customer-123',
      companyId: 'company-123',
      issuedBy: 'Admin User'
    }

    const mockInvoice = {
      id: 'invoice-123',
      invoiceNumber: 'INV-001',
      status: 'PAID' as const,
      subtotal: 100000, // IDR 1,000 in cents
      customer: {
        id: 'customer-123',
        name: 'John Doe',
        email: 'john@example.com'
      },
      items: [
        {
          id: 'item-1',
          quantity: 10,
          unitPrice: 10000,
          totalPrice: 100000,
          product: {
            name: 'Test Product',
            sku: 'TEST-001'
          }
        }
      ]
    }

    const mockCustomer = {
      id: 'customer-123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+6281234567890',
      type: 'B2B' as const
    }

    const mockCompany = {
      id: 'company-123',
      name: 'Test Company',
      taxId: '01.234.567.8-901.000',
      registrationNumber: 'REG-123',
      address: 'Test Address',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '12345'
    }

    beforeEach(() => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice as any)
      vi.mocked(prisma.customer.findUnique).mockResolvedValue(mockCustomer as any)
      vi.mocked(prisma.company.findUnique).mockResolvedValue(mockCompany as any)
      vi.mocked(prisma.taxInvoice.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.taxInvoice.findFirst).mockResolvedValue(null)
    })

    it('should create tax invoice successfully', async () => {
      const mockCreatedTaxInvoice = {
        id: 'tax-invoice-123',
        taxInvoiceNumber: '010.000-24.00000001',
        invoiceId: 'invoice-123',
        customerId: 'customer-123',
        companyId: 'company-123',
        ppnRate: 0.11,
        ppnAmount: 11000, // 11% of 100000
        totalWithPPN: 111000, // 100000 + 11000
        issuedAt: new Date(),
        issuedBy: 'Admin User',
        createdAt: new Date(),
        updatedAt: new Date(),
        invoice: mockInvoice,
        customer: mockCustomer,
        company: mockCompany
      }

      vi.mocked(prisma.taxInvoice.create).mockResolvedValue(mockCreatedTaxInvoice as any)
      vi.mocked(prisma.invoice.update).mockResolvedValue({} as any)

      const result = await taxInvoiceService.createTaxInvoice(mockInvoiceData)

      expect(result).toEqual(mockCreatedTaxInvoice)
      expect(prisma.taxInvoice.create).toHaveBeenCalledWith({
        data: {
          taxInvoiceNumber: expect.stringMatching(/^010\.000-\d{2}\.\d{8}$/),
          invoiceId: 'invoice-123',
          customerId: 'customer-123',
          companyId: 'company-123',
          ppnRate: 0.11,
          ppnAmount: 11000,
          totalWithPPN: 111000,
          issuedAt: expect.any(Date),
          issuedBy: 'Admin User'
        },
        include: {
          invoice: {
            include: {
              customer: true,
              items: {
                include: {
                  product: true
                }
              }
            }
          },
          customer: true,
          company: true
        }
      })
      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: 'invoice-123' },
        data: { taxInvoiceRequested: true }
      })
    })

    it('should throw error if invoice not found', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(null)

      await expect(taxInvoiceService.createTaxInvoice(mockInvoiceData))
        .rejects.toThrow('Faktur tidak ditemukan')
    })

    it('should throw error if invoice not paid', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue({
        ...mockInvoice,
        status: 'PENDING'
      } as any)

      await expect(taxInvoiceService.createTaxInvoice(mockInvoiceData))
        .rejects.toThrow('Faktur pajak hanya dapat dibuat untuk faktur yang sudah dibayar')
    })

    it('should throw error if tax invoice already exists', async () => {
      vi.mocked(prisma.taxInvoice.findUnique).mockResolvedValue({
        id: 'existing-tax-invoice'
      } as any)

      await expect(taxInvoiceService.createTaxInvoice(mockInvoiceData))
        .rejects.toThrow('Faktur pajak sudah dibuat untuk faktur ini')
    })

    it('should throw error if customer not found', async () => {
      vi.mocked(prisma.customer.findUnique).mockResolvedValue(null)

      await expect(taxInvoiceService.createTaxInvoice(mockInvoiceData))
        .rejects.toThrow('Pelanggan tidak ditemukan')
    })

    it('should throw error if company not found', async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue(null)

      await expect(taxInvoiceService.createTaxInvoice(mockInvoiceData))
        .rejects.toThrow('Perusahaan tidak ditemukan')
    })
  })

  describe('validateTaxInformation', () => {
    const mockCustomer = {
      id: 'customer-123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+6281234567890',
      type: 'B2B' as const
    }

    it('should validate correct tax information', () => {
      const mockCompany = {
        id: 'company-123',
        name: 'Test Company',
        taxId: '01.234.567.8-901.000',
        registrationNumber: 'REG-123',
        address: 'Test Address',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345'
      }

      const result = taxInvoiceService.validateTaxInformation(mockCustomer as any, mockCompany as any)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return errors for missing tax ID', () => {
      const mockCompany = {
        id: 'company-123',
        name: 'Test Company',
        taxId: '',
        registrationNumber: 'REG-123',
        address: 'Test Address',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345'
      }

      const result = taxInvoiceService.validateTaxInformation(mockCustomer as any, mockCompany as any)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('NPWP perusahaan diperlukan untuk faktur pajak')
    })

    it('should return errors for invalid NPWP format', () => {
      const mockCompany = {
        id: 'company-123',
        name: 'Test Company',
        taxId: 'invalid-npwp',
        registrationNumber: 'REG-123',
        address: 'Test Address',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345'
      }

      const result = taxInvoiceService.validateTaxInformation(mockCustomer as any, mockCompany as any)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Format NPWP tidak valid (contoh: 01.234.567.8-901.000)')
    })

    it('should return errors for missing registration number', () => {
      const mockCompany = {
        id: 'company-123',
        name: 'Test Company',
        taxId: '01.234.567.8-901.000',
        registrationNumber: '',
        address: 'Test Address',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345'
      }

      const result = taxInvoiceService.validateTaxInformation(mockCustomer as any, mockCompany as any)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Nomor registrasi perusahaan diperlukan')
    })

    it('should return errors for incomplete address', () => {
      const mockCompany = {
        id: 'company-123',
        name: 'Test Company',
        taxId: '01.234.567.8-901.000',
        registrationNumber: 'REG-123',
        address: '',
        city: '',
        province: '',
        postalCode: '12345'
      }

      const result = taxInvoiceService.validateTaxInformation(mockCustomer as any, mockCompany as any)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Alamat lengkap perusahaan diperlukan')
    })
  })

  describe('formatIDR', () => {
    it('should format IDR currency correctly', () => {
      expect(taxInvoiceService.formatIDR(100000)).toMatch(/^Rp\s+1\.000$/)
      expect(taxInvoiceService.formatIDR(1000000)).toMatch(/^Rp\s+10\.000$/)
      expect(taxInvoiceService.formatIDR(50000)).toMatch(/^Rp\s+500$/)
    })
  })

  describe('getTaxInvoices', () => {
    it('should return paginated tax invoices', async () => {
      const mockTaxInvoices = [
        {
          id: 'tax-invoice-1',
          taxInvoiceNumber: '010.000-24.00000001',
          invoice: { customer: { name: 'Customer 1' } },
          customer: { name: 'Customer 1' },
          company: { name: 'Company 1' }
        },
        {
          id: 'tax-invoice-2',
          taxInvoiceNumber: '010.000-24.00000002',
          invoice: { customer: { name: 'Customer 2' } },
          customer: { name: 'Customer 2' },
          company: { name: 'Company 2' }
        }
      ]

      vi.mocked(prisma.taxInvoice.findMany).mockResolvedValue(mockTaxInvoices as any)
      vi.mocked(prisma.taxInvoice.count).mockResolvedValue(2)

      const result = await taxInvoiceService.getTaxInvoices(1, 10)

      expect(result.taxInvoices).toEqual(mockTaxInvoices)
      expect(result.total).toBe(2)
      expect(result.pages).toBe(1)
      expect(result.currentPage).toBe(1)
      expect(prisma.taxInvoice.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: {
          invoice: {
            include: {
              customer: true
            }
          },
          customer: true,
          company: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    })
  })
})