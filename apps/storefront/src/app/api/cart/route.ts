import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: NextRequest) {
   try {
      const token = request.cookies.get('token')?.value

      if (!token) {
         return NextResponse.json({ items: [] })
      }

      const payload = await verifyJWT(token) as any
      if (!payload || typeof payload.sub !== 'string') {
         return NextResponse.json({ items: [] })
      }

      const cartItems = await prisma.cartItem.findMany({
         where: {
            customerId: payload.sub,
         },
         include: {
            product: {
               include: {
                  brand: true,
                  categories: {
                     include: {
                        category: true,
                     },
                  },
                  pricingTiers: true,
               },
            },
         },
      })

      return NextResponse.json({ items: cartItems })
   } catch (error) {
      console.error('Error fetching cart:', error)
      return NextResponse.json({ items: [] })
   }
}

export async function POST(request: NextRequest) {
   try {
      const token = request.cookies.get('token')?.value

      if (!token) {
         return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
         )
      }

      const payload = await verifyJWT(token) as any
      if (!payload || typeof payload.sub !== 'string') {
         return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
         )
      }

      const { productId, quantity } = await request.json()

      if (!productId || !quantity || quantity < 1) {
         return NextResponse.json(
            { error: 'Invalid product ID or quantity' },
            { status: 400 }
         )
      }

      // Check if product exists and is active
      const product = await prisma.product.findFirst({
         where: {
            id: productId,
            isActive: true,
         },
      })

      if (!product) {
         return NextResponse.json(
            { error: 'Product not found' },
            { status: 404 }
         )
      }

      // Check stock availability
      if (product.stock < quantity) {
         return NextResponse.json(
            { error: 'Insufficient stock' },
            { status: 400 }
         )
      }

      // Upsert cart item
      await prisma.cartItem.upsert({
         where: {
            UniqueCustomerProduct: {
               customerId: payload.sub,
               productId: productId,
            },
         },
         update: {
            quantity: quantity,
         },
         create: {
            customerId: payload.sub,
            productId: productId,
            quantity: quantity,
         },
      })

      // Return updated cart
      const cartItems = await prisma.cartItem.findMany({
         where: {
            customerId: payload.sub,
         },
         include: {
            product: {
               include: {
                  brand: true,
                  categories: {
                     include: {
                        category: true,
                     },
                  },
                  pricingTiers: true,
               },
            },
         },
      })

      return NextResponse.json({ items: cartItems })
   } catch (error) {
      console.error('Error updating cart:', error)
      return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
      )
   }
}