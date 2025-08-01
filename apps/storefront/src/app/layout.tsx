import { ModalProvider } from '@/providers/modal-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { ToastProvider } from '@/providers/toast-provider'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
   title: 'Gloopi - Sarung Tangan Industri',
   description: 'Platform e-commerce untuk sarung tangan industri berkualitas tinggi',
   keywords: ['sarung tangan', 'industri', 'medis', 'manufaktur', 'makanan'],
   authors: [{ name: 'Gloopi Team' }],
   creator: 'Gloopi',
   publisher: 'Gloopi',
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
