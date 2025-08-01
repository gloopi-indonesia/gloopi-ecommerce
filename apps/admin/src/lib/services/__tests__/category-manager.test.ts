import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock Prisma - must be defined before import
vi.mock('@/lib/prisma', () => ({
  default: {
    category: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }
  }
}))

import { CategoryManager } from '../category-manager'
import prisma from '@/lib/prisma'

const mockPrisma = prisma as any

describe('CategoryManager', () => {
  let categoryManager: CategoryManager

  beforeEach(() => {
    categoryManager = new CategoryManager()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('createCategory', () => {
    const mockCategoryData = {
      name: 'Medical Supplies',
      description: 'Medical equipment and supplies',
      isActive: true
    }

    it('should create a category successfully', async () => {
      const mockCreatedCategory = {
        id: 'cat-1',
        ...mockCategoryData,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPrisma.category.findUnique.mockResolvedValue(null) // Name doesn't exist
      mockPrisma.category.create.mockResolvedValue(mockCreatedCategory)

      const result = await categoryManager.createCategory(mockCategoryData)

      expect(result).toEqual(mockCreatedCategory)
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: mockCategoryData.name }
      })
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: mockCategoryData.name,
          description: mockCategoryData.description,
          parentId: undefined,
          isActive: true
        }
      })
    })

    it('should throw error if category name already exists', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'existing-cat' })

      await expect(categoryManager.createCategory(mockCategoryData))
        .rejects.toThrow('Category with name "Medical Supplies" already exists')
    })

    it('should validate parent category exists', async () => {
      const dataWithParent = {
        ...mockCategoryData,
        parentId: 'parent-1'
      }

      mockPrisma.category.findUnique
        .mockResolvedValueOnce(null) // Name check
        .mockResolvedValueOnce(null) // Parent check

      await expect(categoryManager.createCategory(dataWithParent))
        .rejects.toThrow('Parent category with ID parent-1 not found')
    })
  })

  describe('getCategories', () => {
    const mockCategories = [
      {
        id: 'cat-1',
        name: 'Medical',
        parentId: null,
        parent: null,
        _count: { products: 5 }
      },
      {
        id: 'cat-2',
        name: 'Gloves',
        parentId: 'cat-1',
        parent: { id: 'cat-1', name: 'Medical' },
        _count: { products: 3 }
      }
    ]

    it('should get all categories with hierarchical structure', async () => {
      mockPrisma.category.findMany.mockResolvedValue(mockCategories)

      const result = await categoryManager.getCategories()

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          parent: true,
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: { name: 'asc' }
      })

      // Should build hierarchical structure
      expect(result).toHaveLength(1) // Only root categories
      expect(result[0].id).toBe('cat-1')
      expect(result[0].children).toHaveLength(1)
      expect(result[0].children[0].id).toBe('cat-2')
    })

    it('should include inactive categories when requested', async () => {
      mockPrisma.category.findMany.mockResolvedValue([])

      await categoryManager.getCategories(true)

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          parent: true,
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: { name: 'asc' }
      })
    })
  })

  describe('getRootCategories', () => {
    it('should get only root categories', async () => {
      const mockRootCategories = [
        {
          id: 'cat-1',
          name: 'Medical',
          parentId: null,
          children: [
            {
              id: 'cat-2',
              name: 'Gloves',
              children: []
            }
          ],
          _count: { products: 5 }
        }
      ]

      mockPrisma.category.findMany.mockResolvedValue(mockRootCategories)

      const result = await categoryManager.getRootCategories()

      expect(result).toEqual(mockRootCategories)
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: {
          parentId: null,
          isActive: true
        },
        include: {
          children: {
            where: { isActive: true },
            include: {
              children: {
                where: { isActive: true }
              }
            },
            orderBy: { name: 'asc' }
          },
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: { name: 'asc' }
      })
    })
  })

  describe('updateCategory', () => {
    const mockExistingCategory = {
      id: 'cat-1',
      name: 'Medical',
      description: 'Medical supplies',
      parentId: null,
      isActive: true
    }

    it('should update category successfully', async () => {
      const updateData = {
        id: 'cat-1',
        description: 'Updated description'
      }

      const mockUpdatedCategory = {
        ...mockExistingCategory,
        description: 'Updated description'
      }

      mockPrisma.category.findUnique.mockResolvedValue(mockExistingCategory)
      mockPrisma.category.update.mockResolvedValue(mockUpdatedCategory)

      const result = await categoryManager.updateCategory(updateData)

      expect(result).toEqual(mockUpdatedCategory)
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: { description: 'Updated description' }
      })
    })

    it('should throw error if category not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null)

      await expect(categoryManager.updateCategory({ id: 'cat-1', name: 'New Name' }))
        .rejects.toThrow('Category with ID cat-1 not found')
    })

    it('should validate name uniqueness when updating', async () => {
      const updateData = {
        id: 'cat-1',
        name: 'New Name'
      }

      mockPrisma.category.findUnique
        .mockResolvedValueOnce(mockExistingCategory) // Category exists check
        .mockResolvedValueOnce({ id: 'other-cat' }) // Name exists check

      await expect(categoryManager.updateCategory(updateData))
        .rejects.toThrow('Category with name "New Name" already exists')
    })
  })

  describe('deleteCategory', () => {
    it('should soft delete category successfully', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Medical',
        children: [],
        products: []
      }

      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)
      mockPrisma.category.update.mockResolvedValue({ ...mockCategory, isActive: false })

      await categoryManager.deleteCategory('cat-1')

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: { isActive: false }
      })
    })

    it('should throw error if category has active children', async () => {
      const mockCategory = {
        id: 'cat-1',
        children: [{ id: 'child-1', isActive: true }],
        products: []
      }

      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)

      await expect(categoryManager.deleteCategory('cat-1'))
        .rejects.toThrow('Cannot delete category with active subcategories')
    })

    it('should throw error if category has products', async () => {
      const mockCategory = {
        id: 'cat-1',
        children: [],
        products: [{ id: 'product-1' }]
      }

      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)

      await expect(categoryManager.deleteCategory('cat-1'))
        .rejects.toThrow('Cannot delete category that has products assigned to it')
    })
  })

  describe('searchCategories', () => {
    it('should search categories by name and description', async () => {
      const mockSearchResults = [
        { id: 'cat-1', name: 'Medical Gloves', description: 'Gloves for medical use' }
      ]

      mockPrisma.category.findMany.mockResolvedValue(mockSearchResults)

      const result = await categoryManager.searchCategories('medical')

      expect(result).toEqual(mockSearchResults)
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
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
})