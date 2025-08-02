import { ImageSkeleton } from '@/components/native/icons'
import { Badge } from '@/components/ui/badge'
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
} from '@/components/ui/card'
import { formatIDR, formatPriceRange } from '@/lib/utils/currency'
import { ProductWithIncludes } from '@/types/prisma'
import { UseCase } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'

export const ProductGrid = ({
   products,
}: {
   products: ProductWithIncludes[]
}) => {
   return (
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
         {products.map((product) => (
            <Product product={product} key={product.id} />
         ))}
      </div>
   )
}

export const ProductSkeletonGrid = () => {
   return (
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
         {[...Array(12)].map((_, index) => (
            <ProductSkeleton key={index} />
         ))}
      </div>
   )
}

export const Product = ({ product }: { product: ProductWithIncludes }) => {
   const getUseCaseBadgeColor = (useCase: UseCase) => {
      switch (useCase) {
         case 'MEDICAL':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
         case 'MANUFACTURING':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
         case 'FOOD':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
         case 'GENERAL':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
         default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      }
   }

   const getUseCaseLabel = (useCase: UseCase) => {
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

   const displayPrice = () => {
      if (product.pricingTiers && product.pricingTiers.length > 0) {
         // Show price range if multiple tiers exist
         if (product.pricingTiers.length > 1) {
            const minPrice = Math.min(...product.pricingTiers.map(tier => tier.pricePerUnit))
            const maxPrice = Math.max(...product.pricingTiers.map(tier => tier.pricePerUnit))
            return formatPriceRange(minPrice, maxPrice)
         } else {
            // Single tier, show that price
            return formatIDR(product.pricingTiers[0].pricePerUnit)
         }
      } else {
         // Fallback to base price
         return formatIDR(product.basePrice)
      }
   }

   const primaryCategory = product.categories[0]?.category

   return (
      <Link href={`/products/${product.id}`} className="group">
         <Card className="h-full transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1">
            <CardHeader className="p-0">
               <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  {product.images && product.images.length > 0 ? (
                     <Image
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                     />
                  ) : (
                     <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <ImageSkeleton />
                     </div>
                  )}
                  
                  {/* Use Case Badge */}
                  <div className="absolute top-2 left-2">
                     <Badge 
                        variant="secondary" 
                        className={`text-xs ${getUseCaseBadgeColor(product.useCase)}`}
                     >
                        {getUseCaseLabel(product.useCase)}
                     </Badge>
                  </div>

                  {/* Featured Badge */}
                  {product.isFeatured && (
                     <div className="absolute top-2 right-2">
                        <Badge variant="default" className="text-xs bg-yellow-500 text-yellow-900">
                           Unggulan
                        </Badge>
                     </div>
                  )}
               </div>
            </CardHeader>
            
            <CardContent className="p-4 flex-1">
               <div className="space-y-2">
                  {/* Brand */}
                  <div className="text-xs text-muted-foreground font-medium">
                     {product.brand.name}
                  </div>

                  {/* Product Name */}
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                     {product.name}
                  </h3>

                  {/* Category */}
                  {primaryCategory && (
                     <Badge variant="outline" className="text-xs">
                        {primaryCategory.name}
                     </Badge>
                  )}

                  {/* Description */}
                  {product.description && (
                     <p className="text-xs text-muted-foreground line-clamp-2">
                        {product.description}
                     </p>
                  )}
               </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0">
               <div className="w-full flex items-center justify-between">
                  {/* Price */}
                  <div className="font-semibold text-primary">
                     {displayPrice()}
                  </div>

                  {/* Stock Status */}
                  <div className="text-xs">
                     {product.stock > 0 ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                           Tersedia
                        </Badge>
                     ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                           Habis
                        </Badge>
                     )}
                  </div>
               </div>
            </CardFooter>
         </Card>
      </Link>
   )
}

export function ProductSkeleton() {
   return (
      <div className="animate-pulse">
         <Card className="h-full">
            <CardHeader className="p-0">
               <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
            </CardHeader>
            <CardContent className="p-4">
               <div className="space-y-2">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
               </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
               <div className="w-full flex items-center justify-between">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
               </div>
            </CardFooter>
         </Card>
      </div>
   )
}
