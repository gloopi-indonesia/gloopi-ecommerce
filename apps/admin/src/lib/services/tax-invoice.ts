import prisma from '@/lib/prisma'
import { TaxInvoice, Invoice, Customer, Company } from '@prisma/client'

export interface TaxInvoiceData {
  invoiceId: string
  customerId: string
  companyId: string
  issuedBy: string
}

export interface TaxInvoiceWithRelations extends TaxInvoice {
  invoice: Invoice & {
    customer: Customer
    items: Array<{
      id: string
      quantity: number
      unitPrice: number
      totalPrice: number
      product: {
        name: string
        sku: string
      }
    }>
  }
  customer: Customer
  company: Company
}

export class TaxInvoiceService {
  /**
   * Generate Indonesian PPN tax invoice number
   * Format: 010.000-XX.XXXXXXXX (where XX is year and XXXXXXXX is sequential number)
   */
  private async generateTaxInvoiceNumber(): Promise<string> {
    const currentYear = new Date().getFullYear().toString().slice(-2)
    
    // Get the last tax invoice number for this year
    const lastTaxInvoice = await prisma.taxInvoice.findFirst({
      where: {
        taxInvoiceNumber: {
          contains: `-${currentYear}.`
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    let sequentialNumber = 1
    if (lastTaxInvoice) {
      // Extract sequential number from last invoice
      const match = lastTaxInvoice.taxInvoiceNumber.match(/-\d{2}\.(\d{8})$/)
      if (match) {
        sequentialNumber = parseInt(match[1]) + 1
      }
    }

    // Format: 010.000-YY.XXXXXXXX
    const formattedSequential = sequentialNumber.toString().padStart(8, '0')
    return `010.000-${currentYear}.${formattedSequential}`
  }

  /**
   * Create a new PPN tax invoice
   */
  async createTaxInvoice(data: TaxInvoiceData): Promise<TaxInvoiceWithRelations> {
    // Validate that the invoice exists and is paid
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!invoice) {
      throw new Error('Faktur tidak ditemukan')
    }

    if (invoice.status !== 'PAID') {
      throw new Error('Faktur pajak hanya dapat dibuat untuk faktur yang sudah dibayar')
    }

    // Check if tax invoice already exists
    const existingTaxInvoice = await prisma.taxInvoice.findUnique({
      where: { invoiceId: data.invoiceId }
    })

    if (existingTaxInvoice) {
      throw new Error('Faktur pajak sudah dibuat untuk faktur ini')
    }

    // Validate customer and company
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId }
    })

    if (!customer) {
      throw new Error('Pelanggan tidak ditemukan')
    }

    const company = await prisma.company.findUnique({
      where: { id: data.companyId }
    })

    if (!company) {
      throw new Error('Perusahaan tidak ditemukan')
    }

    // Generate tax invoice number
    const taxInvoiceNumber = await this.generateTaxInvoiceNumber()

    // Calculate PPN (11% in Indonesia)
    const ppnRate = 0.11
    const ppnAmount = Math.round(invoice.subtotal * ppnRate)
    const totalWithPPN = invoice.subtotal + ppnAmount

    // Create tax invoice
    const taxInvoice = await prisma.taxInvoice.create({
      data: {
        taxInvoiceNumber,
        invoiceId: data.invoiceId,
        customerId: data.customerId,
        companyId: data.companyId,
        ppnRate,
        ppnAmount,
        totalWithPPN,
        issuedAt: new Date(),
        issuedBy: data.issuedBy
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

    // Update invoice to mark tax invoice as requested
    await prisma.invoice.update({
      where: { id: data.invoiceId },
      data: { taxInvoiceRequested: true }
    })

    return taxInvoice
  }

  /**
   * Get tax invoice by ID
   */
  async getTaxInvoiceById(id: string): Promise<TaxInvoiceWithRelations | null> {
    return await prisma.taxInvoice.findUnique({
      where: { id },
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
  }

  /**
   * Get tax invoice by invoice ID
   */
  async getTaxInvoiceByInvoiceId(invoiceId: string): Promise<TaxInvoiceWithRelations | null> {
    return await prisma.taxInvoice.findUnique({
      where: { invoiceId },
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
  }

  /**
   * Get all tax invoices with pagination
   */
  async getTaxInvoices(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [taxInvoices, total] = await Promise.all([
      prisma.taxInvoice.findMany({
        skip,
        take: limit,
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
      }),
      prisma.taxInvoice.count()
    ])

    return {
      taxInvoices,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  }

  /**
   * Get tax invoices by customer ID
   */
  async getTaxInvoicesByCustomerId(customerId: string): Promise<TaxInvoiceWithRelations[]> {
    return await prisma.taxInvoice.findMany({
      where: { customerId },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  /**
   * Validate tax information for PPN invoice generation
   */
  validateTaxInformation(customer: Customer, company: Company): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate company tax ID (NPWP)
    if (!company.taxId) {
      errors.push('NPWP perusahaan diperlukan untuk faktur pajak')
    } else if (!/^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/.test(company.taxId)) {
      errors.push('Format NPWP tidak valid (contoh: 01.234.567.8-901.000)')
    }

    // Validate company registration number
    if (!company.registrationNumber) {
      errors.push('Nomor registrasi perusahaan diperlukan')
    }

    // Validate company address
    if (!company.address || !company.city || !company.province) {
      errors.push('Alamat lengkap perusahaan diperlukan')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Format IDR currency for Indonesian display
   */
  formatIDR(amount: number): string {
    // Convert from cents to rupiah
    const rupiah = amount / 100
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(rupiah)
  }
}

export const taxInvoiceService = new TaxInvoiceService()