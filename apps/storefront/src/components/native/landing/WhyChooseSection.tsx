import config from '@/config/site'

export default function WhyChooseSection() {
   return (
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
         <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
               <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                     Mengapa Memilih Gloopi?
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                     Kami memahami kebutuhan unik setiap industri dan berkomitmen memberikan 
                     solusi sarung tangan terbaik untuk bisnis Anda
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {config.whyChooseUs.map((reason, index) => (
                     <div 
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-gray-100 dark:border-gray-700"
                     >
                        <div className="text-4xl mb-4">{reason.icon}</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                           {reason.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                           {reason.description}
                        </p>
                     </div>
                  ))}
               </div>

               <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">1000+</div>
                        <p className="text-gray-600 dark:text-gray-300">Pelanggan Puas</p>
                     </div>
                     <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">50+</div>
                        <p className="text-gray-600 dark:text-gray-300">Varian Produk</p>
                     </div>
                     <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
                        <p className="text-gray-600 dark:text-gray-300">Customer Support</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}