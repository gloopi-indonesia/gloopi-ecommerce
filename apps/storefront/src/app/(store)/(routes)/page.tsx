import CTASection from '@/components/native/landing/CTASection'
import HeroSection from '@/components/native/landing/HeroSection'
import IndustryApplicationsSection from '@/components/native/landing/IndustryApplicationsSection'
import WhyChooseSection from '@/components/native/landing/WhyChooseSection'
import { ProductGrid, ProductSkeletonGrid } from '@/components/native/Product'
import { Heading } from '@/components/native/heading'
import prisma from '@/lib/prisma'
import { isVariableValid } from '@/lib/utils'

export default async function Index() {
   // Get featured products for display
   const featuredProducts = await prisma.product.findMany({
      where: {
         isActive: true,
         isFeatured: true,
      },
      include: {
         brand: true,
         categories: {
            include: {
               category: true,
            },
         },
         pricingTiers: {
            orderBy: {
               minQuantity: 'asc',
            },
         },
      },
      take: 8,
   })

   return (
      <div className="flex flex-col">
         {/* Hero Section */}
         <HeroSection />
         
         {/* Why Choose Gloopi Section */}
         <WhyChooseSection />
         
         {/* Industry Applications Section */}
         <IndustryApplicationsSection />
         
         {/* Featured Products Section */}
         <section className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
               <div className="max-w-6xl mx-auto">
                  <Heading
                     title="Produk Unggulan"
                     description="Pilihan terbaik sarung tangan industri yang paling diminati pelanggan kami"
                  />
                  {isVariableValid(featuredProducts) ? (
                     <ProductGrid products={featuredProducts} />
                  ) : (
                     <ProductSkeletonGrid />
                  )}
                  
                  <div className="text-center mt-12">
                     <a 
                        href="/products"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                     >
                        Lihat Semua Produk
                     </a>
                  </div>
               </div>
            </div>
         </section>
         
         {/* Call to Action Section */}
         <CTASection />
      </div>
   )
}
