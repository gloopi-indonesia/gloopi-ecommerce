import { PrismaClient, UseCase, Industry } from '@prisma/client'

const prisma = new PrismaClient()

async function seedProducts() {
  console.log('🌱 Seeding products, brands, and categories...')

  // Create brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { name: 'Ansell' },
      update: {},
      create: {
        name: 'Ansell',
        description: 'Leading manufacturer of protective gloves and safety solutions',
        logo: 'https://example.com/ansell-logo.png',
        isActive: true
      }
    }),
    prisma.brand.upsert({
      where: { name: 'Kimberly-Clark' },
      update: {},
      create: {
        name: 'Kimberly-Clark',
        description: 'Healthcare and hygiene products manufacturer',
        logo: 'https://example.com/kimberly-clark-logo.png',
        isActive: true
      }
    }),
    prisma.brand.upsert({
      where: { name: 'Top Glove' },
      update: {},
      create: {
        name: 'Top Glove',
        description: 'World\'s largest rubber glove manufacturer',
        logo: 'https://example.com/top-glove-logo.png',
        isActive: true
      }
    }),
    prisma.brand.upsert({
      where: { name: 'Supermax' },
      update: {},
      create: {
        name: 'Supermax',
        description: 'Premium quality disposable gloves manufacturer',
        logo: 'https://example.com/supermax-logo.png',
        isActive: true
      }
    })
  ])

  console.log(`✅ Created ${brands.length} brands`)

  // Create categories
  const medicalCategory = await prisma.category.upsert({
    where: { name: 'Medical Gloves' },
    update: {},
    create: {
      name: 'Medical Gloves',
      description: 'Gloves for medical and healthcare applications',
      isActive: true
    }
  })

  const industrialCategory = await prisma.category.upsert({
    where: { name: 'Industrial Gloves' },
    update: {},
    create: {
      name: 'Industrial Gloves',
      description: 'Gloves for industrial and manufacturing applications',
      isActive: true
    }
  })

  const foodCategory = await prisma.category.upsert({
    where: { name: 'Food Service Gloves' },
    update: {},
    create: {
      name: 'Food Service Gloves',
      description: 'Gloves for food handling and preparation',
      isActive: true
    }
  })

  // Create subcategories
  const latexCategory = await prisma.category.upsert({
    where: { name: 'Latex Gloves' },
    update: {},
    create: {
      name: 'Latex Gloves',
      description: 'Natural rubber latex gloves',
      parentId: medicalCategory.id,
      isActive: true
    }
  })

  const nitrileCategory = await prisma.category.upsert({
    where: { name: 'Nitrile Gloves' },
    update: {},
    create: {
      name: 'Nitrile Gloves',
      description: 'Synthetic nitrile rubber gloves',
      parentId: medicalCategory.id,
      isActive: true
    }
  })

  const vinylCategory = await prisma.category.upsert({
    where: { name: 'Vinyl Gloves' },
    update: {},
    create: {
      name: 'Vinyl Gloves',
      description: 'PVC vinyl gloves',
      parentId: medicalCategory.id,
      isActive: true
    }
  })

  console.log('✅ Created categories and subcategories')

  // Create products
  const products = [
    {
      sku: 'ANS-LAT-001',
      name: 'Ansell Latex Examination Gloves',
      description: 'High-quality latex examination gloves for medical use. Powder-free with textured fingertips for enhanced grip.',
      images: [
        'https://example.com/ansell-latex-1.jpg',
        'https://example.com/ansell-latex-2.jpg'
      ],
      specifications: {
        material: 'Natural Rubber Latex',
        thickness: '0.12mm',
        length: '240mm',
        texture: 'Textured fingertips',
        powder: 'Powder-free',
        sterile: false,
        sizes: ['S', 'M', 'L', 'XL']
      },
      useCase: UseCase.MEDICAL,
      brandId: brands[0].id, // Ansell
      basePrice: 85000, // 850 IDR per piece
      stock: 5000,
      minStock: 500,
      isActive: true,
      isFeatured: true,
      categoryIds: [medicalCategory.id, latexCategory.id],
      pricingTiers: [
        { minQuantity: 100, maxQuantity: 499, pricePerUnit: 80000 }, // 800 IDR
        { minQuantity: 500, maxQuantity: 999, pricePerUnit: 75000 }, // 750 IDR
        { minQuantity: 1000, pricePerUnit: 70000 } // 700 IDR
      ]
    },
    {
      sku: 'KC-NIT-001',
      name: 'Kimberly-Clark Nitrile Gloves',
      description: 'Premium nitrile examination gloves. Latex-free, chemical resistant, and suitable for sensitive skin.',
      images: [
        'https://example.com/kc-nitrile-1.jpg',
        'https://example.com/kc-nitrile-2.jpg'
      ],
      specifications: {
        material: 'Nitrile Rubber',
        thickness: '0.10mm',
        length: '240mm',
        texture: 'Textured fingertips',
        powder: 'Powder-free',
        sterile: false,
        sizes: ['S', 'M', 'L', 'XL']
      },
      useCase: UseCase.MEDICAL,
      brandId: brands[1].id, // Kimberly-Clark
      basePrice: 95000, // 950 IDR per piece
      stock: 3000,
      minStock: 300,
      isActive: true,
      isFeatured: true,
      categoryIds: [medicalCategory.id, nitrileCategory.id],
      pricingTiers: [
        { minQuantity: 100, maxQuantity: 499, pricePerUnit: 90000 }, // 900 IDR
        { minQuantity: 500, maxQuantity: 999, pricePerUnit: 85000 }, // 850 IDR
        { minQuantity: 1000, pricePerUnit: 80000 } // 800 IDR
      ]
    },
    {
      sku: 'TG-VIN-001',
      name: 'Top Glove Vinyl Gloves',
      description: 'Economical vinyl gloves for general purpose use. Latex-free and suitable for food handling.',
      images: [
        'https://example.com/tg-vinyl-1.jpg',
        'https://example.com/tg-vinyl-2.jpg'
      ],
      specifications: {
        material: 'PVC Vinyl',
        thickness: '0.08mm',
        length: '230mm',
        texture: 'Smooth',
        powder: 'Powder-free',
        sterile: false,
        sizes: ['S', 'M', 'L', 'XL']
      },
      useCase: UseCase.FOOD,
      brandId: brands[2].id, // Top Glove
      basePrice: 45000, // 450 IDR per piece
      stock: 8000,
      minStock: 800,
      isActive: true,
      isFeatured: false,
      categoryIds: [foodCategory.id, vinylCategory.id],
      pricingTiers: [
        { minQuantity: 200, maxQuantity: 999, pricePerUnit: 42000 }, // 420 IDR
        { minQuantity: 1000, maxQuantity: 4999, pricePerUnit: 40000 }, // 400 IDR
        { minQuantity: 5000, pricePerUnit: 38000 } // 380 IDR
      ]
    },
    {
      sku: 'SM-NIT-002',
      name: 'Supermax Nitrile Industrial Gloves',
      description: 'Heavy-duty nitrile gloves for industrial applications. Chemical resistant with extended cuff.',
      images: [
        'https://example.com/sm-industrial-1.jpg',
        'https://example.com/sm-industrial-2.jpg'
      ],
      specifications: {
        material: 'Nitrile Rubber',
        thickness: '0.15mm',
        length: '300mm',
        texture: 'Diamond grip pattern',
        powder: 'Powder-free',
        sterile: false,
        sizes: ['M', 'L', 'XL', 'XXL']
      },
      useCase: UseCase.MANUFACTURING,
      brandId: brands[3].id, // Supermax
      basePrice: 125000, // 1250 IDR per piece
      stock: 2000,
      minStock: 200,
      isActive: true,
      isFeatured: true,
      categoryIds: [industrialCategory.id, nitrileCategory.id],
      pricingTiers: [
        { minQuantity: 50, maxQuantity: 199, pricePerUnit: 120000 }, // 1200 IDR
        { minQuantity: 200, maxQuantity: 499, pricePerUnit: 115000 }, // 1150 IDR
        { minQuantity: 500, pricePerUnit: 110000 } // 1100 IDR
      ]
    },
    {
      sku: 'ANS-NIT-003',
      name: 'Ansell Surgical Nitrile Gloves',
      description: 'Sterile surgical nitrile gloves with superior tactile sensitivity. Ideal for surgical procedures.',
      images: [
        'https://example.com/ansell-surgical-1.jpg',
        'https://example.com/ansell-surgical-2.jpg'
      ],
      specifications: {
        material: 'Nitrile Rubber',
        thickness: '0.08mm',
        length: '280mm',
        texture: 'Micro-textured',
        powder: 'Powder-free',
        sterile: true,
        sizes: ['6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0']
      },
      useCase: UseCase.MEDICAL,
      brandId: brands[0].id, // Ansell
      basePrice: 185000, // 1850 IDR per piece
      stock: 1000,
      minStock: 100,
      isActive: true,
      isFeatured: true,
      categoryIds: [medicalCategory.id, nitrileCategory.id],
      pricingTiers: [
        { minQuantity: 50, maxQuantity: 199, pricePerUnit: 180000 }, // 1800 IDR
        { minQuantity: 200, maxQuantity: 499, pricePerUnit: 175000 }, // 1750 IDR
        { minQuantity: 500, pricePerUnit: 170000 } // 1700 IDR
      ]
    },
    {
      sku: 'TG-LAT-002',
      name: 'Top Glove Food Grade Latex Gloves',
      description: 'Food-safe latex gloves for food preparation and handling. Complies with food safety standards.',
      images: [
        'https://example.com/tg-food-latex-1.jpg',
        'https://example.com/tg-food-latex-2.jpg'
      ],
      specifications: {
        material: 'Natural Rubber Latex',
        thickness: '0.10mm',
        length: '240mm',
        texture: 'Textured palm and fingers',
        powder: 'Lightly powdered',
        sterile: false,
        sizes: ['S', 'M', 'L', 'XL']
      },
      useCase: UseCase.FOOD,
      brandId: brands[2].id, // Top Glove
      basePrice: 65000, // 650 IDR per piece
      stock: 4000,
      minStock: 400,
      isActive: true,
      isFeatured: false,
      categoryIds: [foodCategory.id, latexCategory.id],
      pricingTiers: [
        { minQuantity: 100, maxQuantity: 499, pricePerUnit: 62000 }, // 620 IDR
        { minQuantity: 500, maxQuantity: 1999, pricePerUnit: 58000 }, // 580 IDR
        { minQuantity: 2000, pricePerUnit: 55000 } // 550 IDR
      ]
    }
  ]

  for (const productData of products) {
    const { categoryIds, pricingTiers, ...productInfo } = productData

    // Create product
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: productInfo
    })

    // Create category relationships
    for (const categoryId of categoryIds) {
      await prisma.productCategory.upsert({
        where: {
          productId_categoryId: {
            productId: product.id,
            categoryId: categoryId
          }
        },
        update: {},
        create: {
          productId: product.id,
          categoryId: categoryId
        }
      })
    }

    // Create pricing tiers
    for (const tier of pricingTiers) {
      await prisma.pricingTier.create({
        data: {
          productId: product.id,
          minQuantity: tier.minQuantity,
          maxQuantity: tier.maxQuantity || null,
          pricePerUnit: tier.pricePerUnit,
          isActive: true
        }
      })
    }

    console.log(`✅ Created product: ${product.name}`)
  }

  console.log(`🎉 Successfully seeded ${products.length} products with categories and pricing tiers`)
}

export { seedProducts }

// Run if called directly
if (require.main === module) {
  seedProducts()
    .catch((e) => {
      console.error('❌ Error seeding products:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}