import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function PATCH(
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
      const { status, notes } = body

      // Validate status
      const validStatuses = ['NEW', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
      if (!validStatuses.includes(status)) {
         return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }

      // Get current order
      const currentOrder = await prisma.order.findUnique({
         where: { id: orderId },
      })

      if (!currentOrder) {
         return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Validate status transition
      const validTransitions: Record<string, string[]> = {
         NEW: ['PROCESSING', 'CANCELLED'],
         PROCESSING: ['SHIPPED', 'CANCELLED'],
         SHIPPED: ['DELIVERED'],
         DELIVERED: [], // Final state
         CANCELLED: [], // Final state
      }

      const allowedTransitions = validTransitions[currentOrder.status] || []
      if (!allowedTransitions.includes(status)) {
         return NextResponse.json(
            { error: `Cannot transition from ${currentOrder.status} to ${status}` },
            { status: 400 }
         )
      }

      // Special validation for SHIPPED status
      if (status === 'SHIPPED' && !currentOrder.trackingNumber) {
         return NextResponse.json(
            { error: 'Cannot mark as shipped without tracking number' },
            { status: 400 }
         )
      }

      // Update order status
      const updatedOrder = await prisma.$transaction(async (tx) => {
         // Update the order
         const order = await tx.order.update({
            where: { id: orderId },
            data: {
               status,
               shippedAt: status === 'SHIPPED' ? new Date() : currentOrder.shippedAt,
               deliveredAt: status === 'DELIVERED' ? new Date() : currentOrder.deliveredAt,
            },
         })

         // Log the status change
         await tx.orderStatusLog.create({
            data: {
               orderId,
               fromStatus: currentOrder.status,
               toStatus: status,
               notes,
               adminUserId: adminUser.id,
            },
         })

         return order
      })

      return NextResponse.json({
         success: true,
         order: updatedOrder,
      })
   } catch (error) {
      console.error('Error updating order status:', error)
      return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
      )
   }
}