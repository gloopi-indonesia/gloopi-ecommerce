import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rootOnly = searchParams.get('rootOnly') === 'true'

    let categories
    if (rootOnly) {
      categories = await prisma.category.findMany({
        where: {
          parentId: null,
          isActive: true
        },
        include: {
          children: {
            where: { isActive: true },
            include: {
              children: {
                where: { isActive: true }
              }
            },
            orderBy: { name: 'asc' }
          },
          _count: {
            select: {
              products: {
                where: {
                  product: { isActive: true }
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      })
    } else {
      categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
          parent: true,
          _count: {
            select: {
              products: {
                where: {
                  product: { isActive: true }
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      })
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
          message: 'Failed to fetch categories'
        }
      },
      { status: 500 }
    )
  }
}