import prisma from '@/lib/prisma'
import { Brand } from '@prisma/client'

export interface BrandWithStats extends Brand {
  _count?: {
    products: number
  }
}

export interface CreateBrandData {
  name: string
  description?: string
  logo?: string
  isActive?: boolean
}

export interface UpdateBrandData extends Partial<CreateBrandData> {
  id: string
}

export class BrandManager {
  /**
   * Create a new brand
   */
  async createBrand(data: CreateBrandData): Promise<Brand> {
    // Check if brand name already exists
    const existingBrand = await prisma.brand.findUnique({
      where: { name: data.name }
    })

    if (existingBrand) {
      throw new Error(`Brand with name "${data.name}" already exists`)
    }

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        description: data.description,
        logo: data.logo,
        isActive: data.isActive ?? true
      }
    })

    return brand
  }

  /**
   * Update an existing brand
   */
  async updateBrand(data: UpdateBrandData): Promise<Brand> {
    const { id, ...updateData } = data

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id }
    })

    if (!existingBrand) {
      throw new Error(`Brand with ID ${id} not found`)
    }

    // If name is being updated, check uniqueness
    if (updateData.name && updateData.name !== existingBrand.name) {
      const nameExists = await prisma.brand.findUnique({
        where: { name: updateData.name }
      })

      if (nameExists) {
        throw new Error(`Brand with name "${updateData.name}" already exists`)
      }
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: updateData
    })

    return brand
  }

  /**
   * Get all brands with optional stats
   */
  async getBrands(includeInactive: boolean = false, includeStats: boolean = false): Promise<BrandWithStats[]> {
    const where = includeInactive ? {} : { isActive: true }

    const brands = await prisma.brand.findMany({
      where,
      include: includeStats ? {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      } : undefined,
      orderBy: { name: 'asc' }
    })

    return brands as BrandWithStats[]
  }

  /**
   * Get a single brand by ID
   */
  async getBrandById(id: string, includeStats: boolean = false): Promise<BrandWithStats | null> {
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: includeStats ? {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      } : undefined
    })

    return brand as BrandWithStats | null
  }

  /**
   * Get a single brand by name
   */
  async getBrandByName(name: string): Promise<Brand | null> {
    const brand = await prisma.brand.findUnique({
      where: { name }
    })

    return brand
  }

  /**
   * Delete a brand (soft delete by setting isActive to false)
   */
  async deleteBrand(id: string): Promise<void> {
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true }
        }
      }
    })

    if (!brand) {
      throw new Error(`Brand with ID ${id} not found`)
    }

    // Check if brand has active products
    if (brand.products.length > 0) {
      throw new Error('Cannot delete brand that has active products')
    }

    await prisma.brand.update({
      where: { id },
      data: { isActive: false }
    })
  }

  /**
   * Search brands by name
   */
  async searchBrands(query: string): Promise<Brand[]> {
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' }
    })

    return brands
  }

  /**
   * Get brands with product count
   */
  async getBrandsWithProductCount(): Promise<BrandWithStats[]> {
    const brands = await prisma.brand.findMany({
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

    return brands as BrandWithStats[]
  }

  /**
   * Get top brands by product count
   */
  async getTopBrands(limit: number = 10): Promise<BrandWithStats[]> {
    const brands = await prisma.brand.findMany({
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
      take: limit
    })

    return brands as BrandWithStats[]
  }
}

export const brandManager = new BrandManager()