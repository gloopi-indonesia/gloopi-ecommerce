'use client'

import { Separator } from '@/components/native/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

import { isVariableValid } from '@/lib/utils'
import { useCartContext } from '@/state/Cart'
import Link from 'next/link'

export function Receipt() {
   const { loading, cart } = useCartContext()

   function formatIDR(amount: number) {
      return new Intl.NumberFormat('id-ID', {
         style: 'currency',
         currency: 'IDR',
         minimumFractionDigits: 0,
      }).format(amount / 100) // Convert from cents
   }

   function calculatePayableCost() {
      let totalAmount = 0,
         discountAmount = 0

      if (isVariableValid(cart?.items)) {
         for (const item of cart.items) {
            const quantity = item?.quantity || item?.count || 0
            const price = item?.product?.basePrice || item?.product?.price || 0
            totalAmount += quantity * price
            discountAmount += quantity * (item?.product?.discount || 0)
         }
      }

      const afterDiscountAmount = totalAmount - discountAmount
      const taxAmount = afterDiscountAmount * 0.11 // 11% PPN for Indonesia
      const payableAmount = afterDiscountAmount + taxAmount

      return {
         totalAmount,
         discountAmount,
         afterDiscountAmount,
         taxAmount,
         payableAmount,
      }
   }

   return (
      <Card className={loading && 'animate-pulse'}>
         <CardHeader className="p-4 pb-0">
            <h2 className="font-bold tracking-tight">Receipt</h2>
         </CardHeader>
         <CardContent className="p-4 text-sm">
            <div className="block space-y-[1vh]">
               <div className="flex justify-between">
                  <p>Subtotal</p>
                  <h3>{formatIDR(calculatePayableCost().totalAmount)}</h3>
               </div>
               <div className="flex justify-between">
                  <p>Diskon</p>
                  <h3>{formatIDR(calculatePayableCost().discountAmount)}</h3>
               </div>
               <div className="flex justify-between">
                  <p>PPN (11%)</p>
                  <h3>{formatIDR(calculatePayableCost().taxAmount)}</h3>
               </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between">
               <p>Total Estimasi</p>
               <h3>{formatIDR(calculatePayableCost().payableAmount)}</h3>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
               * Harga final akan dikonfirmasi dalam penawaran resmi
            </div>
         </CardContent>
         <Separator />
         <CardFooter>
            <Link
               href="/checkout"
               className="w-full"
            >
               <Button
                  disabled={
                     !isVariableValid(cart?.items) || cart?.items?.length === 0
                  }
                  className="w-full"
               >
                  Minta Penawaran
               </Button>
            </Link>
         </CardFooter>
      </Card>
   )
}
