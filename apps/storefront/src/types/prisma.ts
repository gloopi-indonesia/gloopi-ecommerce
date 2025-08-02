import { Prisma } from '@prisma/client'

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
   include: {
      product: {
         include: {
            brand: true
            categories: {
               include: {
                  category: true
               }
            }
            pricingTiers: true
         }
      }
   }
}>

export type ProductWithIncludes = Prisma.ProductGetPayload<{
   include: {
      brand: true
      categories: {
         include: {
            category: true
         }
      }
      pricingTiers: true
   }
}>

export type ProductDetailWithIncludes = Prisma.ProductGetPayload<{
   include: {
      brand: true
      categories: {
         include: {
            category: true
         }
      }
      pricingTiers: true
   }
}>

export type CustomerWithIncludes = Prisma.CustomerGetPayload<{
   include: {
      addresses: true
      company: true
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
            company: true
         }
      }
      items: {
         include: {
            product: {
               include: {
                  brand: true
                  categories: {
                     include: {
                        category: true
                     }
                  }
               }
            }
         }
      }
      invoice: true
   }
}>

export type QuotationWithIncludes = Prisma.QuotationGetPayload<{
   include: {
      customer: {
         include: {
            company: true
         }
      }
      items: {
         include: {
            product: {
               include: {
                  brand: true
                  categories: {
                     include: {
                        category: true
                     }
                  }
               }
            }
         }
      }
      shippingAddress: true
   }
}>
