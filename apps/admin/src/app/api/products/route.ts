import { NextRequest, NextResponse } from 'next/server'
import { productManager, ProductFilters } from '@/lib/services/product-manager'
import { UseCase } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const useCase = searchParams.get('useCase') as UseCase | undefined
    const brandId = searchParams.get('brandId') || undefined
    const categoryId = searchParams.get('categoryId') || undefined
    const search = searchParams.get('search') || undefined
    const isActive = searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined
    const isFeatured = searchParams.get('isFeatured') ? searchParams.get('isFeatured') === 'true' : undefined
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined

    const filters: ProductFilters = {
      useCase,
      brandId,
      categoryId,
      search,
      isActive,
      isFeatured,
      minPrice: minPrice ? minPrice * 100 : undefined, // Convert to cents
      maxPrice: maxPrice ? maxPrice * 100 : undefined, // Convert to cents
    }

    const result = await productManager.getProducts(filters, page, limit)

    // Convert prices back to rupiah for response
    const productsWithFormattedPrices = result.products.map(product => ({
      ...product,
      basePrice: product.basePrice / 100,
      pricingTiers: product.pricingTiers.map(tier => ({
        ...tier,
        pricePerUnit: tier.pricePerUnit / 100
      }))
    }))

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        products: productsWithFormattedPrices
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_PRODUCTS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch products'
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
    const requiredFields = ['sku', 'name', 'useCase', 'brandId', 'basePrice', 'categoryIds']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: `Field ${field} is required`
            }
          },
          { status: 400 }
        )
      }
    }

    // Convert price to cents
    const productData = {
      ...body,
      basePrice: Math.round(body.basePrice * 100),
      pricingTiers: body.pricingTiers?.map((tier: any) => ({
        ...tier,
        pricePerUnit: Math.round(tier.pricePerUnit * 100)
      })) || []
    }

    const product = await productManager.createProduct(productData)

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
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_PRODUCT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create product'
        }
      },
      { status: 500 }
    )
  }
}