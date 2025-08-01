import { CustomerType, Industry } from '@prisma/client'
import prisma from '../prisma'
import bcrypt from 'bcryptjs'

export interface CustomerData {
  email: string
  phone: string
  name: string
  type: CustomerType
  password?: string
  companyId?: string
  taxInformation?: TaxInformation
  communicationPreferences?: CommunicationPreferences
}

export interface TaxInformation {
  npwp?: string // Indonesian tax ID
  taxName?: string
  taxAddress?: string
  taxCity?: string
  taxProvince?: string
  taxPostalCode?: string
}

export interface CommunicationPreferences {
  whatsapp: boolean
  email: boolean
  phone: boolean
  preferredTime?: 'morning' | 'afternoon' | 'evening'
  language: 'id' | 'en'
}

export interface CompanyData {
  name: string
  registrationNumber: string
  taxId: string // NPWP
  industry: Industry
  email?: string
  phone?: string
  website?: string
  contactPerson: string
  address: string
  city: string
  province: string
  postalCode: string
  country?: string
}

export interface AddressData {
  label?: string
  address: string
  city: string
  province: string
  postalCode: string
  country?: string
  phone?: string
  isDefault?: boolean
}

export interface CustomerWithDetails {
  id: string
  email: string
  phone: string
  name: string
  type: CustomerType
  isEmailVerified: boolean
  isPhoneVerified: boolean
  taxInformation?: TaxInformation
  communicationPreferences?: CommunicationPreferences
  createdAt: Date
  updatedAt: Date
  company?: {
    id: string
    name: string
    registrationNumber: string
    taxId: string
    industry: Industry
    contactPerson: string
    address: string
    city: string
    province: string
    postalCode: string
  }
  addresses: {
    id: string
    label?: string
    address: string
    city: string
    province: string
    postalCode: string
    phone?: string
    isDefault: boolean
  }[]
  _count: {
    quotations: number
    orders: number
    invoices: number
  }
}

export interface CustomerHistory {
  quotations: {
    id: string
    quotationNumber: string
    status: string
    totalAmount: number
    createdAt: Date
  }[]
  orders: {
    id: string
    orderNumber: string
    status: string
    totalAmount: number
    createdAt: Date
  }[]
  invoices: {
    id: string
    invoiceNumber: string
    status: string
    totalAmount: number
    dueDate: Date
    paidAt?: Date
  }[]
  communications: {
    id: string
    type: string
    direction: string
    content: string
    status: string
    createdAt: Date
  }[]
}

