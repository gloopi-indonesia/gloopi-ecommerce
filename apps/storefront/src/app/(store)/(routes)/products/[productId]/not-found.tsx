import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'

export default function ProductNotFound() {
   return (
      <div className="container mx-auto px-4 py-16">
         <div className="max-w-md mx-auto">
            <Card>
               <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                     <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-xl">Produk Tidak Ditemukan</CardTitle>
               </CardHeader>
               <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                     Maaf, produk yang Anda cari tidak ditemukan atau mungkin sudah tidak tersedia.
                  </p>
                  
                  <div className="space-y-2">
                     <Link href="/products">
                        <Button className="w-full">
                           <Search className="h-4 w-4 mr-2" />
                           Lihat Semua Produk
                        </Button>
                     </Link>
                     
                     <Link href="/">
                        <Button variant="outline" className="w-full">
                           <ArrowLeft className="h-4 w-4 mr-2" />
                           Kembali ke Beranda
                        </Button>
                     </Link>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   )
}