'use client'

import { PORequestForm } from './components/po-request-form'
import { CartContextProvider } from '@/state/Cart'
import { Heading } from '@/components/native/heading'

const PORequestPage = () => {
   return (
      <CartContextProvider>
         <div className="min-h-screen py-12">
            <div className="container mx-auto p-4">
               <Heading
                  title="Permintaan Penawaran Harga"
                  description="Lengkapi formulir di bawah ini untuk mendapatkan penawaran harga dari produk yang Anda pilih."
               />
               <PORequestForm />
            </div>
         </div>
      </CartContextProvider>
   )
}

export default PORequestPage
