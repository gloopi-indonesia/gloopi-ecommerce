'use client'

import { Spinner } from '@/components/native/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { getCountInCart, getLocalCart } from '@/lib/cart'
import { formatIDR, getBestPrice } from '@/lib/utils/currency'
import { CartContextProvider, useCartContext } from '@/state/Cart'
import { ProductDetailWithIncludes } from '@/types/prisma'
import { MinusIcon, PlusIcon, ShoppingCartIcon } from 'lucide-react'
import { useState } from 'react'

export default function CartButton({ product }: { product: ProductDetailWithIncludes }) {
   return (
      <CartContextProvider>
         <ButtonComponent product={product} />
      </CartContextProvider>
   )
}

export function ButtonComponent({ product }: { product: ProductDetailWithIncludes }) {
   const { authenticated } = useAuthenticated()
   const { cart, dispatchCart } = useCartContext()
   const [quantity, setQuantity] = useState(1)
   const [fetchingCart, setFetchingCart] = useState(false)

   // Calculate price based on quantity
   const unitPrice = product.pricingTiers.length > 0 
      ? getBestPrice(product.pricingTiers, quantity)
      : product.basePrice
   
   const totalPrice = unitPrice * quantity

   function findLocalCartIndexById(array: any[], productId: string) {
      for (let i = 0; i < array.length; i++) {
         if (array[i]?.productId === productId) {
            return i
         }
      }
      return -1
   }

   async function onAddToCart() {
      if (product.stock <= 0) return

      try {
         setFetchingCart(true)

         if (authenticated) {
            const response = await fetch(`/api/cart`, {
               method: 'POST',
               body: JSON.stringify({
                  productId: product.id,
                  quantity: quantity,
               }),
               cache: 'no-store',
               headers: {
                  'Content-Type': 'application/json',
               },
            })

            if (response.ok) {
               const json = await response.json()
               dispatchCart(json)
            }
         } else {
            // Handle local cart for non-authenticated users
            const localCart = getLocalCart() as any
            const existingItemIndex = findLocalCartIndexById(localCart.items || [], product.id)

            if (existingItemIndex >= 0) {
               localCart.items[existingItemIndex].quantity += quantity
            } else {
               localCart.items = localCart.items || []
               localCart.items.push({
                  productId: product.id,
                  product,
                  quantity: quantity,
               })
            }

            dispatchCart(localCart)
         }

         setFetchingCart(false)
      } catch (error) {
         console.error('Error adding to cart:', error)
         setFetchingCart(false)
      }
   }

   const handleQuantityChange = (newQuantity: number) => {
      if (newQuantity >= 1 && newQuantity <= product.stock) {
         setQuantity(newQuantity)
      }
   }

   const currentCartCount = getCountInCart({
      cartItems: cart?.items,
      productId: product.id,
   })

   if (fetchingCart) {
      return (
         <Button disabled className="w-full">
            <Spinner />
            Menambahkan...
         </Button>
      )
   }

   return (
      <div className="space-y-4">
         {/* Quantity Selector */}
         <div className="space-y-2">
            <Label htmlFor="quantity">Kuantitas</Label>
            <div className="flex items-center gap-2">
               <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
               >
                  <MinusIcon className="h-4 w-4" />
               </Button>
               
               <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
               />
               
               <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
               >
                  <PlusIcon className="h-4 w-4" />
               </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
               Maksimal: {product.stock} pcs
               {currentCartCount > 0 && (
                  <span className="ml-2">• Di keranjang: {currentCartCount} pcs</span>
               )}
            </div>
         </div>

         {/* Price Display */}
         <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center">
               <span className="text-sm">Harga per unit:</span>
               <span className="font-semibold">{formatIDR(unitPrice)}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
               <span className="text-sm">Total ({quantity} pcs):</span>
               <span className="font-bold text-lg text-primary">{formatIDR(totalPrice)}</span>
            </div>
         </div>

         {/* Add to Cart Button */}
         <Button 
            onClick={onAddToCart} 
            disabled={product.stock <= 0 || fetchingCart}
            className="w-full"
            size="lg"
         >
            <ShoppingCartIcon className="h-4 w-4 mr-2" />
            {product.stock <= 0 
               ? 'Stok Habis' 
               : 'Tambah ke Keranjang'
            }
         </Button>

         {/* Additional Info */}
         <div className="text-xs text-muted-foreground space-y-1">
            <p>• Harga dapat berubah berdasarkan kuantitas pemesanan</p>
            <p>• Untuk pemesanan dalam jumlah besar, hubungi tim sales kami</p>
         </div>
      </div>
   )
}
