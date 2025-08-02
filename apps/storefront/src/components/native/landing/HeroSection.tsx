import { Button } from '@/components/ui/button'
import config from '@/config/site'
import Link from 'next/link'

export default function HeroSection() {
   return (
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950 dark:via-gray-900 dark:to-blue-950 py-20 md:py-32">
         <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
               <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                  <span className="text-blue-600 dark:text-blue-400">Gloopi</span>
                  <br />
                  {config.tagline}
               </h1>
               
               <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Solusi terpercaya untuk kebutuhan sarung tangan industri di sektor 
                  <span className="font-semibold text-blue-600 dark:text-blue-400"> medis</span>, 
                  <span className="font-semibold text-green-600 dark:text-green-400"> manufaktur</span>, dan 
                  <span className="font-semibold text-orange-600 dark:text-orange-400"> makanan</span>
               </p>

               <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                  <Link href="/products">
                     <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-3">
                        Lihat Katalog Produk
                     </Button>
                  </Link>
                  <Link href={config.links.whatsapp} target="_blank">
                     <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-3">
                        Konsultasi WhatsApp
                     </Button>
                  </Link>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                  {config.industries.map((industry) => (
                     <Link 
                        key={industry.slug}
                        href={`/products?industry=${industry.slug}`}
                        className="group"
                     >
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-gray-100 dark:border-gray-700">
                           <div className="text-4xl mb-4">{industry.icon}</div>
                           <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              {industry.name}
                           </h3>
                           <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                              {industry.description}
                           </p>
                           <div className="flex flex-wrap gap-2">
                              {industry.features.slice(0, 2).map((feature) => (
                                 <span 
                                    key={feature}
                                    className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full"
                                 >
                                    {feature}
                                 </span>
                              ))}
                           </div>
                        </div>
                     </Link>
                  ))}
               </div>
            </div>
         </div>
      </section>
   )
}