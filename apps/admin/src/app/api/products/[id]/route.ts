import { NextRequest, NextResponse } from 'next/server'
import { productManager } from '@/lib/services/product-manager'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const product = await productManager.getProductById(params.id)

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
          message: error instanceof Error ? error.message : 'Failed to fetch product'
        }
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()

    // Convert price to cents if provided
    const updateData = {
      ...body,
      id: params.id,
      basePrice: body.basePrice ? Math.round(body.basePrice * 100) : undefined,
      pricingTiers: body.pricingTiers?.map((tier: any) => ({
        ...tier,
        pricePerUnit: Math.round(tier.pricePerUnit * 100)
      }))
    }

    const product = await productManager.updateProduct(updateData)

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
    console.error('Error updating product:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_PRODUCT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update product'
        }
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await productManager.deleteProduct(params.id)

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_PRODUCT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete product'
        }
      },
      { status: 500 }
    )
  }
}