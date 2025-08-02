import { Prisma } from '@prisma/client'

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
   include: {
      product: {
         include: {
            brand: true
            categories: true
         }
      }
   }
}>

export type ProductWithIncludes = Prisma.ProductGetPayload<{
   include: {
      brand: true
      categories: true
   }
}>

export type CustomerWithIncludes = Prisma.CustomerGetPayload<{
   include: {
      addresses: true
      orders: {
         include: {
            items: {
               include: {
                  product: true
               }
            }
         }
      }
   }
}>

export type OrderWithIncludes = Prisma.OrderGetPayload<{
   include: {
      shippingAddress: true
      customer: {
         include: {
            addresses: true
            orders: true
         }
      }
      items: {
         include: {
            product: true
         }
      }
      invoice: true
   }
}>
