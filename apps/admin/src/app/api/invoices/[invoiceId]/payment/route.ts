import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function PATCH(
   request: NextRequest,
   { params }: { params: { invoiceId: string } }
) {
   try {
      // Verify admin authentication
      const token = request.cookies.get('admin-token')?.value
      if (!token) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const payload = await verifyJWT<{ sub: string }>(token)
      if (!payload) {
         return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      const adminUser = await prisma.adminUser.findUnique({
         where: { id: payload.sub },
      })

      if (!adminUser || !adminUser.isActive) {
         return NextResponse.json({ error: 'Admin user not found or inactive' }, { status: 401 })
      }

      const { invoiceId } = params
      const body = await request.json()
      const { paymentMethod, paymentNotes } = body

      // Validate payment method
      if (!paymentMethod || typeof paymentMethod !== 'string') {
         return NextResponse.json({ error: 'Payment method is required' }, { status: 400 })
      }

      const validPaymentMethods = ['bank_transfer', 'cash', 'check', 'other']
      if (!validPaymentMethods.includes(paymentMethod)) {
         return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
      }

      // Get current invoice
      const currentInvoice = await prisma.invoice.findUnique({
         where: { id: invoiceId },
      })

      if (!currentInvoice) {
         return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }

      // Check if invoice is already paid
      if (currentInvoice.status === 'PAID') {
         return NextResponse.json({ error: 'Invoice is already marked as paid' }, { status: 400 })
      }

      // Check if invoice is cancelled
      if (currentInvoice.status === 'CANCELLED') {
         return NextResponse.json({ error: 'Cannot mark cancelled invoice as paid' }, { status: 400 })
      }

      // Update invoice as paid
      const updatedInvoice = await prisma.invoice.update({
         where: { id: invoiceId },
         data: {
            status: 'PAID',
            paidAt: new Date(),
            paymentMethod,
            paymentNotes: paymentNotes || null,
         },
      })

      return NextResponse.json({
         success: true,
         invoice: updatedInvoice,
      })
   } catch (error) {
      console.error('Error marking invoice as paid:', error)
      return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
      )
   }
}