import { Button } from '@/components/ui/button'
import config from '@/config/site'
import Link from 'next/link'

export default function CTASection() {
   return (
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900">
         <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Siap Memulai Kerjasama dengan Gloopi?
               </h2>
               
               <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Dapatkan penawaran khusus untuk pembelian dalam jumlah besar. 
                  Tim kami siap membantu Anda menemukan solusi sarung tangan yang tepat.
               </p>

               <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                  <Link href="/products">
                     <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-3">
                        Jelajahi Katalog
                     </Button>
                  </Link>
                  <Link href={config.links.whatsapp} target="_blank">
                     <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                        Hubungi Kami
                     </Button>
                  </Link>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                     <h4 className="text-lg font-semibold text-white mb-2">Konsultasi Gratis</h4>
                     <p className="text-blue-100 text-sm">
                        Tim ahli kami siap membantu memilih produk yang tepat
                     </p>
                  </div>
                  <div>
                     <h4 className="text-lg font-semibold text-white mb-2">Harga Kompetitif</h4>
                     <p className="text-blue-100 text-sm">
                        Dapatkan harga terbaik untuk pembelian dalam jumlah besar
                     </p>
                  </div>
                  <div>
                     <h4 className="text-lg font-semibold text-white mb-2">Pengiriman Cepat</h4>
                     <p className="text-blue-100 text-sm">
                        Pengiriman ke seluruh Indonesia dengan tracking lengkap
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}