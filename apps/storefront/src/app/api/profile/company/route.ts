import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyJWT(token) as any
    if (!payload || typeof payload.sub !== 'string') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get customer to check if they have a company
    const customer = await prisma.customer.findUnique({
      where: { id: payload.sub },
      include: { company: true },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    if (customer.type !== 'B2B' || !customer.companyId) {
      return NextResponse.json(
        { error: 'Only B2B customers can update company information' },
        { status: 403 }
      )
    }

    const {
      name,
      registrationNumber,
      taxId,
      industry,
      email,
      phone,
      website,
      contactPerson,
      address,
      city,
      province,
      postalCode,
    } = await request.json()

    if (!name || !registrationNumber || !taxId || !contactPerson) {
      return NextResponse.json(
        { error: 'Nama perusahaan, nomor registrasi, NPWP, dan nama kontak diperlukan' },
        { status: 400 }
      )
    }

    // Check if registration number or tax ID is already used by another company
    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { registrationNumber },
          { taxId },
        ],
        id: { not: customer.companyId },
      },
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Nomor registrasi atau NPWP sudah digunakan' },
        { status: 409 }
      )
    }

    // Update company
    const company = await prisma.company.update({
      where: { id: customer.companyId },
      data: {
        name,
        registrationNumber,
        taxId,
        industry: industry || 'OTHER',
        email: email || null,
        phone: phone || null,
        website: website || null,
        contactPerson,
        address: address || '',
        city: city || '',
        province: province || '',
        postalCode: postalCode || '',
      },
    })

    return NextResponse.json({
      message: 'Profil perusahaan berhasil diperbarui',
      company,
    })

  } catch (error) {
    console.error('Update company error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}