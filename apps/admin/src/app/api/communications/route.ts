import { NextRequest, NextResponse } from 'next/server';
import { communicationManager } from '@/lib/services/communication-manager';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';
import { CommunicationType, CommunicationDirection } from '@prisma/client';

const createCommunicationSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  quotationId: z.string().optional(),
  orderId: z.string().optional(),
  type: z.nativeEnum(CommunicationType),
  direction: z.nativeEnum(CommunicationDirection),
  content: z.string().min(1, 'Content is required'),
  externalId: z.string().optional(),
});

// Ensure required fields are present for database operations
function validateCommunicationData(data: any): data is {
  customerId: string;
  quotationId?: string;
  orderId?: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  content: string;
  externalId?: string;
} {
  return typeof data.customerId === 'string' && data.customerId.length > 0;
}

/**
 * GET handler for retrieving communications
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || !(payload as any).sub) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const quotationId = searchParams.get('quotationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (customerId) {
      // Get customer communication history
      const history = await communicationManager.getCustomerCommunicationHistory(
        customerId,
        limit,
        offset
      );

      return NextResponse.json({
        success: true,
        data: history
      });
    } else if (quotationId) {
      // Get quotation communications
      const communications = await communicationManager.getQuotationCommunications(quotationId);

      return NextResponse.json({
        success: true,
        data: { communications }
      });
    } else {
      return NextResponse.json(
        { error: 'Either customerId or quotationId is required' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Communications GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve communications' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating communications
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || !(payload as any).sub) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const adminUserId = (payload as any).sub as string;

    // Validate request body
    const body = await request.json();
    const validatedData = createCommunicationSchema.parse(body);

    // Ensure all required fields are present
    if (!validateCommunicationData(validatedData)) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Create communication with guaranteed required fields
    const communication = await communicationManager.logCommunication({
      customerId: validatedData.customerId,
      quotationId: validatedData.quotationId,
      orderId: validatedData.orderId,
      type: validatedData.type,
      direction: validatedData.direction,
      content: validatedData.content,
      externalId: validatedData.externalId,
      adminUserId,
    });

    return NextResponse.json({
      success: true,
      data: communication,
      message: 'Communication logged successfully'
    });

  } catch (error) {
    console.error('Communications POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create communication' },
      { status: 500 }
    );
  }
}