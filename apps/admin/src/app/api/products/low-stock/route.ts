import { NextRequest, NextResponse } from 'next/server'
import { productManager } from '@/lib/services/product-manager'

export async function GET(_request: NextRequest) {
  try {
    const products = await productManager.getLowStockProducts()

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
    console.error('Error fetching low stock products:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_LOW_STOCK_PRODUCTS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch low stock products'
        }
      },
      { status: 500 }
    )
  }
}