import Carousel from '@/components/native/Carousel'
import prisma from '@/lib/prisma'

import { ChevronRightIcon } from 'lucide-react'
import type { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DataSection } from './components/data'

type Props = {
   params: { productId: string }
   searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
   { params }: Props,
   _parent: ResolvingMetadata
): Promise<Metadata> {
   const product = await prisma.product.findUnique({
      where: {
         id: params.productId,
      },
   })

   if (!product) {
      return {
         title: 'Produk Tidak Ditemukan',
         description: 'Produk yang Anda cari tidak ditemukan.',
      }
   }

   return {
      title: `${product.name} - Gloopi`,
      description: product.description || `${product.name} - Sarung tangan industri berkualitas tinggi`,
      openGraph: {
         title: product.name,
         description: product.description || `${product.name} - Sarung tangan industri berkualitas tinggi`,
         images: product.images.length > 0 ? [product.images[0]] : [],
      },
   }
}

export default async function ProductDetail({
   params,
}: {
   params: { productId: string }
}) {
   const product = await prisma.product.findUnique({
      where: {
         id: params.productId,
         isActive: true,
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
   })

   if (!product) {
      notFound()
   }

   return (
      <div className="container mx-auto px-4 py-8">
         <Breadcrumbs product={product} />
         <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ImageColumn product={product} />
            <DataSection product={product} />
         </div>
      </div>
   )
}

const ImageColumn = ({ product }: { product: any }) => {
   return (
      <div className="relative">
         {product.images && product.images.length > 0 ? (
            <Carousel images={product.images} />
         ) : (
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
               <span className="text-muted-foreground">Tidak ada gambar</span>
            </div>
         )}
      </div>
   )
}

const Breadcrumbs = ({ product }: { product: any }) => {
   const primaryCategory = product.categories[0]?.category

   return (
      <nav className="flex text-muted-foreground" aria-label="Breadcrumb">
         <ol className="inline-flex items-center gap-2 text-sm">
            <li className="inline-flex items-center">
               <Link
                  href="/"
                  className="inline-flex items-center font-medium hover:text-primary transition-colors"
               >
                  Beranda
               </Link>
            </li>
            <li>
               <div className="flex items-center gap-2">
                  <ChevronRightIcon className="h-4 w-4" />
                  <Link 
                     className="font-medium hover:text-primary transition-colors" 
                     href="/products"
                  >
                     Produk
                  </Link>
               </div>
            </li>
            {primaryCategory && (
               <li>
                  <div className="flex items-center gap-2">
                     <ChevronRightIcon className="h-4 w-4" />
                     <Link 
                        className="font-medium hover:text-primary transition-colors" 
                        href={`/products?category=${encodeURIComponent(primaryCategory.name)}`}
                     >
                        {primaryCategory.name}
                     </Link>
                  </div>
               </li>
            )}
            <li aria-current="page">
               <div className="flex items-center gap-2">
                  <ChevronRightIcon className="h-4 w-4" />
                  <span className="font-medium text-foreground">{product.name}</span>
               </div>
            </li>
         </ol>
      </nav>
   )
}
