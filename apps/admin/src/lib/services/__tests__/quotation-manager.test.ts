import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { QuotationStatus, CustomerType } from '@prisma/client'
import { QuotationManager, PORequest } from '../quotation-manager'
import prisma from '../../prisma'

// Mock Prisma
vi.mock('../../prisma', () => ({
  default: {
    quotation: {
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn()
    },
    quotationStatusLog: {
      create: vi.fn()
    },
    customer: {
      findUnique: vi.fn()
    },
    address: {
      findFirst: vi.fn()
    },
    product: {
      findUnique: vi.fn()
    },
    followUp: {
      create: vi.fn()
    },
    $transaction: vi.fn()
  }
}))

describe('QuotationManager', () => {
  let quotationManager: QuotationManager
  
  beforeEach(() => {
    quotationManager = new QuotationManager()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('createQuotation', () => {
    const mockCustomer = {
      id: 'customer-1',
      email: 'test@example.com',
      name: 'Test Customer',
      phone: '+6281234567890',
      type: CustomerType.B2C
    }

    const mockProduct = {
      id: 'product-1',
      name: 'Medical Gloves',
      sku: 'MED-001',
      basePrice: 50000, // 500 IDR in cents
      pricingTiers: []
    }

    const mockPORequest: PORequest = {
      customerId: 'customer-1',
      items: [
        {
          productId: 'product-1',
          quantity: 100
        }
      ],
      notes: 'Urgent order'
    }

    it('should create quotation successfully', async () => {
      // Mock customer lookup
      vi.mocked(prisma.customer.findUnique).mockResolvedValue(mockCustomer)
      
      // Mock product lookup
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct)
      
      // Mock quotation count for number generation
      vi.mocked(prisma.quotation.count).mockResolvedValue(0)

      // Mock transaction
      const mockQuotation = {
        id: 'quotation-1',
        quotationNumber: 'QUO/2024/01/0001',
        customerId: 'customer-1',
        status: QuotationStatus.PENDING,
        subtotal: 5000000, // 100 * 50000
        taxAmount: 0,
        totalAmount: 5000000,
        validUntil: new Date(),
        notes: 'Urgent order',
        shippingAddressId: null,
        convertedOrderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: {
          id: 'customer-1',
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '+6281234567890',
          type: 'B2C'
        },
        items: [
          {
            id: 'item-1',
            productId: 'product-1',
            quantity: 100,
            unitPrice: 50000,
            totalPrice: 5000000,
            notes: null,
            product: {
              id: 'product-1',
              name: 'Medical Gloves',
              sku: 'MED-001',
              images: []
            }
          }
        ],
        shippingAddress: null
      }

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback({
          quotation: {
            create: vi.fn().mockResolvedValue(mockQuotation)
          }
        } as any)
      })

      const result = await quotationManager.createQuotation(mockPORequest)

      expect(result).toEqual(mockQuotation)
      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'customer-1' }
      })
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        include: {
          pricingTiers: {
            where: {
              isActive: true,
              minQuantity: { lte: 100 },
              OR: [
                { maxQuantity: null },
                { maxQuantity: { gte: 100 } }
              ]
            },
            orderBy: { minQuantity: 'desc' },
            take: 1
          }
        }
      })
    })

    it('should throw error if customer not found', async () => {
      vi.mocked(prisma.customer.findUnique).mockResolvedValue(null)

      await expect(quotationManager.createQuotation(mockPORequest)).rejects.toThrow('Customer not found')
    })

    it('should throw error if product not found', async () => {
      vi.mocked(prisma.customer.findUnique).mockResolvedValue(mockCustomer)
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null)

      await expect(quotationManager.createQuotation(mockPORequest)).rejects.toThrow('Product with ID product-1 not found')
    })

    it('should use pricing tier when available', async () => {
      const mockProductWithTier = {
        ...mockProduct,
        pricingTiers: [
          {
            id: 'tier-1',
            minQuantity: 50,
            maxQuantity: 200,
            pricePerUnit: 45000, // Discounted price
            isActive: true
          }
        ]
      }

      vi.mocked(prisma.customer.findUnique).mockResolvedValue(mockCustomer)
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProductWithTier)
      vi.mocked(prisma.quotation.count).mockResolvedValue(0)

      const mockQuotationWithTier = {
        id: 'quotation-1',
        quotationNumber: 'QUO/2024/01/0001',
        customerId: 'customer-1',
        status: QuotationStatus.PENDING,
        subtotal: 4500000, // 100 * 45000 (tier price)
        taxAmount: 0,
        totalAmount: 4500000,
        validUntil: new Date(),
        notes: 'Urgent order',
        shippingAddressId: null,
        convertedOrderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: {
          id: 'customer-1',
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '+6281234567890',
          type: 'B2C'
        },
        items: [
          {
            id: 'item-1',
            productId: 'product-1',
            quantity: 100,
            unitPrice: 45000, // Tier price
            totalPrice: 4500000,
            notes: null,
            product: {
              id: 'product-1',
              name: 'Medical Gloves',
              sku: 'MED-001',
              images: []
            }
          }
        ],
        shippingAddress: null
      }

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback({
          quotation: {
            create: vi.fn().mockResolvedValue(mockQuotationWithTier)
          }
        } as any)
      })

      const result = await quotationManager.createQuotation(mockPORequest)

      expect(result.subtotal).toBe(4500000)
      expect(result.items[0].unitPrice).toBe(45000)
    })
  })

  describe('updateQuotationStatus', () => {
    const mockQuotation = {
      id: 'quotation-1',
      status: QuotationStatus.PENDING
    }

    it('should update quotation status successfully', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(mockQuotation)
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback({
          quotation: {
            update: vi.fn()
          },
          quotationStatusLog: {
            create: vi.fn()
          }
        } as any)
      })

      await quotationManager.updateQuotationStatus(
        'quotation-1',
        QuotationStatus.APPROVED,
        'admin-1',
        'Approved by admin'
      )

      expect(prisma.$transaction).toHaveBeenCalled()
    })

    it('should throw error for invalid status transition', async () => {
      const rejectedQuotation = {
        id: 'quotation-1',
        status: QuotationStatus.REJECTED
      }

      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(rejectedQuotation)

      await expect(
        quotationManager.updateQuotationStatus(
          'quotation-1',
          QuotationStatus.APPROVED,
          'admin-1'
        )
      ).rejects.toThrow('Invalid status transition from REJECTED to APPROVED')
    })

    it('should throw error if quotation not found', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(null)

      await expect(
        quotationManager.updateQuotationStatus(
          'quotation-1',
          QuotationStatus.APPROVED,
          'admin-1'
        )
      ).rejects.toThrow('Quotation not found')
    })
  })

  describe('convertToOrder', () => {
    it('should convert approved quotation to order', async () => {
      const approvedQuotation = {
        id: 'quotation-1',
        status: QuotationStatus.APPROVED,
        convertedOrderId: null,
        items: [],
        customer: { id: 'customer-1' },
        shippingAddress: { id: 'address-1' }
      }

      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(approvedQuotation)
      
      // Mock the dynamic import of OrderProcessor
      vi.doMock('../order-processor', () => ({
        orderProcessor: {
          createOrderFromQuotation: vi.fn().mockResolvedValue({ id: 'order-1' })
        }
      }))

      const result = await quotationManager.convertToOrder('quotation-1', 'admin-1')

      expect(result).toBe('order-1')
    })

    it('should throw error if quotation is not approved', async () => {
      const pendingQuotation = {
        id: 'quotation-1',
        status: QuotationStatus.PENDING,
        convertedOrderId: null,
        items: [],
        customer: { id: 'customer-1' }
      }

      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(pendingQuotation)

      await expect(
        quotationManager.convertToOrder('quotation-1', 'admin-1')
      ).rejects.toThrow('Only approved quotations can be converted to orders')
    })

    it('should throw error if quotation already converted', async () => {
      const convertedQuotation = {
        id: 'quotation-1',
        status: QuotationStatus.APPROVED,
        convertedOrderId: 'order-1',
        items: [],
        customer: { id: 'customer-1' }
      }

      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(convertedQuotation)

      await expect(
        quotationManager.convertToOrder('quotation-1', 'admin-1')
      ).rejects.toThrow('Quotation has already been converted to an order')
    })
  })

  describe('getQuotationsByStatus', () => {
    it('should return quotations by status', async () => {
      const mockQuotations = [
        {
          id: 'quotation-1',
          quotationNumber: 'QUO/2024/01/0001',
          status: QuotationStatus.PENDING,
          customer: {
            id: 'customer-1',
            name: 'Test Customer',
            email: 'test@example.com',
            phone: '+6281234567890',
            type: 'B2C'
          },
          items: [],
          shippingAddress: null
        }
      ]

      vi.mocked(prisma.quotation.findMany).mockResolvedValue(mockQuotations)

      const result = await quotationManager.getQuotationsByStatus(QuotationStatus.PENDING)

      expect(result).toEqual(mockQuotations)
      expect(prisma.quotation.findMany).toHaveBeenCalledWith({
        where: { status: QuotationStatus.PENDING },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              type: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  images: true
                }
              }
            }
          },
          shippingAddress: {
            select: {
              id: true,
              address: true,
              city: true,
              province: true,
              postalCode: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    })
  })

  describe('markExpiredQuotations', () => {
    it('should mark expired quotations', async () => {
      vi.mocked(prisma.quotation.updateMany).mockResolvedValue({ count: 5 })

      const result = await quotationManager.markExpiredQuotations()

      expect(result).toBe(5)
      expect(prisma.quotation.updateMany).toHaveBeenCalledWith({
        where: {
          validUntil: { lt: expect.any(Date) },
          status: { in: [QuotationStatus.PENDING, QuotationStatus.APPROVED] }
        },
        data: {
          status: QuotationStatus.EXPIRED
        }
      })
    })
  })

  describe('scheduleFollowUp', () => {
    it('should schedule follow-up for quotation', async () => {
      const mockQuotation = {
        id: 'quotation-1',
        customerId: 'customer-1'
      }

      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(mockQuotation)
      vi.mocked(prisma.followUp.create).mockResolvedValue({} as any)

      const scheduledAt = new Date()
      await quotationManager.scheduleFollowUp('quotation-1', scheduledAt, 'admin-1', 'Follow up needed')

      expect(prisma.followUp.create).toHaveBeenCalledWith({
        data: {
          customerId: 'customer-1',
          quotationId: 'quotation-1',
          type: 'QUOTATION_FOLLOW_UP',
          scheduledAt,
          notes: 'Follow up needed',
          adminUserId: 'admin-1'
        }
      })
    })

    it('should throw error if quotation not found', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(null)

      await expect(
        quotationManager.scheduleFollowUp('quotation-1', new Date(), 'admin-1')
      ).rejects.toThrow('Quotation not found')
    })
  })
})