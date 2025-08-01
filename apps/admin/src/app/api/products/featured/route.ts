import { NextRequest, NextResponse } from 'next/server'
import { productManager } from '@/lib/services/product-manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const products = await productManager.getFeaturedProducts(limit)

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
          message: error instanceof Error ? error.message : 'Failed to fetch featured products'
        }
      },
      { status: 500 }
    )
  }
}