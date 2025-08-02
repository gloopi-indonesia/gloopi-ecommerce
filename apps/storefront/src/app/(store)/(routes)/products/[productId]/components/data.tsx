import { Separator } from '@/components/native/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatIDR } from '@/lib/utils/currency'
import type { ProductDetailWithIncludes } from '@/types/prisma'
import { UseCase } from '@prisma/client'
import { Package, Shield, Truck } from 'lucide-react'
import Link from 'next/link'

import CartButton from './cart_button'

export const DataSection = ({
   product,
}: {
   product: ProductDetailWithIncludes
}) => {
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

   const getUseCaseColor = (useCase: UseCase) => {
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

   return (
      <div className="space-y-6">
         {/* Product Header */}
         <div>
            <div className="flex items-center gap-2 mb-2">
               <Badge variant="outline" className="text-xs">
                  {product.brand.name}
               </Badge>
               <Badge className={`text-xs ${getUseCaseColor(product.useCase)}`}>
                  {getUseCaseLabel(product.useCase)}
               </Badge>
               {product.isFeatured && (
                  <Badge variant="default" className="text-xs bg-yellow-500 text-yellow-900">
                     Unggulan
                  </Badge>
               )}
            </div>
            
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
               <span>SKU: {product.sku}</span>
               <span className={`flex items-center gap-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <Package className="h-4 w-4" />
                  {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
               </span>
            </div>

            {product.description && (
               <p className="text-muted-foreground leading-relaxed">
                  {product.description}
               </p>
            )}
         </div>

         <Separator />

         {/* Categories */}
         {product.categories.length > 0 && (
            <div>
               <h3 className="font-semibold mb-2">Kategori</h3>
               <div className="flex flex-wrap gap-2">
                  {product.categories.map(({ category }) => (
                     <Link 
                        key={category.id} 
                        href={`/products?category=${encodeURIComponent(category.name)}`}
                     >
                        <Badge variant="outline" className="hover:bg-accent transition-colors">
                           {category.name}
                        </Badge>
                     </Link>
                  ))}
               </div>
            </div>
         )}

         {/* Specifications */}
         {product.specifications && (
            <Card>
               <CardHeader>
                  <CardTitle className="text-lg">Spesifikasi</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                     {Object.entries(product.specifications as Record<string, any>).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                           <span className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                           </span>
                           <span className="text-muted-foreground">{String(value)}</span>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         )}

         {/* Pricing Tiers */}
         {product.pricingTiers.length > 0 && (
            <Card>
               <CardHeader>
                  <CardTitle className="text-lg">Harga Berdasarkan Kuantitas</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-3">
                     {product.pricingTiers.map((tier) => (
                        <div key={tier.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                           <div>
                              <span className="font-medium">
                                 {tier.minQuantity} - {tier.maxQuantity || '∞'} pcs
                              </span>
                           </div>
                           <div className="text-right">
                              <div className="font-bold text-primary">
                                 {formatIDR(tier.pricePerUnit)}
                              </div>
                              <div className="text-xs text-muted-foreground">per pcs</div>
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         )}

         {/* Base Price Fallback */}
         {product.pricingTiers.length === 0 && (
            <Card>
               <CardHeader>
                  <CardTitle className="text-lg">Harga</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold text-primary">
                     {formatIDR(product.basePrice)}
                  </div>
                  <div className="text-sm text-muted-foreground">per pcs</div>
               </CardContent>
            </Card>
         )}

         {/* Action Buttons */}
         <div className="space-y-4">
            <CartButton product={product} />
            
            {/* Additional Info */}
            <div className="grid grid-cols-1 gap-3 text-sm">
               <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Produk berkualitas tinggi dengan standar industri</span>
               </div>
               <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>Pengiriman ke seluruh Indonesia</span>
               </div>
            </div>
         </div>
      </div>
   )
}
