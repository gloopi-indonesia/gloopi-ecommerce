import { NextRequest, NextResponse } from 'next/server'
import { productManager } from '@/lib/services/product-manager'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()

    if (typeof body.stock !== 'number' || body.stock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Stock must be a non-negative number'
          }
        },
        { status: 400 }
      )
    }

    const product = await productManager.updateStock(params.id, body.stock)

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Error updating product stock:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_STOCK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update product stock'
        }
      },
      { status: 500 }
    )
  }
}