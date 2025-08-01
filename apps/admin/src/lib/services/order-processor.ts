import { OrderStatus, InvoiceStatus } from '@prisma/client'
import prisma from '../prisma'

export interface OrderWithDetails {
  id: string
  orderNumber: string
  quotationId: string
  customerId: string
  status: OrderStatus
  subtotal: number
  taxAmount: number
  totalAmount: number
  shippingAddressId: string
  trackingNumber?: string
  shippedAt?: Date
  deliveredAt?: Date
  createdAt: Date
  updatedAt: Date
  customer: {
    id: string
    name: string
    email: string
    phone: string
    type: string
  }
  items: {
    id: string
    productId: string
    quantity: number
    unitPrice: number
    totalPrice: number
    product: {
      id: string
      name: string
      sku: string
      images: string[]
    }
  }[]
  shippingAddress: {
    id: string
    address: string
    city: string
    province: string
    postalCode: string
  }
  invoice?: {
    id: string
    invoiceNumber: string
    status: InvoiceStatus
    dueDate: Date
    paidAt?: Date
  }
}

export interface InvoiceWithDetails {
  id: string
  invoiceNumber: string
  orderId: string
  customerId: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  status: InvoiceStatus
  dueDate: Date
  paidAt?: Date
  paymentMethod?: string
  paymentNotes?: string
  taxInvoiceRequested: boolean
  createdAt: Date
  updatedAt: Date
  customer: {
    id: string
    name: string
    email: string
    phone: string
    type: string
  }
  order: {
    id: string
    orderNumber: string
    status: OrderStatus
  }
  items: {
    id: string
    productId: string
    quantity: number
    unitPrice: number
    totalPrice: number
    product: {
      id: string
      name: string
      sku: string
    }
  }[]
}

export interface PaymentInfo {
  paymentMethod: string
  paymentNotes?: string
  paidAt?: Date
}

export class OrderProcessor {
  /**
   * Generate Indonesian-formatted order number
   * Format: ORD/YYYY/MM/NNNN (e.g., ORD/2024/01/0001)
   */
  private async generateOrderNumber(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    
    // Get the count of orders created this month
    const startOfMonth = new Date(year, now.getMonth(), 1)
    const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999)
    
