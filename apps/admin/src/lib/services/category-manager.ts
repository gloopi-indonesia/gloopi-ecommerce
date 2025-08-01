import prisma from '@/lib/prisma'
import { Category } from '@prisma/client'

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[]
  parent?: Category
  _count?: {
    products: number
  }
}

export interface CreateCategoryData {
  name: string
  description?: string
  parentId?: string
  isActive?: boolean
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string
}

export class CategoryManager {
  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryData): Promise<Category> {
    // Check if category name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name }
    })

    if (existingCategory) {
      throw new Error(`Category with name "${data.name}" already exists`)
    }

    // If parentId is provided, validate it exists
    if (data.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: data.parentId }
      })

      if (!parentCategory) {
        throw new Error(`Parent category with ID ${data.parentId} not found`)
      }
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        isActive: data.isActive ?? true
      }
    })

    return category
  }

  /**
   * Update an existing category
   */
  async updateCategory(data: UpdateCategoryData): Promise<Category> {
    const { id, ...updateData } = data

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      throw new Error(`Category with ID ${id} not found`)
    }

    // If name is being updated, check uniqueness
    if (updateData.name && updateData.name !== existingCategory.name) {
      const nameExists = await prisma.category.findUnique({
        where: { name: updateData.name }
      })

      if (nameExists) {
        throw new Error(`Category with name "${updateData.name}" already exists`)
      }
    }

    // If parentId is being updated, validate it
    if (updateData.parentId) {
      // Prevent circular references
      if (updateData.parentId === id) {
        throw new Error('Category cannot be its own parent')
      }

      // Check if the new parent exists
      const parentCategory = await prisma.category.findUnique({
        where: { id: updateData.parentId }
      })

      if (!parentCategory) {
        throw new Error(`Parent category with ID ${updateData.parentId} not found`)
      }

      // Check if the new parent is not a descendant of this category
      const isDescendant = await this.isDescendant(id, updateData.parentId)
      if (isDescendant) {
        throw new Error('Cannot set a descendant category as parent')
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    })

    return category
  }

  /**
   * Get all categories with hierarchical structure
   */
  async getCategories(includeInactive: boolean = false): Promise<CategoryWithChildren[]> {
    const where = includeInactive ? {} : { isActive: true }

    const categories = await prisma.category.findMany({
      where,
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

    // Build hierarchical structure
    return this.buildCategoryTree(categories as any[])
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<CategoryWithChildren | null> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!category) {
      return null
    }

    return category as CategoryWithChildren
  }

  /**
   * Get root categories (categories without parent)
   */
  async getRootCategories(): Promise<CategoryWithChildren[]> {
    const categories = await prisma.category.findMany({
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

    return categories as CategoryWithChildren[]
  }

  /**
   * Delete a category (soft delete by setting isActive to false)
   */
  async deleteCategory(id: string): Promise<void> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: true
      }
    })

    if (!category) {
      throw new Error(`Category with ID ${id} not found`)
    }

    // Check if category has active children
    const activeChildren = category.children.filter(child => child.isActive)
    if (activeChildren.length > 0) {
      throw new Error('Cannot delete category with active subcategories')
    }

    // Check if category has products
    if (category.products.length > 0) {
      throw new Error('Cannot delete category that has products assigned to it')
    }

    await prisma.category.update({
      where: { id },
      data: { isActive: false }
    })
  }

  /**
   * Get category path (breadcrumb)
   */
  async getCategoryPath(id: string): Promise<Category[]> {
    const path: Category[] = []
    let currentId: string | null = id

    while (currentId) {
      const category = await prisma.category.findUnique({
        where: { id: currentId }
      })

      if (!category) {
        break
      }

      path.unshift(category)
      currentId = category.parentId
    }

    return path
  }

  /**
   * Search categories by name
   */
  async searchCategories(query: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' }
    })

    return categories
  }

  /**
   * Build hierarchical category tree from flat array
   */
  private buildCategoryTree(categories: any[]): CategoryWithChildren[] {
    const categoryMap = new Map<string, CategoryWithChildren>()
    const rootCategories: CategoryWithChildren[] = []

    // Create map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] })
    })

    // Build tree structure
    categories.forEach(category => {
      const categoryNode = categoryMap.get(category.id)!
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children.push(categoryNode)
        }
      } else {
        rootCategories.push(categoryNode)
      }
    })

    return rootCategories
  }

  /**
   * Check if a category is a descendant of another category
   */
  private async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    let currentId: string | null = descendantId

    while (currentId) {
      if (currentId === ancestorId) {
        return true
      }

      const category = await prisma.category.findUnique({
        where: { id: currentId }
      })

      if (!category) {
        break
      }

      currentId = category.parentId
    }

    return false
  }
}

export const categoryManager = new CategoryManager()