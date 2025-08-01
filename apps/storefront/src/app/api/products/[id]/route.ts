import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const product = await prisma.product.findUnique({
      where: { 
        id: params.id,
        isActive: true // Only show active products on storefront
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
      }
    })

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found'
          }
        },
        { status: 404 }
      )
    }

    // Convert prices back to rupiah for response
    const productWithFormattedPrices = {
      ...product,
      basePrice: product.basePrice / 100,
      pricingTiers: product.pricingTiers.map(tier => ({
        ...tier,
        pricePerUnit: tier.pricePerUnit / 100
      }))
    }

    return NextResponse.json({
      success: true,
      data: productWithFormattedPrices
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_PRODUCT_ERROR',
          message: 'Failed to fetch product'
        }
      },
      { status: 500 }
    )
  }
}