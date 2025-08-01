import { QuotationStatus } from '@prisma/client'
import prisma from '../prisma'

export interface PORequest {
  customerId: string
  items: {
    productId: string
    quantity: number
  }[]
  shippingAddressId?: string
  notes?: string
}

export interface QuotationWithDetails {
  id: string
  quotationNumber: string
  customerId: string
  status: QuotationStatus
  subtotal: number
  taxAmount: number
  totalAmount: number
  validUntil: Date
  notes?: string
  shippingAddressId?: string
  convertedOrderId?: string
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
    notes?: string
    product: {
      id: string
      name: string
      sku: string
      images: string[]
    }
  }[]
  shippingAddress?: {
    id: string
    address: string
    city: string
    province: string
    postalCode: string
  } | null
}

export class QuotationManager {
  /**
   * Generate Indonesian-formatted quotation number
   * Format: QUO/YYYY/MM/NNNN (e.g., QUO/2024/01/0001)
   */
  private async generateQuotationNumber(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    
    // Get the count of quotations created this month
    const startOfMonth = new Date(year, now.getMonth(), 1)
    const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999)
    
    const count = await prisma.quotation.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })
    
    const sequence = String(count + 1).padStart(4, '0')
    return `QUO/${year}/${month}/${sequence}`
  }

  /**
   * Calculate pricing for quotation items
   */
  private async calculateItemPricing(items: PORequest['items']) {
    const itemsWithPricing = []
    let subtotal = 0

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          pricingTiers: {
            where: {
              isActive: true,
              minQuantity: { lte: item.quantity },
              OR: [
                { maxQuantity: null },
                { maxQuantity: { gte: item.quantity } }
              ]
            },
            orderBy: { minQuantity: 'desc' },
            take: 1
          }
        }
      })

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`)
      }

      // Use pricing tier if available, otherwise use base price
      const unitPrice = product.pricingTiers[0]?.pricePerUnit || product.basePrice
      const totalPrice = unitPrice * item.quantity

      itemsWithPricing.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        product
      })

      subtotal += totalPrice
    }

    return { itemsWithPricing, subtotal }
  }

  /**
   * Create a new quotation from PO request
   */
  async createQuotation(request: PORequest): Promise<QuotationWithDetails> {
    // Validate customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: request.customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    // Validate shipping address if provided
    if (request.shippingAddressId) {
      const address = await prisma.address.findFirst({
        where: {
          id: request.shippingAddressId,
          customerId: request.customerId
        }
      })

      if (!address) {
        throw new Error('Shipping address not found or does not belong to customer')
      }
    }

    // Calculate pricing
    const { itemsWithPricing, subtotal } = await this.calculateItemPricing(request.items)

    // Generate quotation number
    const quotationNumber = await this.generateQuotationNumber()

    // Set validity period (30 days from creation)
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 30)

    // Create quotation with items in a transaction
    const quotation = await prisma.$transaction(async (tx) => {
      const newQuotation = await tx.quotation.create({
        data: {
          quotationNumber,
          customerId: request.customerId,
          status: QuotationStatus.PENDING,
          subtotal,
          taxAmount: 0, // Tax will be calculated when converting to order if needed
          totalAmount: subtotal,
          shippingAddressId: request.shippingAddressId,
          validUntil,
          notes: request.notes,
          items: {
            create: itemsWithPricing.map(item => ({
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

      return newQuotation
    })

    return quotation as QuotationWithDetails
  }

  /**
   * Update quotation status with logging
   */
  async updateQuotationStatus(
    quotationId: string,
    newStatus: QuotationStatus,
    adminUserId: string,
    notes?: string
  ): Promise<void> {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId }
    })

    if (!quotation) {
      throw new Error('Quotation not found')
    }

    // Validate status transition
    this.validateStatusTransition(quotation.status, newStatus)

    await prisma.$transaction(async (tx) => {
      // Update quotation status
      await tx.quotation.update({
        where: { id: quotationId },
        data: { status: newStatus }
      })

      // Log status change
      await tx.quotationStatusLog.create({
        data: {
          quotationId,
          fromStatus: quotation.status,
          toStatus: newStatus,
          notes,
          adminUserId
        }
      })
    })
  }

  /**
   * Validate status transitions
   */
  private validateStatusTransition(currentStatus: QuotationStatus, newStatus: QuotationStatus): void {
    const validTransitions: Record<QuotationStatus, QuotationStatus[]> = {
      [QuotationStatus.PENDING]: [QuotationStatus.APPROVED, QuotationStatus.REJECTED, QuotationStatus.EXPIRED],
      [QuotationStatus.APPROVED]: [QuotationStatus.CONVERTED, QuotationStatus.EXPIRED],
      [QuotationStatus.REJECTED]: [], // Final state
      [QuotationStatus.CONVERTED]: [], // Final state
      [QuotationStatus.EXPIRED]: [] // Final state
    }

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`)
    }
  }

  /**
   * Convert approved quotation to order
   */
  async convertToOrder(quotationId: string, adminUserId: string): Promise<string> {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        items: true,
        customer: true
      }
    })

    if (!quotation) {
      throw new Error('Quotation not found')
    }

    if (quotation.status !== QuotationStatus.APPROVED) {
      throw new Error('Only approved quotations can be converted to orders')
    }

    if (quotation.convertedOrderId) {
      throw new Error('Quotation has already been converted to an order')
    }

    // Import OrderProcessor dynamically to avoid circular dependency
    const { orderProcessor } = await import('./order-processor')
    const order = await orderProcessor.createOrderFromQuotation(quotationId, adminUserId)

    return order.id
  }

  /**
   * Get quotations by status
   */
  async getQuotationsByStatus(status: QuotationStatus): Promise<QuotationWithDetails[]> {
    const quotations = await prisma.quotation.findMany({
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
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return quotations as QuotationWithDetails[]
  }

  /**
   * Get quotation by ID with full details
   */
  async getQuotationById(quotationId: string): Promise<QuotationWithDetails | null> {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
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

    return quotation as QuotationWithDetails | null
  }

  /**
   * Schedule follow-up for quotation
   */
  async scheduleFollowUp(
    quotationId: string,
    scheduledAt: Date,
    adminUserId: string,
    notes?: string
  ): Promise<void> {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId }
    })

    if (!quotation) {
      throw new Error('Quotation not found')
    }

    await prisma.followUp.create({
      data: {
        customerId: quotation.customerId,
        quotationId,
        type: 'QUOTATION_FOLLOW_UP',
        scheduledAt,
        notes,
        adminUserId
      }
    })
  }

  /**
   * Get quotations for a specific customer
   */
  async getCustomerQuotations(customerId: string): Promise<QuotationWithDetails[]> {
    const quotations = await prisma.quotation.findMany({
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
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return quotations as QuotationWithDetails[]
  }

  /**
   * Mark expired quotations
   */
  async markExpiredQuotations(): Promise<number> {
    const now = new Date()
    
    const result = await prisma.quotation.updateMany({
      where: {
        validUntil: { lt: now },
        status: { in: [QuotationStatus.PENDING, QuotationStatus.APPROVED] }
      },
      data: {
        status: QuotationStatus.EXPIRED
      }
    })

    return result.count
  }
}

// Export singleton instance
export const quotationManager = new QuotationManager()