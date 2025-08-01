import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { UseCase } from '@prisma/client'

// Mock Prisma - must be defined before import
vi.mock('@/lib/prisma', () => ({
  default: {
    product: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      fields: { minStock: 'minStock' }
    },
    brand: {
      findUnique: vi.fn()
    },
    category: {
      findMany: vi.fn()
    },
    productCategory: {
      createMany: vi.fn(),
      deleteMany: vi.fn()
    },
    pricingTier: {
      createMany: vi.fn(),
      updateMany: vi.fn()
    },
    $transaction: vi.fn()
  }
}))

import { ProductManager } from '../product-manager'
import prisma from '@/lib/prisma'

const mockPrisma = prisma as any

describe('ProductManager', () => {
  let productManager: ProductManager

  beforeEach(() => {
    productManager = new ProductManager()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('createProduct', () => {
    const mockProductData = {
      sku: 'GLV-001',
      name: 'Medical Gloves',
      description: 'High-quality medical gloves',
      images: ['image1.jpg', 'image2.jpg'],
      specifications: { material: 'latex', size: 'M' },
      useCase: UseCase.MEDICAL,
      brandId: 'brand-1',
      basePrice: 50000, // 500 IDR
      stock: 100,
      minStock: 10,
      isActive: true,
      isFeatured: false,
      categoryIds: ['cat-1', 'cat-2'],
      pricingTiers: [
        { minQuantity: 10, maxQuantity: 49, pricePerUnit: 45000 },
        { minQuantity: 50, pricePerUnit: 40000 }
      ]
    }

    const mockBrand = {
      id: 'brand-1',
      name: 'Test Brand',
      isActive: true
    }

    const mockCategories = [
      { id: 'cat-1', name: 'Category 1' },
      { id: 'cat-2', name: 'Category 2' }
    ]

    const mockCreatedProduct = {
      id: 'product-1',
      ...mockProductData,
      brand: mockBrand,
      categories: mockCategories.map(cat => ({ category: cat })),
      pricingTiers: mockProductData.pricingTiers.map((tier, index) => ({
        id: `tier-${index}`,
        productId: 'product-1',
        ...tier,
        isActive: true
      }))
    }

    it('should create a product successfully', async () => {
      // Setup mocks
      mockPrisma.product.findUnique.mockResolvedValue(null) // SKU doesn't exist
      mockPrisma.brand.findUnique.mockResolvedValue(mockBrand)
      mockPrisma.category.findMany.mockResolvedValue(mockCategories)
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          product: {
            create: vi.fn().mockResolvedValue({ id: 'product-1', ...mockProductData }),
            findUnique: vi.fn().mockResolvedValue(mockCreatedProduct)
          },
          productCategory: {
            createMany: vi.fn()
          },
          pricingTier: {
            createMany: vi.fn()
          }
        }
        return callback(mockTx)
      })

      const result = await productManager.createProduct(mockProductData)

      expect(result).toEqual(mockCreatedProduct)
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { sku: mockProductData.sku }
      })
      expect(mockPrisma.brand.findUnique).toHaveBeenCalledWith({
        where: { id: mockProductData.brandId }
      })
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { id: { in: mockProductData.categoryIds } }
      })
    })

    it('should throw error if SKU already exists', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'existing-product' })

      await expect(productManager.createProduct(mockProductData))
        .rejects.toThrow('Product with SKU GLV-001 already exists')
    })

    it('should throw error if brand not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null)
      mockPrisma.brand.findUnique.mockResolvedValue(null)

      await expect(productManager.createProduct(mockProductData))
        .rejects.toThrow('Brand with ID brand-1 not found')
    })

    it('should throw error if categories not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null)
      mockPrisma.brand.findUnique.mockResolvedValue(mockBrand)
      mockPrisma.category.findMany.mockResolvedValue([mockCategories[0]]) // Only one category found

      await expect(productManager.createProduct(mockProductData))
        .rejects.toThrow('One or more categories not found')
    })
  })

  describe('getProducts', () => {
    const mockProducts = [
      {
        id: 'product-1',
        sku: 'GLV-001',
        name: 'Medical Gloves',
        useCase: UseCase.MEDICAL,
        basePrice: 50000,
        brand: { id: 'brand-1', name: 'Test Brand' },
        categories: [{ category: { id: 'cat-1', name: 'Category 1' } }],
        pricingTiers: []
      }
    ]

    it('should get products with filters', async () => {
      mockPrisma.product.count.mockResolvedValue(1)
      mockPrisma.product.findMany.mockResolvedValue(mockProducts)

      const filters = {
        useCase: UseCase.MEDICAL,
        search: 'gloves'
      }

      const result = await productManager.getProducts(filters, 1, 10)

      expect(result).toEqual({
        products: mockProducts,
        total: 1,
        totalPages: 1,
        currentPage: 1
      })

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          useCase: UseCase.MEDICAL,
          OR: [
            { name: { contains: 'gloves', mode: 'insensitive' } },
            { description: { contains: 'gloves', mode: 'insensitive' } },
            { sku: { contains: 'gloves', mode: 'insensitive' } }
          ]
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
        skip: 0,
        take: 10
      })
    })

    it('should handle price range filters', async () => {
      mockPrisma.product.count.mockResolvedValue(0)
      mockPrisma.product.findMany.mockResolvedValue([])

      const filters = {
        minPrice: 1, // 1 cent
        maxPrice: 10 // 10 cents
      }

      await productManager.getProducts(filters)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            basePrice: {
              gte: 1, // 1 cent
              lte: 10 // 10 cents
            }
          }
        })
      )
    })
  })

  describe('calculatePrice', () => {
    const mockProduct = {
      id: 'product-1',
      basePrice: 50000, // 500 IDR
      pricingTiers: [
        { minQuantity: 10, maxQuantity: 49, pricePerUnit: 45000 }, // 450 IDR
        { minQuantity: 50, maxQuantity: null, pricePerUnit: 40000 } // 400 IDR
      ]
    } as any

    it('should use base price for small quantities', () => {
      const price = productManager.calculatePrice(mockProduct, 5)
      expect(price).toBe(250000) // 5 * 500 IDR
    })

    it('should use tier price for medium quantities', () => {
      const price = productManager.calculatePrice(mockProduct, 25)
      expect(price).toBe(1125000) // 25 * 450 IDR
    })

    it('should use highest tier price for large quantities', () => {
      const price = productManager.calculatePrice(mockProduct, 100)
      expect(price).toBe(4000000) // 100 * 400 IDR
    })
  })

  describe('updateStock', () => {
    it('should update stock successfully', async () => {
      const mockProduct = { id: 'product-1', stock: 50 }
      mockPrisma.product.update.mockResolvedValue(mockProduct)

      const result = await productManager.updateStock('product-1', 50)

      expect(result).toEqual(mockProduct)
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: { stock: 50 }
      })
    })

    it('should throw error for negative stock', async () => {
      await expect(productManager.updateStock('product-1', -5))
        .rejects.toThrow('Stock cannot be negative')
    })
  })

  describe('getLowStockProducts', () => {
    it('should get products with low stock', async () => {
      const mockLowStockProducts = [
        {
          id: 'product-1',
          stock: 5,
          minStock: 10,
          brand: { name: 'Test Brand' },
          categories: [],
          pricingTiers: []
        }
      ]

      mockPrisma.product.findMany.mockResolvedValue(mockLowStockProducts)

      const result = await productManager.getLowStockProducts()

      expect(result).toEqual(mockLowStockProducts)
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          stock: {
            lte: mockPrisma.product.fields.minStock
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
    })
  })
})