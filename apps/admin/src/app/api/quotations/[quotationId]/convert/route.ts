import { quotationManager } from '@/lib/services/quotation-manager'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { quotationId: string } }
) {
  try {
    const { quotationId } = params

    // Get admin user ID from middleware header
    const adminUserId = request.headers.get('X-USER-ID')
    
    if (!adminUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const orderId = await quotationManager.convertToOrder(quotationId, adminUserId)

    return NextResponse.json({ 
      success: true,
      orderId 
    })
  } catch (error) {
    console.error('Error converting quotation to order:', error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}