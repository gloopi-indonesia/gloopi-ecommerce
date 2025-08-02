const config = {
   name: 'Gloopi',
   handle: '@gloopi_id',
   url: 'https://gloopi.id',
   ogImage:
      'https://og-image.vercel.app/Gloopi.png?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-black.svg',
   description:
      'Platform e-commerce sarung tangan industri berkualitas tinggi untuk sektor medis, manufaktur, dan makanan di Indonesia.',
   tagline: 'Sarung Tangan Industri Berkualitas Tinggi',
   industries: [
      {
         name: 'Medis',
         slug: 'medical',
         description: 'Sarung tangan steril dan non-steril untuk fasilitas kesehatan',
         icon: '🏥',
         features: ['Steril', 'Hypoallergenic', 'Powder-free', 'Disposable']
      },
      {
         name: 'Manufaktur',
         slug: 'manufacturing', 
         description: 'Perlindungan tangan untuk industri manufaktur dan konstruksi',
         icon: '🏭',
         features: ['Tahan Bahan Kimia', 'Anti-Slip', 'Tahan Lama', 'Berbagai Ukuran']
      },
      {
         name: 'Makanan',
         slug: 'food',
         description: 'Sarung tangan food-grade untuk industri makanan dan minuman',
         icon: '🍽️',
         features: ['Food-Safe', 'Disposable', 'Tekstur Grip', 'Bebas Kontaminasi']
      }
   ],
   whyChooseUs: [
      {
         title: 'Kualitas Terjamin',
         description: 'Produk berkualitas tinggi dengan sertifikasi internasional',
         icon: '✅'
      },
      {
         title: 'Harga Kompetitif',
         description: 'Harga terbaik untuk pembelian dalam jumlah besar',
         icon: '💰'
      },
      {
         title: 'Pengiriman Cepat',
         description: 'Pengiriman ke seluruh Indonesia dengan tracking lengkap',
         icon: '🚚'
      },
      {
         title: 'Layanan Profesional',
         description: 'Tim customer service yang siap membantu kebutuhan Anda',
         icon: '🤝'
      }
   ],
   links: {
      whatsapp: 'https://wa.me/6281234567890',
      email: 'info@gloopi.id',
      phone: '+62-812-3456-7890'
   },
}

export default config
