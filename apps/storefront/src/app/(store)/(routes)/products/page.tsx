import { ProductGrid } from '@/components/native/Product'
import { Heading } from '@/components/native/heading'
import { Separator } from '@/components/native/separator'
import prisma from '@/lib/prisma'
import { isVariableValid } from '@/lib/utils'
import { UseCase } from '@prisma/client'

import {
   BrandCombobox,
   CategoriesCombobox,
   SortBy,
   UseCaseFilter,
   SearchInput,
} from './components/options'

interface SearchParams {
   sort?: string
   brand?: string
   category?: string
   useCase?: UseCase
   search?: string
   page?: string
}

export default async function Products({
   searchParams
}: {
   searchParams: SearchParams
}) {
   const {
      sort,
      brand,
      category,
      useCase,
      search,
      page = '1'
   } = searchParams ?? {}

   const orderBy = getOrderBy(sort)
   const currentPage = parseInt(page)
   const itemsPerPage = 12

   // Fetch filter options
   const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
   })

   const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
   })

   // Build where clause for products
   const whereClause: any = {
      isActive: true,
   }

   if (brand) {
      whereClause.brand = {
         name: {
            contains: brand,
            mode: 'insensitive',
         },
      }
   }

   if (category) {
      whereClause.categories = {
         some: {
            category: {
               name: {
                  contains: category,
                  mode: 'insensitive',
               },
            },
         },
      }
   }

   if (useCase) {
      whereClause.useCase = useCase
   }

   if (search) {
      whereClause.OR = [
         {
            name: {
               contains: search,
               mode: 'insensitive',
            },
         },
         {
            description: {
               contains: search,
               mode: 'insensitive',
            },
         },
      ]
   }

   // Fetch products with pagination
   const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
         where: whereClause,
         orderBy,
         skip: (currentPage - 1) * itemsPerPage,
         take: itemsPerPage,
         include: {
            brand: true,
            categories: {
               include: {
                  category: true,
               },
            },
            pricingTiers: {
               orderBy: {
                  minQuantity: 'asc',
               },
            },
         },
      }),
      prisma.product.count({
         where: whereClause,
      }),
   ])

   const totalPages = Math.ceil(totalCount / itemsPerPage)

   return (
      <div className="container mx-auto px-4 py-8">
         <Heading
            title="Katalog Produk Sarung Tangan"
            description="Temukan sarung tangan industri berkualitas tinggi untuk kebutuhan medis, manufaktur, dan makanan"
         />

         {/* Search and Filters */}
         <div className="mb-6 space-y-4">
            <SearchInput initialValue={search} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <SortBy initialData={sort} />
               <UseCaseFilter initialValue={useCase} />
               <CategoriesCombobox
                  initialCategory={category}
                  categories={categories}
               />
               <BrandCombobox
                  initialBrand={brand}
                  brands={brands}
               />
            </div>
         </div>

         <Separator className="mb-6" />

         {/* Results Summary */}
         <div className="mb-4 text-sm text-muted-foreground">
            Menampilkan {products.length} dari {totalCount} produk
            {search && ` untuk "${search}"`}
            {useCase && ` dalam kategori ${getUseCaseLabel(useCase)}`}
         </div>

         {/* Product Grid */}
         {isVariableValid(products) && products.length > 0 ? (
            <>
               <ProductGrid products={products} />

               {/* Pagination */}
               {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                     <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                           <a
                              key={pageNum}
                              href={`?${new URLSearchParams({
                                 ...searchParams,
                                 page: pageNum.toString(),
                              }).toString()}`}
                              className={`px-3 py-2 rounded-md text-sm ${pageNum === currentPage
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80'
                                 }`}
                           >
                              {pageNum}
                           </a>
                        ))}
                     </div>
                  </div>
               )}
            </>
         ) : (
            <div className="text-center py-12">
               <p className="text-muted-foreground mb-4">
                  {search || useCase || brand || category
                     ? 'Tidak ada produk yang sesuai dengan filter yang dipilih.'
                     : 'Belum ada produk yang tersedia.'}
               </p>
               {(search || useCase || brand || category) && (
                  <a
                     href="/products"
                     className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                     Lihat Semua Produk
                  </a>
               )}
            </div>
         )}
      </div>
   )
}

function getOrderBy(sort?: string) {
   switch (sort) {
      case 'featured':
         return [{ isFeatured: 'desc' as const }, { createdAt: 'desc' as const }]
      case 'price_high':
         return [{ basePrice: 'desc' as const }]
      case 'price_low':
         return [{ basePrice: 'asc' as const }]
      case 'newest':
         return [{ createdAt: 'desc' as const }]
      case 'name':
         return [{ name: 'asc' as const }]
      default:
         return [{ isFeatured: 'desc' as const }, { createdAt: 'desc' as const }]
   }
}

function getUseCaseLabel(useCase: UseCase): string {
   switch (useCase) {
      case 'MEDICAL':
         return 'Medis'
      case 'MANUFACTURING':
         return 'Manufaktur'
      case 'FOOD':
         return 'Makanan'
      case 'GENERAL':
         return 'Umum'
      default:
         return useCase
   }
}
