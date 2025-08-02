import { NavItem } from '@/types/nav'

interface DocsConfig {
   mainNav: NavItem[]
   sidebarNav: NavItem[]
}

export const docsConfig: DocsConfig = {
   mainNav: [
      {
         title: 'Semua Produk',
         href: '/products',
      },
      {
         title: 'Tentang Kami',
         href: '/about',
      },
      {
         title: 'Kontak',
         href: '/contact',
      },
   ],
   sidebarNav: [
      {
         title: 'Industri',
         items: [
            {
               title: '🏥 Medis',
               href: '/products?industry=medical',
            },
            {
               title: '🏭 Manufaktur',
               href: '/products?industry=manufacturing',
            },
            {
               title: '🍽️ Makanan',
               href: '/products?industry=food',
            },
         ],
      },
      {
         title: 'Akun Saya',
         items: [
            {
               title: 'Pesanan',
               href: '/profile/orders',
            },
            {
               title: 'Faktur',
               href: '/profile/invoices',
            },
            {
               title: 'Profil',
               href: '/profile',
            },
         ],
      },
      {
         title: 'Bantuan',
         items: [
            {
               title: 'FAQ',
               href: '/faq',
            },
            {
               title: 'Cara Pemesanan',
               href: '/how-to-order',
            },
            {
               title: 'Hubungi Kami',
               href: '/contact',
            },
         ],
      },
   ],
}
