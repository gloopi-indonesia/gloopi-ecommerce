import { NextRequest, NextResponse } from 'next/server'
import { brandManager } from '@/lib/services/brand-manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const includeStats = searchParams.get('includeStats') === 'true'

    const brands = await brandManager.getBrands(includeInactive, includeStats)

    return NextResponse.json({
      success: true,
      data: brands
    })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_BRANDS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch brands'
        }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Brand name is required'
          }
        },
        { status: 400 }
      )
    }

    const brand = await brandManager.createBrand(body)

    return NextResponse.json({
      success: true,
      data: brand
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_BRAND_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create brand'
        }
      },
      { status: 500 }
    )
  }
}