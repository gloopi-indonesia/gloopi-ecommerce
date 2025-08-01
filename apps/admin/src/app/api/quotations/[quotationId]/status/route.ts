import { quotationManager } from '@/lib/services/quotation-manager'
import { QuotationStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { quotationId: string } }
) {
  try {
    const { quotationId } = params
    const body = await request.json()
    const { status, notes } = body

    // Validate status
    if (!Object.values(QuotationStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid quotation status' },
        { status: 400 }
      )
    }

    // Get admin user ID from middleware header
    const adminUserId = request.headers.get('X-USER-ID')
    
    if (!adminUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await quotationManager.updateQuotationStatus(
      quotationId,
      status,
      adminUserId,
      notes
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating quotation status:', error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}