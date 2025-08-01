import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CustomerType, Industry } from '@prisma/client'
import { CustomerManager, CustomerData, CompanyData, TaxInformation, AddressData } from '../customer-manager'
import prisma from '../../prisma'
import bcrypt from 'bcryptjs'

// Mock Prisma
vi.mock('../../prisma', () => ({
  default: {
    customer: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn()
    },
    company: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    address: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn()
    },
    quotation: {
      findMany: vi.fn()
    },
    order: {
      findMany: vi.fn()
    },
    invoice: {
      findMany: vi.fn()
    },
    communication: {
      findMany: vi.fn()
    }
  }
}))

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn()
  }
}))

describe('CustomerManager', () => {
  let customerManager: CustomerManager
  
  beforeEach(() => {
    customerManager = new CustomerManager()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('createCustomer', () => {
    const mockCustomerData: CustomerData = {
      email: 'test@example.com',
      phone: '+6281234567890',
      name: 'Test Customer',
      type: CustomerType.B2C,
      password: 'password123'
    }

    it('should create customer successfully', async () => {
      vi.mocked(prisma.customer.findFirst).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword')

      const mockCreatedCustomer = {
        id: 'customer-1',
        email: 'test@example.com',
        phone: '+6281234567890',
        name: 'Test Customer',
        type: CustomerType.B2C,
        isEmailVerified: false,
        isPhoneVerified: false,
        taxInformation: undefined,
        communicationPreferences: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: null,
        addresses: [],
        _count: {
          quotations: 0,
          orders: 0,
          invoices: 0
        }
      }

      vi.mocked(prisma.customer.create).mockResolvedValue(mockCreatedCustomer)

      const result = await customerManager.createCustomer(mockCustomerData)

      expect(result).toEqual(mockCreatedCustomer)
      expect(prisma.customer.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: 'test@example.com' },
            { phone: '+6281234567890' }
          ]
        }
      })
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
      expect(prisma.customer.create).toHaveBeenCalled()
    })

    it('should throw error if customer already exists', async () => {
      const existingCustomer = {
        id: 'existing-customer',
        email: 'test@example.com'
      }

      vi.mocked(prisma.customer.findFirst).mockResolvedValue(existingCustomer)

      await expect(customerManager.createCustomer(mockCustomerData)).rejects.toThrow(
        'Customer with this email or phone already exists'
      )
    })

    it('should validate company for B2B customer', async () => {
      const b2bCustomerData: CustomerData = {
        ...mockCustomerData,
        type: CustomerType.B2B,
        companyId: 'company-1'
      }

      vi.mocked(prisma.customer.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.company.findUnique).mockResolvedValue(null)

      await expect(customerManager.createCustomer(b2bCustomerData)).rejects.toThrow('Company not found')
    })

    it('should create B2B customer with valid company', async () => {
      const b2bCustomerData: CustomerData = {
        ...mockCustomerData,
        type: CustomerType.B2B,
        companyId: 'company-1'
      }

      const mockCompany = {
        id: 'company-1',
        name: 'Test Company'
      }

      vi.mocked(prisma.customer.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.company.findUnique).mockResolvedValue(mockCompany)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword')

      const mockCreatedCustomer = {
        id: 'customer-1',
        email: 'test@example.com',
        phone: '+6281234567890',
        name: 'Test Customer',
        type: CustomerType.B2B,
        isEmailVerified: false,
        isPhoneVerified: false,
        taxInformation: undefined,
        communicationPreferences: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: {
          id: 'company-1',
          name: 'Test Company',
          registrationNumber: '123456789',
          taxId: '01.234.567.8-901.234',
          industry: Industry.MEDICAL,
          contactPerson: 'John Doe',
          address: 'Test Address',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345'
        },
        addresses: [],
        _count: {
          quotations: 0,
          orders: 0,
          invoices: 0
        }
      }

      vi.mocked(prisma.customer.create).mockResolvedValue(mockCreatedCustomer)

      const result = await customerManager.createCustomer(b2bCustomerData)

      expect(result).toEqual(mockCreatedCustomer)
      expect(prisma.company.findUnique).toHaveBeenCalledWith({
        where: { id: 'company-1' }
      })
    })
  })

  describe('updateCustomerProfile', () => {
    it('should update customer profile successfully', async () => {
      const existingCustomer = {
        id: 'customer-1',
        email: 'old@example.com'
      }

      vi.mocked(prisma.customer.findUnique).mockResolvedValue(existingCustomer)
      vi.mocked(prisma.customer.findFirst).mockResolvedValue(null) // No conflicts
      vi.mocked(prisma.customer.update).mockResolvedValue({} as any)

      const updateData = {
        email: 'new@example.com',
        name: 'Updated Name'
      }

      await customerManager.updateCustomerProfile('customer-1', updateData)

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 'customer-1' },
        data: {
          email: 'new@example.com',
          name: 'Updated Name'
        }
      })
    })

    it('should throw error if customer not found', async () => {
      vi.mocked(prisma.customer.findUnique).mockResolvedValue(null)

      await expect(
        customerManager.updateCustomerProfile('customer-1', { name: 'New Name' })
      ).rejects.toThrow('Customer not found')
    })

    it('should throw error if email/phone conflict exists', async () => {
      const existingCustomer = {
        id: 'customer-1',
        email: 'old@example.com'
      }

      const conflictingCustomer = {
        id: 'customer-2',
        email: 'new@example.com'
      }

      vi.mocked(prisma.customer.findUnique).mockResolvedValue(existingCustomer)
      vi.mocked(prisma.customer.findFirst).mockResolvedValue(conflictingCustomer)

      await expect(
        customerManager.updateCustomerProfile('customer-1', { email: 'new@example.com' })
      ).rejects.toThrow('Another customer with this email or phone already exists')
    })
  })

  describe('getCustomerHistory', () => {
    it('should return customer history successfully', async () => {
      const mockCustomer = { id: 'customer-1' }
      const mockQuotations = [
        {
          id: 'quotation-1',
          quotationNumber: 'QUO/2024/01/0001',
          status: 'PENDING',
          totalAmount: 1000000,
          createdAt: new Date()
        }
      ]
      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD/2024/01/0001',
          status: 'NEW',
          totalAmount: 1000000,
          createdAt: new Date()
        }
      ]
      const mockInvoices = [
        {
          id: 'invoice-1',
          invoiceNumber: 'INV/2024/01/0001',
          status: 'PENDING',
          totalAmount: 1000000,
          dueDate: new Date(),
          paidAt: null
        }
      ]
      const mockCommunications = [
        {
          id: 'comm-1',
          type: 'WHATSAPP',
          direction: 'OUTBOUND',
          content: 'Hello',
          status: 'SENT',
          createdAt: new Date()
        }
      ]

      vi.mocked(prisma.customer.findUnique).mockResolvedValue(mockCustomer)
      vi.mocked(prisma.quotation.findMany).mockResolvedValue(mockQuotations)
      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders)
      vi.mocked(prisma.invoice.findMany).mockResolvedValue(mockInvoices)
      vi.mocked(prisma.communication.findMany).mockResolvedValue(mockCommunications)

      const result = await customerManager.getCustomerHistory('customer-1')

      expect(result).toEqual({
        quotations: mockQuotations.map(q => ({ ...q, status: q.status as string })),
        orders: mockOrders.map(o => ({ ...o, status: o.status as string })),
        invoices: mockInvoices.map(i => ({ ...i, status: i.status as string })),
        communications: mockCommunications.map(c => ({
          ...c,
          type: c.type as string,
          direction: c.direction as string,
          status: c.status as string
        }))
      })
    })

    it('should throw error if customer not found', async () => {
      vi.mocked(prisma.customer.findUnique).mockResolvedValue(null)

      await expect(customerManager.getCustomerHistory('customer-1')).rejects.toThrow('Customer not found')
    })
  })

  describe('createCompany', () => {
    const mockCompanyData: CompanyData = {
      name: 'Test Company',
      registrationNumber: '123456789',
      taxId: '01.234.567.8-901.234',
      industry: Industry.MEDICAL,
      contactPerson: 'John Doe',
      address: 'Test Address',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '12345'
    }

    it('should create company successfully', async () => {
      vi.mocked(prisma.company.findFirst).mockResolvedValue(null)

      const mockCreatedCompany = {
        id: 'company-1',
        ...mockCompanyData,
        country: 'Indonesia'
      }

      vi.mocked(prisma.company.create).mockResolvedValue(mockCreatedCompany)

      const result = await customerManager.createCompany(mockCompanyData)

      expect(result).toBe('company-1')
      expect(prisma.company.create).toHaveBeenCalledWith({
        data: {
          ...mockCompanyData,
          country: 'Indonesia'
        }
      })
    })

    it('should throw error if company already exists', async () => {
      const existingCompany = {
        id: 'existing-company',
        registrationNumber: '123456789'
      }

      vi.mocked(prisma.company.findFirst).mockResolvedValue(existingCompany)

      await expect(customerManager.createCompany(mockCompanyData)).rejects.toThrow(
        'Company with this registration number or tax ID already exists'
      )
    })
  })

  describe('validateTaxInformation', () => {
    it('should validate correct NPWP format', async () => {
      const validTaxInfo: TaxInformation = {
        npwp: '01.234.567.8-901.234',
        taxName: 'PT Test Company',
        taxAddress: 'Test Address'
      }

      const result = await customerManager.validateTaxInformation(validTaxInfo)

      expect(result).toBe(true)
    })

    it('should throw error for invalid NPWP format', async () => {
      const invalidTaxInfo: TaxInformation = {
        npwp: '123456789', // Invalid format
        taxName: 'PT Test Company'
      }

      await expect(customerManager.validateTaxInformation(invalidTaxInfo)).rejects.toThrow(
        'Invalid NPWP format. Expected format: XX.XXX.XXX.X-XXX.XXX'
      )
    })

    it('should validate tax info without NPWP', async () => {
      const taxInfoWithoutNPWP: TaxInformation = {
        taxName: 'Individual Taxpayer',
        taxAddress: 'Test Address'
      }

      const result = await customerManager.validateTaxInformation(taxInfoWithoutNPWP)

      expect(result).toBe(true)
    })
  })

  describe('addCustomerAddress', () => {
    const mockAddressData: AddressData = {
      label: 'Home',
      address: 'Test Address',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '12345',
      isDefault: true
    }

    it('should add customer address successfully', async () => {
      const mockCustomer = { id: 'customer-1' }
      const mockCreatedAddress = {
        id: 'address-1',
        customerId: 'customer-1',
        ...mockAddressData,
        country: 'Indonesia'
      }

      vi.mocked(prisma.customer.findUnique).mockResolvedValue(mockCustomer)
      vi.mocked(prisma.address.updateMany).mockResolvedValue({ count: 0 })
      vi.mocked(prisma.address.create).mockResolvedValue(mockCreatedAddress)

      const result = await customerManager.addCustomerAddress('customer-1', mockAddressData)

      expect(result).toBe('address-1')
      expect(prisma.address.updateMany).toHaveBeenCalledWith({
        where: { customerId: 'customer-1' },
        data: { isDefault: false }
      })
      expect(prisma.address.create).toHaveBeenCalled()
    })

    it('should throw error if customer not found', async () => {
      vi.mocked(prisma.customer.findUnique).mockResolvedValue(null)

      await expect(
        customerManager.addCustomerAddress('customer-1', mockAddressData)
      ).rejects.toThrow('Customer not found')
    })
  })

  describe('linkCompanyProfile', () => {
    it('should link customer to company successfully', async () => {
      const mockCustomer = { id: 'customer-1' }
      const mockCompany = { id: 'company-1' }

      vi.mocked(prisma.customer.findUnique).mockResolvedValue(mockCustomer)
      vi.mocked(prisma.company.findUnique).mockResolvedValue(mockCompany)
      vi.mocked(prisma.customer.update).mockResolvedValue({} as any)

      await customerManager.linkCompanyProfile('customer-1', 'company-1')

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 'customer-1' },
        data: {
          companyId: 'company-1',
          type: CustomerType.B2B
        }
      })
    })

    it('should throw error if customer not found', async () => {
      vi.mocked(prisma.customer.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.company.findUnique).mockResolvedValue({ id: 'company-1' })

      await expect(
        customerManager.linkCompanyProfile('customer-1', 'company-1')
      ).rejects.toThrow('Customer not found')
    })

    it('should throw error if company not found', async () => {
      vi.mocked(prisma.customer.findUnique).mockResolvedValue({ id: 'customer-1' })
      vi.mocked(prisma.company.findUnique).mockResolvedValue(null)

      await expect(
        customerManager.linkCompanyProfile('customer-1', 'company-1')
      ).rejects.toThrow('Company not found')
    })
  })
})