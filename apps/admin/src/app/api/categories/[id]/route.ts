import { NextRequest, NextResponse } from 'next/server'
import { categoryManager } from '@/lib/services/category-manager'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const category = await categoryManager.getCategoryById(params.id)

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found'
          }
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_CATEGORY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch category'
        }
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()

    const category = await categoryManager.updateCategory({
      id: params.id,
      ...body
    })

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_CATEGORY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update category'
        }
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await categoryManager.deleteCategory(params.id)

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_CATEGORY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete category'
        }
      },
      { status: 500 }
    )
  }
}