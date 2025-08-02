import { Button } from '@/components/ui/button'
import config from '@/config/site'
import Link from 'next/link'

export default function IndustryApplicationsSection() {
   return (
      <section className="py-20 bg-white dark:bg-gray-800">
         <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
               <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                     Aplikasi Industri
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                     Sarung tangan Gloopi telah dipercaya oleh berbagai industri di Indonesia 
                     untuk memberikan perlindungan optimal
                  </p>
               </div>

               <div className="space-y-16">
                  {config.industries.map((industry, index) => (
                     <div 
                        key={industry.slug}
                        className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
                     >
                        <div className="flex-1">
                           <div className="flex items-center gap-4 mb-6">
                              <div className="text-5xl">{industry.icon}</div>
                              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                 Industri {industry.name}
                              </h3>
                           </div>
                           
                           <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                              {industry.description}. Produk kami telah memenuhi standar ketat 
                              industri {industry.name.toLowerCase()} dan dipercaya oleh ratusan perusahaan.
                           </p>

                           <div className="grid grid-cols-2 gap-3 mb-8">
                              {industry.features.map((feature) => (
                                 <div key={feature} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                 </div>
                              ))}
                           </div>

                           <Link href={`/products?industry=${industry.slug}`}>
                              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                 Lihat Produk {industry.name}
                              </Button>
                           </Link>
                        </div>

                        <div className="flex-1">
                           <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8 h-80 flex items-center justify-center">
                              <div className="text-center">
                                 <div className="text-8xl mb-4 opacity-50">{industry.icon}</div>
                                 <p className="text-gray-600 dark:text-gray-300 font-medium">
                                    Gambar Produk {industry.name}
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
   )
}