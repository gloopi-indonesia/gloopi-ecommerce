import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function POST(
   request: NextRequest,
   { params }: { params: { orderId: string } }
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

      const { orderId } = params
      const body = await request.json()
      const { dueDate } = body

      // Validate due date
      if (!dueDate) {
         return NextResponse.json({ error: 'Due date is required' }, { status: 400 })
      }

      const dueDateObj = new Date(dueDate)
      if (isNaN(dueDateObj.getTime())) {
         return NextResponse.json({ error: 'Invalid due date' }, { status: 400 })
      }

      // Get order with items
      const order = await prisma.order.findUnique({
         where: { id: orderId },
         include: {
            items: {
               include: {
                  product: true,
               },
            },
            customer: true,
            invoice: true,
         },
      })

      if (!order) {
         return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Check if invoice already exists
      if (order.invoice) {
         return NextResponse.json({ error: 'Invoice already exists for this order' }, { status: 400 })
      }

      // Generate invoice number
      const invoiceCount = await prisma.invoice.count()
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(6, '0')}`

      // Create invoice with items
      const invoice = await prisma.$transaction(async (tx) => {
         // Create the invoice
         const newInvoice = await tx.invoice.create({
            data: {
               invoiceNumber,
               orderId,
               customerId: order.customerId,
               subtotal: order.subtotal,
               taxAmount: order.taxAmount,
               totalAmount: order.totalAmount,
               dueDate: dueDateObj,
               status: 'PENDING',
            },
         })

         // Create invoice items
         await tx.invoiceItem.createMany({
            data: order.items.map((item) => ({
               invoiceId: newInvoice.id,
               productId: item.productId,
               quantity: item.quantity,
               unitPrice: item.unitPrice,
               totalPrice: item.totalPrice,
            })),
         })

         return newInvoice
      })

      return NextResponse.json({
         success: true,
         invoice,
      })
   } catch (error) {
      console.error('Error creating invoice:', error)
      return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
      )
   }
}