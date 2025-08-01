import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

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
      data: productsWithFormattedPrices
    })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_FEATURED_PRODUCTS_ERROR',
          message: 'Failed to fetch featured products'
        }
      },
      { status: 500 }
    )
  }
}