    const count = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })
    
    const sequence = String(count + 1).padStart(4, '0')
    return `ORD/${year}/${month}/${sequence}`
  }

  /**
   * Generate Indonesian-formatted invoice number
   * Format: INV/YYYY/MM/NNNN (e.g., INV/2024/01/0001)
   */
  private async generateInvoiceNumber(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    
    // Get the count of invoices created this month
    const startOfMonth = new Date(year, now.getMonth(), 1)
    const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999)
    
    const count = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })
    
    const sequence = String(count + 1).padStart(4, '0')
    return `INV/${year}/${month}/${sequence}`
  }

  /**
   * Create order from approved quotation
   */
  async createOrderFromQuotation(quotationId: string, adminUserId: string): Promise<OrderWithDetails> {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
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

    if (!quotation) {
      throw new Error('Quotation not found')
    }

    if (quotation.status !== 'APPROVED') {
      throw new Error('Only approved quotations can be converted to orders')
    }

    if (quotation.convertedOrderId) {
      throw new Error('Quotation has already been converted to an order')
    }

    if (!quotation.shippingAddress) {
      throw new Error('Shipping address is required to create an order')
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber()

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          quotationId,
          customerId: quotation.customerId,
          status: OrderStatus.NEW,
          subtotal: quotation.subtotal,
          taxAmount: quotation.taxAmount,
          totalAmount: quotation.totalAmount,
          shippingAddressId: quotation.shippingAddressId!,
          items: {
            create: quotation.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice
            }))
          }
        },
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
        }
      })

      // Update quotation status to CONVERTED and link to order
      await tx.quotation.update({
        where: { id: quotationId },
        data: {
          status: 'CONVERTED',
          convertedOrderId: newOrder.id
        }
      })

      // Log quotation status change
      await tx.quotationStatusLog.create({
        data: {
          quotationId,
          fromStatus: 'APPROVED',
          toStatus: 'CONVERTED',
          notes: `Converted to order ${orderNumber}`,
          adminUserId
        }
      })

      // Log order status
      await tx.orderStatusLog.create({
        data: {
          orderId: newOrder.id,
          fromStatus: null,
          toStatus: OrderStatus.NEW,
          notes: `Order created from quotation ${quotation.quotationNumber}`,
          adminUserId
        }
      })

      return newOrder
    })

    return order as OrderWithDetails
  }

  /**
   * Update order status with logging
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminUserId: string,
    notes?: string
  ): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      throw new Error('Order not found')
    }

    // Validate status transition
    this.validateStatusTransition(order.status, newStatus)

    const updateData: any = { status: newStatus }

    // Set timestamps for specific status changes
    if (newStatus === OrderStatus.SHIPPED) {
      updateData.shippedAt = new Date()
    } else if (newStatus === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date()
    }

    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: updateData
      })

      // Log status change
      await tx.orderStatusLog.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: newStatus,
          notes,
          adminUserId
        }
      })
    })
  }

  /**
   * Validate order status transitions
   */
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.NEW]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [], // Final state
      [OrderStatus.CANCELLED]: [] // Final state
    }

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`)
    }
  }

  /**
   * Generate invoice for order
   */
  async generateInvoice(orderId: string): Promise<InvoiceWithDetails> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            type: true
          }
        },
        invoice: true
      }
    })

    if (!order) {
      throw new Error('Order not found')
    }

    if (order.invoice) {
      throw new Error('Invoice already exists for this order')
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber()

    // Set due date (30 days from creation)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId,
        customerId: order.customerId,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
        status: InvoiceStatus.PENDING,
        dueDate,
        items: {
          create: order.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }))
        }
      },
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
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        }
      }
    })

    return invoice as InvoiceWithDetails
  }

  /**
   * Add tracking number to order
   */
  async addTrackingNumber(orderId: string, trackingNumber: string, adminUserId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      throw new Error('Order not found')
    }

    await prisma.$transaction(async (tx) => {
      // Update order with tracking number and set status to SHIPPED if not already
      const updateData: any = { trackingNumber }
      let newStatus = order.status

      if (order.status === OrderStatus.PROCESSING) {
        updateData.status = OrderStatus.SHIPPED
        updateData.shippedAt = new Date()
        newStatus = OrderStatus.SHIPPED
      }

      await tx.order.update({
        where: { id: orderId },
        data: updateData
      })

      // Log the tracking number addition
      await tx.orderStatusLog.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: newStatus,
          notes: `Tracking number added: ${trackingNumber}`,
          adminUserId
        }
      })
    })
  }

  /**
   * Process payment for invoice
   */
  async processPayment(invoiceId: string, paymentDetails: PaymentInfo): Promise<void> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('Invoice is already paid')
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error('Cannot process payment for cancelled invoice')
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.PAID,
        paidAt: paymentDetails.paidAt || new Date(),
        paymentMethod: paymentDetails.paymentMethod,
        paymentNotes: paymentDetails.paymentNotes
      }
    })
  }

  /**
   * Get order by ID with full details
   */
  async getOrderById(orderId: string): Promise<OrderWithDetails | null> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
        },
        statusLogs: {
          include: {
            adminUser: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return order as OrderWithDetails | null
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: OrderStatus): Promise<OrderWithDetails[]> {
    const orders = await prisma.order.findMany({
      where: { status },
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

    return orders as OrderWithDetails[]
  }

  /**
   * Get customer orders
   */
  async getCustomerOrders(customerId: string): Promise<OrderWithDetails[]> {
    const orders = await prisma.order.findMany({
      where: { customerId },
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

    return orders as OrderWithDetails[]
  }

  /**
   * Get invoice by ID with full details
   */
  async getInvoiceById(invoiceId: string): Promise<InvoiceWithDetails | null> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
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
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        }
      }
    })

    return invoice as InvoiceWithDetails | null
  }

  /**
   * Get invoices by status
   */
  async getInvoicesByStatus(status: InvoiceStatus): Promise<InvoiceWithDetails[]> {
    const invoices = await prisma.invoice.findMany({
      where: { status },
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
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return invoices as InvoiceWithDetails[]
  }

  /**
   * Mark overdue invoices
   */
  async markOverdueInvoices(): Promise<number> {
    const now = new Date()
    
    const result = await prisma.invoice.updateMany({
      where: {
        dueDate: { lt: now },
        status: InvoiceStatus.PENDING
      },
      data: {
        status: InvoiceStatus.OVERDUE
      }
    })

    return result.count
  }

  /**
   * Get customer invoices
   */
  async getCustomerInvoices(customerId: string): Promise<InvoiceWithDetails[]> {
    const invoices = await prisma.invoice.findMany({
      where: { customerId },
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
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return invoices as InvoiceWithDetails[]
  }
}

// Export singleton instance
export const orderProcessor = new OrderProcessor()