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
      const { trackingNumber } = body

      // Validate tracking number
      if (!trackingNumber || typeof trackingNumber !== 'string' || trackingNumber.trim().length === 0) {
         return NextResponse.json({ error: 'Valid tracking number is required' }, { status: 400 })
      }

      // Get current order
      const currentOrder = await prisma.order.findUnique({
         where: { id: orderId },
      })

      if (!currentOrder) {
         return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Update order with tracking number
      const updatedOrder = await prisma.order.update({
         where: { id: orderId },
         data: {
            trackingNumber: trackingNumber.trim(),
         },
      })

      return NextResponse.json({
         success: true,
         order: updatedOrder,
      })
   } catch (error) {
      console.error('Error updating tracking number:', error)
      return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
      )
   }
}