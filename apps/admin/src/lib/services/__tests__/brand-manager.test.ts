import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock Prisma - must be defined before import
vi.mock('@/lib/prisma', () => ({
  default: {
    brand: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }
  }
}))

import { BrandManager } from '../brand-manager'
import prisma from '@/lib/prisma'

const mockPrisma = prisma as any

describe('BrandManager', () => {
  let brandManager: BrandManager

  beforeEach(() => {
    brandManager = new BrandManager()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('createBrand', () => {
    const mockBrandData = {
      name: 'Ansell',
      description: 'Leading manufacturer of protective gloves',
      logo: 'https://example.com/ansell-logo.png',
      isActive: true
    }

    it('should create a brand successfully', async () => {
      const mockCreatedBrand = {
        id: 'brand-1',
        ...mockBrandData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPrisma.brand.findUnique.mockResolvedValue(null) // Name doesn't exist
      mockPrisma.brand.create.mockResolvedValue(mockCreatedBrand)

      const result = await brandManager.createBrand(mockBrandData)

      expect(result).toEqual(mockCreatedBrand)
      expect(mockPrisma.brand.findUnique).toHaveBeenCalledWith({
        where: { name: mockBrandData.name }
      })
      expect(mockPrisma.brand.create).toHaveBeenCalledWith({
        data: mockBrandData
      })
    })

    it('should throw error if brand name already exists', async () => {
      mockPrisma.brand.findUnique.mockResolvedValue({ id: 'existing-brand' })

      await expect(brandManager.createBrand(mockBrandData))
        .rejects.toThrow('Brand with name "Ansell" already exists')
    })

    it('should set default isActive to true', async () => {
      const dataWithoutActive = {
        name: 'Test Brand',
        description: 'Test description'
      }

      const mockCreatedBrand = {
        id: 'brand-1',
        ...dataWithoutActive,
        logo: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPrisma.brand.findUnique.mockResolvedValue(null)
      mockPrisma.brand.create.mockResolvedValue(mockCreatedBrand)

      await brandManager.createBrand(dataWithoutActive)

      expect(mockPrisma.brand.create).toHaveBeenCalledWith({
        data: {
          ...dataWithoutActive,
          logo: undefined,
          isActive: true
        }
      })
    })
  })

  describe('getBrands', () => {
    const mockBrands = [
      {
        id: 'brand-1',
        name: 'Ansell',
        description: 'Leading manufacturer',
        logo: 'logo1.png',
        isActive: true,
        _count: { products: 5 }
      },
      {
        id: 'brand-2',
        name: 'Kimberly-Clark',
        description: 'Healthcare products',
        logo: 'logo2.png',
        isActive: true,
        _count: { products: 3 }
      }
    ]

    it('should get active brands without stats', async () => {
      const brandsWithoutStats = mockBrands.map(({ _count, ...brand }) => brand)
      mockPrisma.brand.findMany.mockResolvedValue(brandsWithoutStats)

      const result = await brandManager.getBrands()

      expect(result).toEqual(brandsWithoutStats)
      expect(mockPrisma.brand.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: undefined,
        orderBy: { name: 'asc' }
      })
    })

    it('should get brands with stats when requested', async () => {
      mockPrisma.brand.findMany.mockResolvedValue(mockBrands)

      const result = await brandManager.getBrands(false, true)

      expect(result).toEqual(mockBrands)
      expect(mockPrisma.brand.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              products: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      })
    })

    it('should include inactive brands when requested', async () => {
      mockPrisma.brand.findMany.mockResolvedValue(mockBrands)

      await brandManager.getBrands(true, false)

      expect(mockPrisma.brand.findMany).toHaveBeenCalledWith({
        where: {},
        include: undefined,
        orderBy: { name: 'asc' }
      })
    })
  })

  describe('updateBrand', () => {
    const mockExistingBrand = {
      id: 'brand-1',
      name: 'Ansell',
      description: 'Leading manufacturer',
      logo: 'logo.png',
      isActive: true
    }

    it('should update brand successfully', async () => {
      const updateData = {
        id: 'brand-1',
        description: 'Updated description'
      }

      const mockUpdatedBrand = {
        ...mockExistingBrand,
        description: 'Updated description'
      }

      mockPrisma.brand.findUnique.mockResolvedValue(mockExistingBrand)
      mockPrisma.brand.update.mockResolvedValue(mockUpdatedBrand)

      const result = await brandManager.updateBrand(updateData)

      expect(result).toEqual(mockUpdatedBrand)
      expect(mockPrisma.brand.update).toHaveBeenCalledWith({
        where: { id: 'brand-1' },
        data: { description: 'Updated description' }
      })
    })

    it('should throw error if brand not found', async () => {
      mockPrisma.brand.findUnique.mockResolvedValue(null)

      await expect(brandManager.updateBrand({ id: 'brand-1', name: 'New Name' }))
        .rejects.toThrow('Brand with ID brand-1 not found')
    })

    it('should validate name uniqueness when updating', async () => {
      const updateData = {
        id: 'brand-1',
        name: 'New Name'
      }

      mockPrisma.brand.findUnique
        .mockResolvedValueOnce(mockExistingBrand) // Brand exists check
        .mockResolvedValueOnce({ id: 'other-brand' }) // Name exists check

      await expect(brandManager.updateBrand(updateData))
        .rejects.toThrow('Brand with name "New Name" already exists')
    })
  })

  describe('deleteBrand', () => {
    it('should soft delete brand successfully', async () => {
      const mockBrand = {
        id: 'brand-1',
        name: 'Ansell',
        products: []
      }

      mockPrisma.brand.findUnique.mockResolvedValue(mockBrand)
      mockPrisma.brand.update.mockResolvedValue({ ...mockBrand, isActive: false })

      await brandManager.deleteBrand('brand-1')

      expect(mockPrisma.brand.update).toHaveBeenCalledWith({
        where: { id: 'brand-1' },
        data: { isActive: false }
      })
    })

    it('should throw error if brand has active products', async () => {
      const mockBrand = {
        id: 'brand-1',
        products: [{ id: 'product-1', isActive: true }]
      }

      mockPrisma.brand.findUnique.mockResolvedValue(mockBrand)

      await expect(brandManager.deleteBrand('brand-1'))
        .rejects.toThrow('Cannot delete brand that has active products')
    })

    it('should throw error if brand not found', async () => {
      mockPrisma.brand.findUnique.mockResolvedValue(null)

      await expect(brandManager.deleteBrand('brand-1'))
        .rejects.toThrow('Brand with ID brand-1 not found')
    })
  })

  describe('searchBrands', () => {
    it('should search brands by name and description', async () => {
      const mockSearchResults = [
        { id: 'brand-1', name: 'Ansell Medical', description: 'Medical gloves manufacturer' }
      ]

      mockPrisma.brand.findMany.mockResolvedValue(mockSearchResults)

      const result = await brandManager.searchBrands('medical')

      expect(result).toEqual(mockSearchResults)
      expect(mockPrisma.brand.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { name: { contains: 'medical', mode: 'insensitive' } },
            { description: { contains: 'medical', mode: 'insensitive' } }
          ]
        },
        orderBy: { name: 'asc' }
      })
    })
  })

  describe('getTopBrands', () => {
    it('should get top brands by product count', async () => {
      const mockTopBrands = [
        {
          id: 'brand-1',
          name: 'Ansell',
          _count: { products: 10 }
        },
        {
          id: 'brand-2',
          name: 'Kimberly-Clark',
          _count: { products: 8 }
        }
      ]

      mockPrisma.brand.findMany.mockResolvedValue(mockTopBrands)

      const result = await brandManager.getTopBrands(5)

      expect(result).toEqual(mockTopBrands)
      expect(mockPrisma.brand.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              products: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: {
          products: {
            _count: 'desc'
          }
        },
        take: 5
      })
    })
  })
})