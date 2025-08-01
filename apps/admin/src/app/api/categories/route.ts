import { NextRequest, NextResponse } from 'next/server'
import { categoryManager } from '@/lib/services/category-manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const rootOnly = searchParams.get('rootOnly') === 'true'

    let categories
    if (rootOnly) {
      categories = await categoryManager.getRootCategories()
    } else {
      categories = await categoryManager.getCategories(includeInactive)
    }

    return NextResponse.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_CATEGORIES_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch categories'
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
            message: 'Category name is required'
          }
        },
        { status: 400 }
      )
    }

    const category = await categoryManager.createCategory(body)

    return NextResponse.json({
      success: true,
      data: category
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_CATEGORY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create category'
        }
      },
      { status: 500 }
    )
  }
}