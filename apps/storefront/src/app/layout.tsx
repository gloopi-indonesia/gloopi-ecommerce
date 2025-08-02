import { ModalProvider } from '@/providers/modal-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { ToastProvider } from '@/providers/toast-provider'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
   title: 'Gloopi - Sarung Tangan Industri Berkualitas Tinggi',
   description: 'Platform e-commerce terpercaya untuk sarung tangan industri berkualitas tinggi. Melayani sektor medis, manufaktur, dan makanan di seluruh Indonesia.',
   keywords: [
      'sarung tangan industri',
      'sarung tangan medis',
      'sarung tangan manufaktur', 
      'sarung tangan makanan',
      'gloves indonesia',
      'industrial gloves',
      'medical gloves',
      'food grade gloves',
      'gloopi'
   ],
   authors: [{ name: 'Gloopi Team' }],
   creator: 'Gloopi',
   publisher: 'Gloopi',
   openGraph: {
      title: 'Gloopi - Sarung Tangan Industri Berkualitas Tinggi',
      description: 'Platform e-commerce terpercaya untuk sarung tangan industri berkualitas tinggi. Melayani sektor medis, manufaktur, dan makanan di seluruh Indonesia.',
      url: 'https://gloopi.id',
      siteName: 'Gloopi',
      locale: 'id_ID',
      type: 'website',
   },
   twitter: {
      card: 'summary_large_image',
      title: 'Gloopi - Sarung Tangan Industri Berkualitas Tinggi',
      description: 'Platform e-commerce terpercaya untuk sarung tangan industri berkualitas tinggi.',
   },
   robots: {
      index: true,
      follow: true,
      googleBot: {
         index: true,
         follow: true,
         'max-video-preview': -1,
         'max-image-preview': 'large',
         'max-snippet': -1,
      },
   },
}

export default async function RootLayout({
   children,
}: {
   children: React.ReactNode
}) {
   return (
      <html lang="id">
         <body className={inter.className}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
               <ToastProvider />
               <ModalProvider />
               <Toaster position="top-right" />
               {children}
            </ThemeProvider>
         </body>
      </html>
   )
}
