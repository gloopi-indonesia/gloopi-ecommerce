import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin users
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@gloopi.com' },
    update: {},
    create: {
      email: 'admin@gloopi.com',
      name: 'Admin Gloopi',
      password: adminPassword,
      role: 'SUPER_ADMIN',
    },
  })

  // Create brands
  const nitrile = await prisma.brand.upsert({
    where: { name: 'Nitrile Pro' },
    update: {},
    create: {
      name: 'Nitrile Pro',
      description: 'Premium nitrile gloves for professional use',
      isActive: true,
    },
  })

  const latex = await prisma.brand.upsert({
    where: { name: 'Latex Care' },
    update: {},
    create: {
      name: 'Latex Care',
      description: 'High-quality latex gloves for medical applications',
      isActive: true,
    },
  })

  // Create categories
  const disposableCategory = await prisma.category.upsert({
    where: { name: 'Disposable Gloves' },
    update: {},
    create: {
      name: 'Disposable Gloves',
      description: 'Single-use disposable gloves for various applications',
      isActive: true,
    },
  })

  const reusableCategory = await prisma.category.upsert({
    where: { name: 'Reusable Gloves' },
    update: {},
    create: {
      name: 'Reusable Gloves',
      description: 'Durable gloves for multiple uses',
      isActive: true,
    },
  })

  // Create products
  const nitrileExam = await prisma.product.create({
    data: {
      sku: 'NTR-001',
      name: 'Nitrile Examination Gloves',
      description: 'Powder-free nitrile examination gloves for medical use',
      images: ['https://example.com/nitrile-exam.jpg'],
      specifications: {
        material: 'Nitrile',
        thickness: '0.1mm',
        length: '240mm',
        color: 'Blue',
        powder: 'Powder-free',
        textured: true,
      },
      useCase: 'MEDICAL',
      brandId: nitrile.id,
      basePrice: 50000, // Rp 500 in cents
      stock: 10000,
      minStock: 1000,
      isActive: true,
      isFeatured: true,
    },
  })

  const latexSurgical = await prisma.product.create({
    data: {
      sku: 'LTX-001',
      name: 'Latex Surgical Gloves',
      description: 'Sterile latex surgical gloves for medical procedures',
      images: ['https://example.com/latex-surgical.jpg'],
      specifications: {
        material: 'Natural Latex',
        thickness: '0.15mm',
        length: '280mm',
        color: 'White',
        sterile: true,
        textured: true,
      },
      useCase: 'MEDICAL',
      brandId: latex.id,
      basePrice: 75000, // Rp 750 in cents
      stock: 5000,
      minStock: 500,
      isActive: true,
      isFeatured: true,
    },
  })

  const nitrileIndustrial = await prisma.product.create({
    data: {
      sku: 'NTR-002',
      name: 'Nitrile Industrial Gloves',
      description: 'Heavy-duty nitrile gloves for manufacturing and industrial use',
      images: ['https://example.com/nitrile-industrial.jpg'],
      specifications: {
        material: 'Nitrile',
        thickness: '0.2mm',
        length: '300mm',
        color: 'Black',
        chemical_resistant: true,
        grip: 'Diamond textured',
      },
      useCase: 'MANUFACTURING',
      brandId: nitrile.id,
      basePrice: 80000, // Rp 800 in cents
      stock: 8000,
      minStock: 800,
      isActive: true,
      isFeatured: false,
    },
  })

  // Create product categories relationships
  await prisma.productCategory.createMany({
    data: [
      { productId: nitrileExam.id, categoryId: disposableCategory.id },
      { productId: latexSurgical.id, categoryId: disposableCategory.id },
      { productId: nitrileIndustrial.id, categoryId: disposableCategory.id },
    ],
  })

  // Create pricing tiers
  await prisma.pricingTier.createMany({
    data: [
      // Nitrile Exam Gloves pricing tiers
      { productId: nitrileExam.id, minQuantity: 1, maxQuantity: 99, pricePerUnit: 50000 },
      { productId: nitrileExam.id, minQuantity: 100, maxQuantity: 499, pricePerUnit: 45000 },
      { productId: nitrileExam.id, minQuantity: 500, maxQuantity: 999, pricePerUnit: 40000 },
      { productId: nitrileExam.id, minQuantity: 1000, maxQuantity: null, pricePerUnit: 35000 },
      
      // Latex Surgical Gloves pricing tiers
      { productId: latexSurgical.id, minQuantity: 1, maxQuantity: 99, pricePerUnit: 75000 },
      { productId: latexSurgical.id, minQuantity: 100, maxQuantity: 499, pricePerUnit: 70000 },
      { productId: latexSurgical.id, minQuantity: 500, maxQuantity: null, pricePerUnit: 65000 },
      
      // Nitrile Industrial Gloves pricing tiers
      { productId: nitrileIndustrial.id, minQuantity: 1, maxQuantity: 99, pricePerUnit: 80000 },
      { productId: nitrileIndustrial.id, minQuantity: 100, maxQuantity: 499, pricePerUnit: 75000 },
      { productId: nitrileIndustrial.id, minQuantity: 500, maxQuantity: null, pricePerUnit: 70000 },
    ],
  })

  // Create test companies
  const medicalCompany = await prisma.company.create({
    data: {
      name: 'RS Siloam Jakarta',
      registrationNumber: 'REG-001-2024',
      taxId: '01.234.567.8-901.000', // NPWP format
      industry: 'MEDICAL',
      email: 'procurement@siloam.com',
      phone: '+62211234567',
      contactPerson: 'Dr. Budi Santoso',
      address: 'Jl. Garnisun Dalam No. 2-3',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      postalCode: '10110',
    },
  })

  const manufacturingCompany = await prisma.company.create({
    data: {
      name: 'PT Astra Manufacturing',
      registrationNumber: 'REG-002-2024',
      taxId: '01.234.567.8-902.000',
      industry: 'MANUFACTURING',
      email: 'purchasing@astra.com',
      phone: '+62211234568',
      contactPerson: 'Sari Wijaya',
      address: 'Jl. Gaya Motor Raya No. 8',
      city: 'Jakarta Timur',
      province: 'DKI Jakarta',
      postalCode: '13930',
    },
  })

  // Create test customers
  const b2bCustomer = await prisma.customer.create({
    data: {
      email: 'procurement@siloam.com',
      phone: '+62211234567',
      name: 'Dr. Budi Santoso',
      type: 'B2B',
      companyId: medicalCompany.id,
      password: await bcrypt.hash('customer123', 10),
      isEmailVerified: true,
      taxInformation: {
        npwp: '01.234.567.8-901.000',
        companyName: 'RS Siloam Jakarta',
        address: 'Jl. Garnisun Dalam No. 2-3, Jakarta Pusat',
      },
      communicationPreferences: {
        whatsapp: true,
        email: true,
        phone: true,
      },
    },
  })

  const b2cCustomer = await prisma.customer.create({
    data: {
      email: 'john.doe@email.com',
      phone: '+6281234567890',
      name: 'John Doe',
      type: 'B2C',
      password: await bcrypt.hash('customer123', 10),
      isEmailVerified: true,
      communicationPreferences: {
        whatsapp: true,
        email: true,
        phone: false,
      },
    },
  })

  // Create addresses
  await prisma.address.create({
    data: {
      customerId: b2bCustomer.id,
      label: 'Kantor Utama',
      address: 'Jl. Garnisun Dalam No. 2-3',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      postalCode: '10110',
      phone: '+62211234567',
      isDefault: true,
    },
  })

  await prisma.address.create({
    data: {
      customerId: b2cCustomer.id,
      label: 'Rumah',
      address: 'Jl. Sudirman No. 123',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12190',
      phone: '+6281234567890',
      isDefault: true,
    },
  })

  // Create system configuration
  await prisma.systemConfig.createMany({
    data: [
      {
        key: 'ppn_rate',
        value: 0.11,
        description: 'PPN tax rate for Indonesia (11%)',
      },
      {
        key: 'quotation_validity_days',
        value: 30,
        description: 'Default quotation validity period in days',
      },
      {
        key: 'invoice_due_days',
        value: 30,
        description: 'Default invoice due period in days',
      },
      {
        key: 'company_info',
        value: {
          name: 'PT Gloopi Indonesia',
          address: 'Jl. Industri Raya No. 45, Jakarta',
          phone: '+62211234567',
          email: 'info@gloopi.com',
          npwp: '01.234.567.8-900.000',
        },
        description: 'Company information for invoices and documents',
      },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log(`👤 Admin user: admin@gloopi.com / admin123`)
  console.log(`🏢 B2B Customer: procurement@siloam.com / customer123`)
  console.log(`👤 B2C Customer: john.doe@email.com / customer123`)
  console.log(`📦 Created ${await prisma.product.count()} products`)
  console.log(`🏷️ Created ${await prisma.brand.count()} brands`)
  console.log(`📂 Created ${await prisma.category.count()} categories`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })