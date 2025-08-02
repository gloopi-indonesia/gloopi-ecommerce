import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { formatter } from '@/lib/utils'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import { ProductsTable } from './components/table'
import { ProductColumn } from './components/table'

export default async function ProductsPage() {
   const products = await prisma.product.findMany({
      include: {
         orderItems: true,
         categories: true,
         brand: true,
      },
      orderBy: {
         createdAt: 'desc',
      },
   })

   const formattedProducts: ProductColumn[] = products.map((product) => ({
      id: product.id,
      title: product.name, // Map name to title
      price: formatter.format(product.basePrice / 100), // Convert from cents to IDR
      discount: formatter.format(0), // No discount field in schema
      category: product.categories[0]?.categoryId || 'N/A', // CategoryId since we don't have full category object
      sales: product.orderItems.length, // Use orderItems instead of orders
      isAvailable: product.isActive, // Map isActive to isAvailable
      stock: product.stock,
      createdAt: format(product.createdAt, 'MMMM do, yyyy'),
   }))

   return (
      <div className="block space-y-4 my-6">
         <div className="flex items-center justify-between">
            <Heading
               title={`Products (${products.length})`}
               description="Manage products for your store"
            />
            <Link href="/products/new">
               <Button>
                  <Plus className="mr-2 h-4" /> Add New
               </Button>
            </Link>
         </div>
         <Separator />
         <ProductsTable data={formattedProducts} />
      </div>
   )
}
