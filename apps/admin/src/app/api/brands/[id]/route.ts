import { NextRequest, NextResponse } from 'next/server'
import { brandManager } from '@/lib/services/brand-manager'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'

    const brand = await brandManager.getBrandById(params.id, includeStats)

    if (!brand) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BRAND_NOT_FOUND',
            message: 'Brand not found'
          }
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: brand
    })
  } catch (error) {
    console.error('Error fetching brand:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_BRAND_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch brand'
        }
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()

    const brand = await brandManager.updateBrand({
      id: params.id,
      ...body
    })

    return NextResponse.json({
      success: true,
      data: brand
    })
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_BRAND_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update brand'
        }
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await brandManager.deleteBrand(params.id)

    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_BRAND_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete brand'
        }
      },
      { status: 500 }
    )
  }
}