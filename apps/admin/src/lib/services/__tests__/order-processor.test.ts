import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { OrderStatus, InvoiceStatus, CustomerType } from '@prisma/client'
import { OrderProcessor, PaymentInfo } from '../order-processor'
import prisma from '../../prisma'

// Mock Prisma
vi.mock('../../prisma', () => ({
  default: {
    order: {
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn()
    },
    invoice: {
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn()
    },
    quotation: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    quotationStatusLog: {
      create: vi.fn()
    },
    orderStatusLog: {
      create: vi.fn()
    },
    $transaction: vi.fn()
  }
}))

describe('OrderProcessor', () => {
  let orderProcessor: OrderProcessor
  
  beforeEach(() => {
    orderProcessor = new OrderProcessor()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('createOrderFromQuotation', () => {
    const mockQuotation = {
      id: 'quotation-1',
      quotationNumber: 'QUO/2024/01/0001',
      customerId: 'customer-1',
      status: 'APPROVED',
      subtotal: 5000000,
      taxAmount: 0,
      totalAmount: 5000000,
      shippingAddressId: 'address-1',
      convertedOrderId: null,
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          quantity: 100,
          unitPrice: 50000,
          totalPrice: 5000000,
          product: {
            id: 'product-1',
            name: 'Medical Gloves',
            sku: 'MED-001'
          }
        }
      ],
      customer: {
        id: 'customer-1',
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+6281234567890',
        type: CustomerType.B2C
      },
      shippingAddress: {
        id: 'address-1',
        address: 'Test Address',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345'
      }
    }

    it('should create order from approved quotation successfully', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(mockQuotation)
      vi.mocked(prisma.order.count).mockResolvedValue(0)

      const mockOrder = {
        id: 'order-1',
        orderNumber: 'ORD/2024/01/0001',
        quotationId: 'quotation-1',
        customerId: 'customer-1',
        status: OrderStatus.NEW,
        subtotal: 5000000,
        taxAmount: 0,
        totalAmount: 5000000,
        shippingAddressId: 'address-1',
        trackingNumber: null,
        shippedAt: null,
        deliveredAt: null,
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
            id: 'order-item-1',
            productId: 'product-1',
            quantity: 100,
            unitPrice: 50000,
            totalPrice: 5000000,
            product: {
              id: 'product-1',
              name: 'Medical Gloves',
              sku: 'MED-001',
              images: []
            }
          }
        ],
        shippingAddress: {
          id: 'address-1',
          address: 'Test Address',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345'
        }
      }

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback({
          order: {
            create: vi.fn().mockResolvedValue(mockOrder)
          },
          quotation: {
            update: vi.fn()
          },
          quotationStatusLog: {
            create: vi.fn()
          },
          orderStatusLog: {
            create: vi.fn()
          }
        } as any)
      })

      const result = await orderProcessor.createOrderFromQuotation('quotation-1', 'admin-1')

      expect(result).toEqual(mockOrder)
      expect(prisma.quotation.findUnique).toHaveBeenCalledWith({
        where: { id: 'quotation-1' },
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true,
          shippingAddress: true
        }
      })
    })

    it('should throw error if quotation not found', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(null)

      await expect(
        orderProcessor.createOrderFromQuotation('quotation-1', 'admin-1')
      ).rejects.toThrow('Quotation not found')
    })

    it('should throw error if quotation is not approved', async () => {
      const pendingQuotation = { ...mockQuotation, status: 'PENDING' }
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(pendingQuotation)

      await expect(
        orderProcessor.createOrderFromQuotation('quotation-1', 'admin-1')
      ).rejects.toThrow('Only approved quotations can be converted to orders')
    })

    it('should throw error if quotation already converted', async () => {
      const convertedQuotation = { ...mockQuotation, convertedOrderId: 'order-1' }
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(convertedQuotation)

      await expect(
        orderProcessor.createOrderFromQuotation('quotation-1', 'admin-1')
      ).rejects.toThrow('Quotation has already been converted to an order')
    })

    it('should throw error if no shipping address', async () => {
      const quotationWithoutAddress = { ...mockQuotation, shippingAddress: null }
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(quotationWithoutAddress)

      await expect(
        orderProcessor.createOrderFromQuotation('quotation-1', 'admin-1')
      ).rejects.toThrow('Shipping address is required to create an order')
    })
  })

  describe('updateOrderStatus', () => {
    const mockOrder = {
      id: 'order-1',
      status: OrderStatus.NEW
    }

    it('should update order status successfully', async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder)
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback({
          order: {
            update: vi.fn()
          },
          orderStatusLog: {
            create: vi.fn()
          }
        } as any)
      })

      await orderProcessor.updateOrderStatus(
        'order-1',
        OrderStatus.PROCESSING,
        'admin-1',
        'Order is being processed'
      )

      expect(prisma.$transaction).toHaveBeenCalled()
    })

    it('should throw error for invalid status transition', async () => {
      const deliveredOrder = { id: 'order-1', status: OrderStatus.DELIVERED }
      vi.mocked(prisma.order.findUnique).mockResolvedValue(deliveredOrder)

      await expect(
        orderProcessor.updateOrderStatus('order-1', OrderStatus.PROCESSING, 'admin-1')
      ).rejects.toThrow('Invalid status transition from DELIVERED to PROCESSING')
    })

    it('should throw error if order not found', async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null)

      await expect(
        orderProcessor.updateOrderStatus('order-1', OrderStatus.PROCESSING, 'admin-1')
      ).rejects.toThrow('Order not found')
    })
  })

  describe('generateInvoice', () => {
    const mockOrder = {
      id: 'order-1',
      orderNumber: 'ORD/2024/01/0001',
      customerId: 'customer-1',
      subtotal: 5000000,
      taxAmount: 0,
      totalAmount: 5000000,
      invoice: null,
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          quantity: 100,
          unitPrice: 50000,
          totalPrice: 5000000,
          product: {
            id: 'product-1',
            name: 'Medical Gloves',
            sku: 'MED-001'
          }
        }
      ],
      customer: {
        id: 'customer-1',
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+6281234567890',
        type: 'B2C'
      }
    }

    it('should generate invoice successfully', async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder)
      vi.mocked(prisma.invoice.count).mockResolvedValue(0)

      const mockInvoice = {
        id: 'invoice-1',
        invoiceNumber: 'INV/2024/01/0001',
        orderId: 'order-1',
        customerId: 'customer-1',
        subtotal: 5000000,
        taxAmount: 0,
        totalAmount: 5000000,
        status: InvoiceStatus.PENDING,
        dueDate: new Date(),
        paidAt: null,
        paymentMethod: null,
        paymentNotes: null,
        taxInvoiceRequested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: {
          id: 'customer-1',
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '+6281234567890',
          type: 'B2C'
        },
        order: {
          id: 'order-1',
          orderNumber: 'ORD/2024/01/0001',
          status: OrderStatus.NEW
        },
        items: [
          {
            id: 'invoice-item-1',
            productId: 'product-1',
            quantity: 100,
            unitPrice: 50000,
            totalPrice: 5000000,
            product: {
              id: 'product-1',
              name: 'Medical Gloves',
              sku: 'MED-001'
            }
          }
        ]
      }

      vi.mocked(prisma.invoice.create).mockResolvedValue(mockInvoice)

      const result = await orderProcessor.generateInvoice('order-1')

      expect(result).toEqual(mockInvoice)
      expect(prisma.invoice.create).toHaveBeenCalled()
    })

    it('should throw error if order not found', async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null)

      await expect(orderProcessor.generateInvoice('order-1')).rejects.toThrow('Order not found')
    })

    it('should throw error if invoice already exists', async () => {
      const orderWithInvoice = {
        ...mockOrder,
        invoice: { id: 'invoice-1', invoiceNumber: 'INV/2024/01/0001' }
      }
      vi.mocked(prisma.order.findUnique).mockResolvedValue(orderWithInvoice)

      await expect(orderProcessor.generateInvoice('order-1')).rejects.toThrow('Invoice already exists for this order')
    })
  })

  describe('addTrackingNumber', () => {
    it('should add tracking number and update status to SHIPPED', async () => {
      const processingOrder = {
        id: 'order-1',
        status: OrderStatus.PROCESSING
      }

      vi.mocked(prisma.order.findUnique).mockResolvedValue(processingOrder)
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback({
          order: {
            update: vi.fn()
          },
          orderStatusLog: {
            create: vi.fn()
          }
        } as any)
      })

      await orderProcessor.addTrackingNumber('order-1', 'TRACK123', 'admin-1')

      expect(prisma.$transaction).toHaveBeenCalled()
    })

    it('should throw error if order not found', async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null)

      await expect(
        orderProcessor.addTrackingNumber('order-1', 'TRACK123', 'admin-1')
      ).rejects.toThrow('Order not found')
    })
  })

  describe('processPayment', () => {
    const mockInvoice = {
      id: 'invoice-1',
      status: InvoiceStatus.PENDING
    }

    const paymentInfo: PaymentInfo = {
      paymentMethod: 'Bank Transfer',
      paymentNotes: 'Payment received',
      paidAt: new Date()
    }

    it('should process payment successfully', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice)
      vi.mocked(prisma.invoice.update).mockResolvedValue({} as any)

      await orderProcessor.processPayment('invoice-1', paymentInfo)

      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: 'invoice-1' },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: paymentInfo.paidAt,
          paymentMethod: paymentInfo.paymentMethod,
          paymentNotes: paymentInfo.paymentNotes
        }
      })
    })

    it('should throw error if invoice not found', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(null)

      await expect(
        orderProcessor.processPayment('invoice-1', paymentInfo)
      ).rejects.toThrow('Invoice not found')
    })

    it('should throw error if invoice already paid', async () => {
      const paidInvoice = { ...mockInvoice, status: InvoiceStatus.PAID }
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(paidInvoice)

      await expect(
        orderProcessor.processPayment('invoice-1', paymentInfo)
      ).rejects.toThrow('Invoice is already paid')
    })

    it('should throw error if invoice is cancelled', async () => {
      const cancelledInvoice = { ...mockInvoice, status: InvoiceStatus.CANCELLED }
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(cancelledInvoice)

      await expect(
        orderProcessor.processPayment('invoice-1', paymentInfo)
      ).rejects.toThrow('Cannot process payment for cancelled invoice')
    })
  })

  describe('getOrdersByStatus', () => {
    it('should return orders by status', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD/2024/01/0001',
          status: OrderStatus.NEW,
          customer: {
            id: 'customer-1',
            name: 'Test Customer',
            email: 'test@example.com',
            phone: '+6281234567890',
            type: 'B2C'
          },
          items: [],
          shippingAddress: {
            id: 'address-1',
            address: 'Test Address',
            city: 'Jakarta',
            province: 'DKI Jakarta',
            postalCode: '12345'
          },
          invoice: null
        }
      ]

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders)

      const result = await orderProcessor.getOrdersByStatus(OrderStatus.NEW)

      expect(result).toEqual(mockOrders)
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { status: OrderStatus.NEW },
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
          },
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
              dueDate: true,
              paidAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    })
  })

  describe('markOverdueInvoices', () => {
    it('should mark overdue invoices', async () => {
      vi.mocked(prisma.invoice.updateMany).mockResolvedValue({ count: 3 })

      const result = await orderProcessor.markOverdueInvoices()

      expect(result).toBe(3)
      expect(prisma.invoice.updateMany).toHaveBeenCalledWith({
        where: {
          dueDate: { lt: expect.any(Date) },
          status: InvoiceStatus.PENDING
        },
        data: {
          status: InvoiceStatus.OVERDUE
        }
      })
    })
  })
})