import prisma from '@/lib/prisma'
import { Product, UseCase, PricingTier, Brand, Category } from '@prisma/client'

export interface ProductWithRelations extends Product {
  brand: Brand
  categories: Array<{ category: Category }>
  pricingTiers: PricingTier[]
}

export interface ProductFilters {
  useCase?: UseCase
  brandId?: string
  categoryId?: string
  isActive?: boolean
  isFeatured?: boolean
  search?: string
  minPrice?: number
  maxPrice?: number
}

export interface CreateProductData {
  sku: string
  name: string
  description?: string
  images: string[]
  specifications?: Record<string, any>
  useCase: UseCase
  brandId: string
  basePrice: number
  stock: number
  minStock: number
  isActive?: boolean
  isFeatured?: boolean
  categoryIds: string[]
  pricingTiers: Array<{
    minQuantity: number
    maxQuantity?: number
    pricePerUnit: number
  }>
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string
}

export class ProductManager {
  /**
   * Create a new product with categories and pricing tiers
   */
  async createProduct(data: CreateProductData): Promise<ProductWithRelations> {
    const { categoryIds, pricingTiers, ...productData } = data

    // Validate SKU uniqueness
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku }
    })

    if (existingProduct) {
      throw new Error(`Product with SKU ${data.sku} already exists`)
    }

    // Validate brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: data.brandId }
    })

    if (!brand) {
      throw new Error(`Brand with ID ${data.brandId} not found`)
    }

    // Validate categories exist
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } }
    })

    if (categories.length !== categoryIds.length) {
      throw new Error('One or more categories not found')
    }

    // Create product with relations in a transaction
    const product = await prisma.$transaction(async (tx) => {
      // Create the product
      const newProduct = await tx.product.create({
        data: {
          ...productData,
          basePrice: Math.round(productData.basePrice), // Ensure integer for IDR cents
        }
      })

      // Create category relationships
      await tx.productCategory.createMany({
        data: categoryIds.map(categoryId => ({
          productId: newProduct.id,
          categoryId
        }))
      })

      // Create pricing tiers
      if (pricingTiers.length > 0) {
        await tx.pricingTier.createMany({
          data: pricingTiers.map(tier => ({
            productId: newProduct.id,
            minQuantity: tier.minQuantity,
            maxQuantity: tier.maxQuantity,
            pricePerUnit: Math.round(tier.pricePerUnit), // Ensure integer for IDR cents
          }))
        })
      }

      // Return product with relations
      return await tx.product.findUnique({
        where: { id: newProduct.id },
        include: {
          brand: true,
          categories: {
            include: { category: true }
          },
          pricingTiers: {
            where: { isActive: true },
            orderBy: { minQuantity: 'asc' }
          }
        }
      })
    })

    if (!product) {
      throw new Error('Failed to create product')
    }

    return product as ProductWithRelations
  }

  /**
   * Update an existing product
   */
  async updateProduct(data: UpdateProductData): Promise<ProductWithRelations> {
    const { id, categoryIds, pricingTiers, ...updateData } = data

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      throw new Error(`Product with ID ${id} not found`)
    }

    // If SKU is being updated, check uniqueness
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: updateData.sku }
      })

      if (skuExists) {
        throw new Error(`Product with SKU ${updateData.sku} already exists`)
      }
    }

    // Update product with relations in a transaction
    const product = await prisma.$transaction(async (tx) => {
      // Update the product
      await tx.product.update({
        where: { id },
        data: {
          ...updateData,
          basePrice: updateData.basePrice ? Math.round(updateData.basePrice) : undefined,
        }
      })

      // Update categories if provided
      if (categoryIds) {
        // Remove existing category relationships
        await tx.productCategory.deleteMany({
          where: { productId: id }
        })

        // Create new category relationships
        if (categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: categoryIds.map(categoryId => ({
              productId: id,
              categoryId
            }))
          })
        }
      }

      // Update pricing tiers if provided
      if (pricingTiers) {
        // Deactivate existing pricing tiers
        await tx.pricingTier.updateMany({
          where: { productId: id },
          data: { isActive: false }
        })

        // Create new pricing tiers
        if (pricingTiers.length > 0) {
          await tx.pricingTier.createMany({
            data: pricingTiers.map(tier => ({
              productId: id,
              minQuantity: tier.minQuantity,
              maxQuantity: tier.maxQuantity,
              pricePerUnit: Math.round(tier.pricePerUnit),
            }))
          })
        }
      }

      // Return updated product with relations
      return await tx.product.findUnique({
        where: { id },
        include: {
          brand: true,
          categories: {
            include: { category: true }
          },
          pricingTiers: {
            where: { isActive: true },
            orderBy: { minQuantity: 'asc' }
          }
        }
      })
    })

    if (!product) {
      throw new Error('Failed to update product')
    }

    return product as ProductWithRelations
  }

  /**
   * Get products with filtering and pagination
   */
  async getProducts(
    filters: ProductFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    products: ProductWithRelations[]
    total: number
    totalPages: number
    currentPage: number
  }> {
    const skip = (page - 1) * limit
    const where: any = {}

    // Apply filters
    if (filters.useCase) {
      where.useCase = filters.useCase
    }

    if (filters.brandId) {
      where.brandId = filters.brandId
    }

    if (filters.categoryId) {
      where.categories = {
        some: {
          categoryId: filters.categoryId
        }
      }
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (filters.minPrice || filters.maxPrice) {
      where.basePrice = {}
      if (filters.minPrice) {
        where.basePrice.gte = Math.round(filters.minPrice)
      }
      if (filters.maxPrice) {
        where.basePrice.lte = Math.round(filters.maxPrice)
      }
    }

    // Get total count
    const total = await prisma.product.count({ where })

    // Get products with relations
    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        categories: {
          include: { category: true }
        },
        pricingTiers: {
          where: { isActive: true },
          orderBy: { minQuantity: 'asc' }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    return {
      products: products as ProductWithRelations[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<ProductWithRelations | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        categories: {
          include: { category: true }
        },
        pricingTiers: {
          where: { isActive: true },
          orderBy: { minQuantity: 'asc' }
        }
      }
    })

    return product as ProductWithRelations | null
  }

  /**
   * Get a single product by SKU
   */
  async getProductBySku(sku: string): Promise<ProductWithRelations | null> {
    const product = await prisma.product.findUnique({
      where: { sku },
      include: {
        brand: true,
        categories: {
          include: { category: true }
        },
        pricingTiers: {
          where: { isActive: true },
          orderBy: { minQuantity: 'asc' }
        }
      }
    })

    return product as ProductWithRelations | null
  }

  /**
   * Delete a product (soft delete by setting isActive to false)
   */
  async deleteProduct(id: string): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      throw new Error(`Product with ID ${id} not found`)
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    })
  }

  /**
   * Update product stock
   */
  async updateStock(id: string, stock: number): Promise<Product> {
    if (stock < 0) {
      throw new Error('Stock cannot be negative')
    }

    const product = await prisma.product.update({
      where: { id },
      data: { stock }
    })

    return product
  }

  /**
   * Get products with low stock
   */
  async getLowStockProducts(): Promise<ProductWithRelations[]> {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: {
          lte: prisma.product.fields.minStock
        }
      },
      include: {
        brand: true,
        categories: {
          include: { category: true }
        },
        pricingTiers: {
          where: { isActive: true },
          orderBy: { minQuantity: 'asc' }
        }
      },
      orderBy: { stock: 'asc' }
    })

    return products as ProductWithRelations[]
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 10): Promise<ProductWithRelations[]> {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true
      },
      include: {
        brand: true,
        categories: {
          include: { category: true }
        },
        pricingTiers: {
          where: { isActive: true },
          orderBy: { minQuantity: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return products as ProductWithRelations[]
  }

  /**
   * Get products by use case
   */
  async getProductsByUseCase(useCase: UseCase, limit?: number): Promise<ProductWithRelations[]> {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        useCase
      },
      include: {
        brand: true,
        categories: {
          include: { category: true }
        },
        pricingTiers: {
          where: { isActive: true },
          orderBy: { minQuantity: 'asc' }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    return products as ProductWithRelations[]
  }

  /**
   * Calculate price for a product based on quantity
   */
  calculatePrice(product: ProductWithRelations, quantity: number): number {
    // Find the appropriate pricing tier
    const applicableTier = product.pricingTiers
      .filter(tier => 
        quantity >= tier.minQuantity && 
        (tier.maxQuantity === null || quantity <= tier.maxQuantity)
      )
      .sort((a, b) => b.minQuantity - a.minQuantity)[0] // Get the highest applicable tier

    // Use tier price if available, otherwise use base price
    const unitPrice = applicableTier ? applicableTier.pricePerUnit : product.basePrice
    
    return unitPrice * quantity
  }
}

export const productManager = new ProductManager()