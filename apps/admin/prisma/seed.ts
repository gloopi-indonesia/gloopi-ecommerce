import { PrismaClient } from '@prisma/client'

function getRandomFloat(min, max, precision) {
   if (min >= max || precision < 0) {
      throw new Error(
         'Invalid input: min should be less than max and precision should be non-negative.'
      )
   }

   const range = max - min
   const randomValue = Math.random() * range + min

   return parseFloat(randomValue.toFixed(precision))
}

function getRandomIntInRange(min: number, max: number) {
   return Math.floor(Math.random() * (max - min) + min)
}

function getRandomDate(start, end) {
   return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
   )
}

function getRandomBoolean() {
   return getRandomIntInRange(0, 2) == 0 ? false : true
}

const prisma = new PrismaClient()

async function main() {
   let createdProducts = [],
      createdProviders = []

   const providers = ['Parsian', 'Pasargad', 'Dey']

   const owners = ['admin@gloopi.id']

   const categories = [
      'Sarung Tangan Medis',
      'Sarung Tangan Industri',
      'Sarung Tangan Food Service',
      'Sarung Tangan Konstruksi',
      'Sarung Tangan Kimia',
      'Sarung Tangan Disposable',
      'Sarung Tangan Safety',
   ]

   const products = [
      {
         title: 'Sarung Tangan Nitrile Medis Premium',
         brand: 'MedSafe',
         categories: ['Sarung Tangan Medis'],
         keywords: ['nitrile', 'medical', 'disposable', 'powder-free', 'examination'],
         price: 85000,
         images: ['https://images.unsplash.com/photo-1584515933487-779824d29309?w=500'],
      },
      {
         title: 'Sarung Tangan Latex Examination',
         brand: 'HealthGuard',
         categories: ['Sarung Tangan Medis'],
         keywords: ['latex', 'medical', 'examination', 'sterile', 'hospital'],
         price: 75000,
         images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500'],
      },
      {
         title: 'Sarung Tangan Vinyl Food Grade',
         brand: 'FoodSafe',
         categories: ['Sarung Tangan Food Service'],
         keywords: ['vinyl', 'food', 'restaurant', 'kitchen', 'hygiene'],
         price: 45000,
         images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500'],
      },
      {
         title: 'Sarung Tangan Kulit Konstruksi Heavy Duty',
         brand: 'BuildStrong',
         categories: ['Sarung Tangan Konstruksi'],
         keywords: ['leather', 'construction', 'heavy-duty', 'protection', 'work'],
         price: 125000,
         images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500'],
      },
      {
         title: 'Sarung Tangan Cut Resistant Level 5',
         brand: 'SafetyPro',
         categories: ['Sarung Tangan Safety'],
         keywords: ['cut-resistant', 'safety', 'industrial', 'protection', 'ANSI'],
         price: 150000,
         images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500'],
      },
      {
         title: 'Sarung Tangan Kimia Neoprene',
         brand: 'ChemGuard',
         categories: ['Sarung Tangan Kimia'],
         keywords: ['neoprene', 'chemical', 'resistant', 'laboratory', 'industrial'],
         price: 180000,
         images: ['https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500'],
      },
      {
         title: 'Sarung Tangan Mekanik Anti-Slip',
         brand: 'MechPro',
         categories: ['Sarung Tangan Industri'],
         keywords: ['mechanic', 'anti-slip', 'grip', 'automotive', 'workshop'],
         price: 95000,
         images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500'],
      },
      {
         title: 'Sarung Tangan Disposable PE',
         brand: 'EcoSafe',
         categories: ['Sarung Tangan Disposable'],
         keywords: ['disposable', 'PE', 'polyethylene', 'food-handling', 'economical'],
         price: 25000,
         images: ['https://images.unsplash.com/photo-1584515933487-779824d29309?w=500'],
      },
      {
         title: 'Sarung Tangan Welding Heat Resistant',
         brand: 'WeldMaster',
         categories: ['Sarung Tangan Industri'],
         keywords: ['welding', 'heat-resistant', 'leather', 'industrial', 'protection'],
         price: 165000,
         images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500'],
      },
      {
         title: 'Sarung Tangan Surgical Sterile',
         brand: 'SterileMax',
         categories: ['Sarung Tangan Medis'],
         keywords: ['surgical', 'sterile', 'latex', 'powdered', 'medical'],
         price: 120000,
         images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500'],
      },
   ]

   const blogPosts = [
      {
         slug: 'panduan-memilih-sarung-tangan-medis',
         title: 'Panduan Lengkap Memilih Sarung Tangan Medis yang Tepat',
         description: 'Tips memilih sarung tangan medis berkualitas untuk berbagai kebutuhan medis...',
         image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800',
         categories: ['medical', 'safety', 'healthcare'],
         content:
            "Memilih sarung tangan medis yang tepat sangat penting untuk keselamatan pasien dan tenaga medis. Dalam artikel ini, kami akan membahas berbagai jenis sarung tangan medis dan kegunaannya. <MDXImage alt='Sarung Tangan Medis' src='https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500' /> Sarung tangan nitrile menjadi pilihan utama karena tahan terhadap bahan kimia dan tidak menyebabkan alergi latex. Untuk prosedur bedah, sarung tangan latex steril masih menjadi standar emas karena memberikan sensitivitas sentuhan yang optimal. Sarung tangan vinyl cocok untuk pemeriksaan rutin yang tidak memerlukan kontak dengan cairan tubuh. Pastikan memilih sarung tangan yang sesuai dengan standar FDA dan memiliki sertifikasi ISO untuk menjamin kualitas dan keamanan.",
      },
      {
         slug: 'keselamatan-kerja-industri-konstruksi',
         title: 'Pentingnya Sarung Tangan Safety dalam Industri Konstruksi',
         description: 'Mengapa sarung tangan safety wajib digunakan di lokasi konstruksi...',
         image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
         categories: ['construction', 'safety', 'industrial'],
         content:
            "Keselamatan kerja di industri konstruksi tidak bisa diabaikan, terutama perlindungan tangan yang rentan terhadap cedera. Sarung tangan safety dengan rating cut-resistant level 5 memberikan perlindungan maksimal terhadap benda tajam. <MDXImage alt='Sarung Tangan Konstruksi' src='https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500' /> Sarung tangan kulit heavy-duty cocok untuk pekerjaan yang melibatkan material kasar dan panas. Untuk pekerjaan welding, gunakan sarung tangan khusus yang tahan panas hingga 500°C. Pastikan sarung tangan memiliki sertifikasi ANSI dan EN untuk memenuhi standar keselamatan internasional. Investasi pada sarung tangan berkualitas dapat mencegah kecelakaan kerja dan meningkatkan produktivitas.",
      },
      {
         slug: 'hygiene-food-service-industry',
         title: 'Standar Hygiene dengan Sarung Tangan Food Grade',
         description:
            'Menjaga kebersihan makanan dengan sarung tangan food grade yang tepat...',
         image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
         categories: ['food-service', 'hygiene', 'restaurant'],
         content:
            "Industri food service memerlukan standar hygiene yang ketat untuk mencegah kontaminasi makanan. Sarung tangan vinyl dan nitrile food grade menjadi pilihan utama karena tidak mengandung bahan berbahaya. <MDXImage alt='Sarung Tangan Food Service' src='https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500' /> Sarung tangan PE disposable cocok untuk handling makanan ringan dan ekonomis untuk penggunaan sekali pakai. Penting untuk mengganti sarung tangan secara berkala dan tidak menggunakan kembali sarung tangan disposable. Pastikan sarung tangan memiliki sertifikasi FDA food contact dan bebas dari powder yang dapat mencemari makanan. Training proper glove usage juga penting untuk memastikan efektivitas penggunaan.",
      },
   ]

   const banners = [
      {
         image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=1600&h=400&fit=crop',
         label: 'Sarung Tangan Medis Premium - Perlindungan Terbaik untuk Tenaga Kesehatan',
      },
      {
         image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=400&fit=crop',
         label: 'Sarung Tangan Konstruksi Heavy Duty - Keamanan Maksimal di Lokasi Kerja',
      },
      {
         image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&h=400&fit=crop',
         label: 'Sarung Tangan Food Grade - Jaga Hygiene Makanan Anda',
      },
      {
         image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1600&h=400&fit=crop',
         label: 'Sarung Tangan Industrial Safety - Solusi Lengkap Keselamatan Kerja',
      },
   ]

   try {
      for (const banner of banners) {
         const { image, label } = banner

         await prisma.banner.create({
            data: {
               image,
               label,
            },
         })
      }

      console.log('Created Banners...')
   } catch (error) {
      console.error('Could not create banners...')
   }

   try {
      for (const owner of owners) {
         await prisma.owner.create({
            data: {
               email: owner,
            },
         })
      }

      console.log('Created Owners...')
   } catch (error) {
      console.error('Could not create owners...')
   }

   try {
      for (const category of categories) {
         await prisma.category.create({
            data: {
               title: category,
            },
         })
      }

      console.log('Created Categories...')
   } catch (error) {
      console.error('Could not create Categories...')
   }

   try {
      for (const product of products) {
         const createdProduct = await prisma.product.create({
            data: {
               isAvailable: getRandomBoolean(),
               title: product.title,
               price: getRandomFloat(25000, 180000, 0),
               stock: getRandomIntInRange(1, 20),
               discount: getRandomIntInRange(1, 15),
               brand: {
                  connectOrCreate: {
                     where: {
                        title: product.brand,
                     },
                     create: {
                        title: product.brand,
                        description: 'Description of this brand.',
                        logo: 'https://cdn.logojoy.com/wp-content/uploads/20221122125557/morridge-coffee-vintage-logo-600x392.png',
                     },
                  },
               },
               description: 'Description of this product.',
               images: product.images,
               keywords: product.keywords,
               categories: {
                  connect: {
                     title: product.categories[0],
                  },
               },
            },
            include: {
               categories: true,
            },
         })

         createdProducts.push(createdProduct)
      }

      console.log('Created Products...')
   } catch (error) {
      console.error('Could not create products...')
   }

   try {
      await prisma.author.create({
         data: {
            name: 'Dr. Safety Expert',
            email: 'expert@gloopi.id',
            blogs: {
               create: blogPosts,
            },
         },
      })

      console.log('Created Authors...')
   } catch (error) {
      console.error('Could not create authors...')
   }

   const user = await prisma.user.create({
      data: {
         email: 'customer@gloopi.id',
         name: 'Customer Gloopi',
         cart: {
            create: {},
         },
         wishlist: {
            connect: {
               id: createdProducts[
                  getRandomIntInRange(0, createdProducts.length - 1)
               ]['id'],
            },
         },
      },
   })

   console.log('Created Users...')

   for (const provider of providers) {
      const createdProvider = await prisma.paymentProvider.create({
         data: {
            title: provider,
         },
      })

      createdProviders.push(createdProvider)
   }

   console.log('Created Providers...')

   for (let i = 0; i < 10; i++) {
      const order = await prisma.order.create({
         data: {
            createdAt: getRandomDate(new Date(2023, 2, 27), new Date()),
            payable: getRandomFloat(50000, 200000, 0),
            discount: getRandomFloat(5000, 25000, 0),
            shipping: getRandomFloat(10000, 25000, 0),
            status: 'Processing',
            user: { connect: { id: user.id } },
            isPaid: true,
            payments: {
               create: {
                  status: 'Processing',
                  isSuccessful: true,
                  payable: getRandomFloat(50000, 200000, 0),
                  refId: getRandomFloat(1000, 9999, 0).toString(),
                  user: {
                     connect: { id: user.id },
                  },
                  provider: {
                     connect: {
                        id: createdProviders[
                           getRandomIntInRange(0, createdProviders.length - 1)
                        ].id,
                     },
                  },
               },
            },
            orderItems: {
               create: {
                  productId:
                     createdProducts[
                        getRandomIntInRange(0, createdProducts.length - 1)
                     ]?.id,
                  count: 1,
                  price: createdProducts[
                     getRandomIntInRange(0, createdProducts.length - 1)
                  ].price,
                  discount: 0,
               },
            },
         },
      })
   }

   console.log('Created Orders...')
}

try {
   main()
   prisma.$disconnect()
} catch (error) {
   console.error(error)
   process.exit(1)
}
