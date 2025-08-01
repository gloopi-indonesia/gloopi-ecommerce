import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.adminUser.upsert({
    where: { email: 'admin@gloopi.com' },
    update: {},
    create: {
      email: 'admin@gloopi.com',
      name: 'Admin Gloopi',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create sample brands
  const brand1 = await prisma.brand.upsert({
    where: { name: 'Gloopi Premium' },
    update: {},
    create: {
      name: 'Gloopi Premium',
      description: 'Sarung tangan premium untuk industri medis dan manufaktur',
      isActive: true,
    },
  })

  const brand2 = await prisma.brand.upsert({
    where: { name: 'Gloopi Standard' },
    update: {},
    create: {
      name: 'Gloopi Standard',
      description: 'Sarung tangan standar untuk kebutuhan umum',
      isActive: true,
    },
  })

  console.log('✅ Created brands')

  // Create sample categories
  const medicalCategory = await prisma.category.upsert({
    where: { name: 'Medis' },
    update: {},
    create: {
      name: 'Medis',
      description: 'Sarung tangan untuk keperluan medis',
      isActive: true,
    },
  })

  const manufacturingCategory = await prisma.category.upsert({
    where: { name: 'Manufaktur' },
    update: {},
    create: {
      name: 'Manufaktur',
      description: 'Sarung tangan untuk industri manufaktur',
      isActive: true,
    },
  })

  const foodCategory = await prisma.category.upsert({
    where: { name: 'Makanan' },
    update: {},
    create: {
      name: 'Makanan',
      description: 'Sarung tangan untuk industri makanan',
      isActive: true,
    },
  })

  console.log('✅ Created categories')

  // Create sample products
  const product1 = await prisma.product.upsert({
    where: { sku: 'GLV-MED-001' },
    update: {},
    create: {
      sku: 'GLV-MED-001',
      name: 'Sarung Tangan Nitrile Medis',
      description: 'Sarung tangan nitrile berkualitas tinggi untuk keperluan medis',
      useCase: 'MEDICAL',
      brandId: brand1.id,
      basePrice: 5000000, // Rp 50,000 in cents
      stock: 1000,
      minStock: 100,
      isActive: true,
      isFeatured: true,
      specifications: {
        material: 'Nitrile',
        thickness: '0.1mm',
        length: '240mm',
        color: 'Blue',
        powder: 'Powder-free',
        sterile: true,
      },
      images: [
        'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      ],
    },
  })

  const product2 = await prisma.product.upsert({
    where: { sku: 'GLV-MFG-001' },
    update: {},
    create: {
      sku: 'GLV-MFG-001',
      name: 'Sarung Tangan Latex Manufaktur',
      description: 'Sarung tangan latex tahan lama untuk industri manufaktur',
      useCase: 'MANUFACTURING',
      brandId: brand2.id,
      basePrice: 3000000, // Rp 30,000 in cents
      stock: 2000,
      minStock: 200,
      isActive: true,
      isFeatured: false,
      specifications: {
        material: 'Latex',
        thickness: '0.15mm',
        length: '300mm',
        color: 'Yellow',
        powder: 'Powdered',
        sterile: false,
      },
      images: [
        'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      ],
    },
  })

  console.log('✅ Created products')

  // Link products to categories
  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product1.id,
        categoryId: medicalCategory.id,
      },
    },
    update: {},
    create: {
      productId: product1.id,
      categoryId: medicalCategory.id,
    },
  })

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product2.id,
        categoryId: manufacturingCategory.id,
      },
    },
    update: {},
    create: {
      productId: product2.id,
      categoryId: manufacturingCategory.id,
    },
  })

  console.log('✅ Linked products to categories')

  // Create pricing tiers
  await prisma.pricingTier.upsert({
    where: { id: 'tier-1' },
    update: {},
    create: {
      id: 'tier-1',
      productId: product1.id,
      minQuantity: 1,
      maxQuantity: 99,
      pricePerUnit: 5000000, // Rp 50,000
      isActive: true,
    },
  })

  await prisma.pricingTier.upsert({
    where: { id: 'tier-2' },
    update: {},
    create: {
      id: 'tier-2',
      productId: product1.id,
      minQuantity: 100,
      maxQuantity: 499,
      pricePerUnit: 4500000, // Rp 45,000
      isActive: true,
    },
  })

  await prisma.pricingTier.upsert({
    where: { id: 'tier-3' },
    update: {},
    create: {
      id: 'tier-3',
      productId: product1.id,
      minQuantity: 500,
      pricePerUnit: 4000000, // Rp 40,000
      isActive: true,
    },
  })

  console.log('✅ Created pricing tiers')

  // Create sample company
  const sampleCompany = await prisma.company.upsert({
    where: { registrationNumber: '1234567890' },
    update: {},
    create: {
      name: 'PT. Contoh Perusahaan',
      registrationNumber: '1234567890',
      taxId: '12.345.678.9-012.345',
      industry: 'MEDICAL',
      email: 'info@contohperusahaan.com',
      phone: '021-12345678',
      contactPerson: 'John Doe',
      address: 'Jl. Contoh No. 123',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '12345',
      country: 'Indonesia',
    },
  })

  console.log('✅ Created sample company')

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 12)
  
  const sampleCustomer = await prisma.customer.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'John Customer',
      phone: '08123456789',
      password: customerPassword,
      type: 'B2B',
      companyId: sampleCompany.id,
      isEmailVerified: true,
      isPhoneVerified: false,
    },
  })

  console.log('✅ Created sample customer')

  // Create sample address
  await prisma.address.upsert({
    where: { id: 'addr-1' },
    update: {},
    create: {
      id: 'addr-1',
      customerId: sampleCustomer.id,
      label: 'Kantor',
      address: 'Jl. Customer No. 456',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '12346',
      country: 'Indonesia',
      phone: '021-87654321',
      isDefault: true,
    },
  })

  console.log('✅ Created sample address')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })