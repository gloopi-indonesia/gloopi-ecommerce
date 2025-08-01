import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { UseCase } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const useCase = searchParams.get('useCase') as UseCase | undefined
    const brandId = searchParams.get('brandId') || undefined
    const categoryId = searchParams.get('categoryId') || undefined
    const search = searchParams.get('search') || undefined
    const isFeatured = searchParams.get('isFeatured') ? searchParams.get('isFeatured') === 'true' : undefined
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined

    const skip = (page - 1) * limit
    const where: any = {
      isActive: true // Only show active products on storefront
    }

    // Apply filters
    if (useCase) {
      where.useCase = useCase
    }

    if (brandId) {
      where.brandId = brandId
    }

    if (categoryId) {
      where.categories = {
        some: {
          categoryId: categoryId
        }
      }
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (minPrice || maxPrice) {
      where.basePrice = {}
      if (minPrice) {
        where.basePrice.gte = Math.round(minPrice * 100) // Convert to cents
      }
      if (maxPrice) {
        where.basePrice.lte = Math.round(maxPrice * 100) // Convert to cents
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

    // Convert prices back to rupiah for response
    const productsWithFormattedPrices = products.map(product => ({
      ...product,
      basePrice: product.basePrice / 100,
      pricingTiers: product.pricingTiers.map(tier => ({
        ...tier,
        pricePerUnit: tier.pricePerUnit / 100
      }))
    }))

    return NextResponse.json({
      success: true,
      data: {
        products: productsWithFormattedPrices,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_PRODUCTS_ERROR',
          message: 'Failed to fetch products'
        }
      },
      { status: 500 }
    )
  }
}