export class CustomerManager {
  /**
   * Create a new customer
   */
  async createCustomer(data: CustomerData): Promise<CustomerWithDetails> {
    // Check if customer already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.phone }
        ]
      }
    })

    if (existingCustomer) {
      throw new Error('Customer with this email or phone already exists')
    }

    // Validate company if B2B customer
    if (data.type === CustomerType.B2B && data.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: data.companyId }
      })

      if (!company) {
        throw new Error('Company not found')
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 12)
    }

    const customer = await prisma.customer.create({
      data: {
        email: data.email,
        phone: data.phone,
        name: data.name,
        type: data.type,
        password: hashedPassword,
        companyId: data.companyId,
        taxInformation: data.taxInformation ? JSON.stringify(data.taxInformation) : null,
        communicationPreferences: data.communicationPreferences ? JSON.stringify(data.communicationPreferences) : null
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
            taxId: true,
            industry: true,
            contactPerson: true,
            address: true,
            city: true,
            province: true,
            postalCode: true
          }
        },
        addresses: {
          select: {
            id: true,
            label: true,
            address: true,
            city: true,
            province: true,
            postalCode: true,
            phone: true,
            isDefault: true
          }
        },
        _count: {
          select: {
            quotations: true,
            orders: true,
            invoices: true
          }
        }
      }
    })

    return this.formatCustomerWithDetails(customer)
  }

  /**
   * Update customer profile
   */
  async updateCustomerProfile(customerId: string, data: Partial<CustomerData>): Promise<void> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    // Check for email/phone conflicts if updating
    if (data.email || data.phone) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          AND: [
            { id: { not: customerId } },
            {
              OR: [
                ...(data.email ? [{ email: data.email }] : []),
                ...(data.phone ? [{ phone: data.phone }] : [])
              ]
            }
          ]
        }
      })

      if (existingCustomer) {
        throw new Error('Another customer with this email or phone already exists')
      }
    }

    // Validate company if updating to B2B or changing company
    if (data.type === CustomerType.B2B && data.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: data.companyId }
      })

      if (!company) {
        throw new Error('Company not found')
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 12)
    }

    const updateData: any = {}
    if (data.email) updateData.email = data.email
    if (data.phone) updateData.phone = data.phone
    if (data.name) updateData.name = data.name
    if (data.type) updateData.type = data.type
    if (hashedPassword) updateData.password = hashedPassword
    if (data.companyId !== undefined) updateData.companyId = data.companyId
    if (data.taxInformation) updateData.taxInformation = JSON.stringify(data.taxInformation)
    if (data.communicationPreferences) updateData.communicationPreferences = JSON.stringify(data.communicationPreferences)

    await prisma.customer.update({
      where: { id: customerId },
      data: updateData
    })
  }

  /**
   * Get customer by ID with full details
   */
  async getCustomerById(customerId: string): Promise<CustomerWithDetails | null> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
            taxId: true,
            industry: true,
            contactPerson: true,
            address: true,
            city: true,
            province: true,
            postalCode: true
          }
        },
        addresses: {
          select: {
            id: true,
            label: true,
            address: true,
            city: true,
            province: true,
            postalCode: true,
            phone: true,
            isDefault: true
          },
          orderBy: { isDefault: 'desc' }
        },
        _count: {
          select: {
            quotations: true,
            orders: true,
            invoices: true
          }
        }
      }
    })

    if (!customer) {
      return null
    }

    return this.formatCustomerWithDetails(customer)
  }

  /**
   * Get customer history (quotations, orders, invoices, communications)
   */
  async getCustomerHistory(customerId: string): Promise<CustomerHistory> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    const [quotations, orders, invoices, communications] = await Promise.all([
      prisma.quotation.findMany({
        where: { customerId },
        select: {
          id: true,
          quotationNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.order.findMany({
        where: { customerId },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.invoice.findMany({
        where: { customerId },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          totalAmount: true,
          dueDate: true,
          paidAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.communication.findMany({
        where: { customerId },
        select: {
          id: true,
          type: true,
          direction: true,
          content: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      })
    ])

    return {
      quotations: quotations.map(q => ({
        ...q,
        status: q.status as string
      })),
      orders: orders.map(o => ({
        ...o,
        status: o.status as string
      })),
      invoices: invoices.map(i => ({
        ...i,
        status: i.status as string
      })),
      communications: communications.map(c => ({
        ...c,
        type: c.type as string,
        direction: c.direction as string,
        status: c.status as string
      }))
    }
  }

  /**
   * Create company profile
   */
  async createCompany(data: CompanyData): Promise<string> {
    // Check if company already exists
    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { registrationNumber: data.registrationNumber },
          { taxId: data.taxId }
        ]
      }
    })

    if (existingCompany) {
      throw new Error('Company with this registration number or tax ID already exists')
    }

    const company = await prisma.company.create({
      data: {
        name: data.name,
        registrationNumber: data.registrationNumber,
        taxId: data.taxId,
        industry: data.industry,
        email: data.email,
        phone: data.phone,
        website: data.website,
        contactPerson: data.contactPerson,
        address: data.address,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        country: data.country || 'Indonesia'
      }
    })

    return company.id
  }

  /**
   * Update company profile
   */
  async updateCompany(companyId: string, data: Partial<CompanyData>): Promise<void> {
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })

    if (!company) {
      throw new Error('Company not found')
    }

    // Check for conflicts if updating registration number or tax ID
    if (data.registrationNumber || data.taxId) {
      const existingCompany = await prisma.company.findFirst({
        where: {
          AND: [
            { id: { not: companyId } },
            {
              OR: [
                ...(data.registrationNumber ? [{ registrationNumber: data.registrationNumber }] : []),
                ...(data.taxId ? [{ taxId: data.taxId }] : [])
              ]
            }
          ]
        }
      })

      if (existingCompany) {
        throw new Error('Another company with this registration number or tax ID already exists')
      }
    }

    await prisma.company.update({
      where: { id: companyId },
      data
    })
  }

  /**
   * Link customer to company
   */
  async linkCompanyProfile(customerId: string, companyId: string): Promise<void> {
    const [customer, company] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.company.findUnique({ where: { id: companyId } })
    ])

    if (!customer) {
      throw new Error('Customer not found')
    }

    if (!company) {
      throw new Error('Company not found')
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        companyId,
        type: CustomerType.B2B // Automatically set to B2B when linking to company
      }
    })
  }

  /**
   * Add address to customer
   */
  async addCustomerAddress(customerId: string, addressData: AddressData): Promise<string> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    // If this is set as default, unset other default addresses
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { customerId },
        data: { isDefault: false }
      })
    }

    const address = await prisma.address.create({
      data: {
        customerId,
        label: addressData.label,
        address: addressData.address,
        city: addressData.city,
        province: addressData.province,
        postalCode: addressData.postalCode,
        country: addressData.country || 'Indonesia',
        phone: addressData.phone,
        isDefault: addressData.isDefault || false
      }
    })

    return address.id
  }

  /**
   * Update customer address
   */
  async updateCustomerAddress(addressId: string, customerId: string, addressData: Partial<AddressData>): Promise<void> {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        customerId
      }
    })

    if (!address) {
      throw new Error('Address not found or does not belong to customer')
    }

    // If this is set as default, unset other default addresses
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { customerId },
        data: { isDefault: false }
      })
    }

    await prisma.address.update({
      where: { id: addressId },
      data: addressData
    })
  }

  /**
   * Validate tax information
   */
  async validateTaxInformation(taxInfo: TaxInformation): Promise<boolean> {
    // Basic validation for Indonesian NPWP
    if (taxInfo.npwp) {
      // NPWP format: XX.XXX.XXX.X-XXX.XXX (15 digits)
      const npwpRegex = /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/
      if (!npwpRegex.test(taxInfo.npwp)) {
        throw new Error('Invalid NPWP format. Expected format: XX.XXX.XXX.X-XXX.XXX')
      }
    }

    // Additional validation can be added here (e.g., API calls to tax authority)
    return true
  }

  /**
   * Search customers
   */
  async searchCustomers(query: string, type?: CustomerType, limit: number = 50): Promise<CustomerWithDetails[]> {
    const whereClause: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } }
      ]
    }

    if (type) {
      whereClause.type = type
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
            taxId: true,
            industry: true,
            contactPerson: true,
            address: true,
            city: true,
            province: true,
            postalCode: true
          }
        },
        addresses: {
          select: {
            id: true,
            label: true,
            address: true,
            city: true,
            province: true,
            postalCode: true,
            phone: true,
            isDefault: true
          },
          orderBy: { isDefault: 'desc' }
        },
        _count: {
          select: {
            quotations: true,
            orders: true,
            invoices: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return customers.map(customer => this.formatCustomerWithDetails(customer))
  }

  /**
   * Get all customers with pagination
   */
  async getCustomers(page: number = 1, limit: number = 50, type?: CustomerType): Promise<{
    customers: CustomerWithDetails[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const skip = (page - 1) * limit
    const whereClause = type ? { type } : {}

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              registrationNumber: true,
              taxId: true,
              industry: true,
              contactPerson: true,
              address: true,
              city: true,
              province: true,
              postalCode: true
            }
          },
          addresses: {
            select: {
              id: true,
              label: true,
              address: true,
              city: true,
              province: true,
              postalCode: true,
              phone: true,
              isDefault: true
            },
            orderBy: { isDefault: 'desc' }
          },
          _count: {
            select: {
              quotations: true,
              orders: true,
              invoices: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.customer.count({ where: whereClause })
    ])

    return {
      customers: customers.map(customer => this.formatCustomerWithDetails(customer)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Format customer with details helper
   */
  private formatCustomerWithDetails(customer: any): CustomerWithDetails {
    return {
      ...customer,
      taxInformation: customer.taxInformation ? JSON.parse(customer.taxInformation) : undefined,
      communicationPreferences: customer.communicationPreferences ? JSON.parse(customer.communicationPreferences) : undefined
    }
  }
}

// Export singleton instance
export const customerManager = new CustomerManager()