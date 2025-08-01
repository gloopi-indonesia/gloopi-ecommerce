import { NextRequest, NextResponse } from 'next/server';
import { communicationManager } from '@/lib/services/communication-manager';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

const sendFollowUpMessageSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  quotationId: z.string().optional(),
  templateName: z.string().min(1, 'Template name is required'),
  parameters: z.record(z.string()).optional(),
  scheduledAt: z.string().transform(str => new Date(str)).optional(),
  notes: z.string().optional(),
});

/**
 * POST handler for sending follow-up messages
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
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const adminUserId = payload.userId as string;

    // Validate request body
    const body = await request.json();
    const validatedData = sendFollowUpMessageSchema.parse(body);

    // Send follow-up message
    const result = await communicationManager.sendFollowUpMessage({
      ...validatedData,
      adminUserId,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Follow-up message sent successfully'
    });

  } catch (error) {
    console.error('Send follow-up message error:', error);

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
      { 
        error: error instanceof Error ? error.message : 'Failed to send follow-up message'
      },
      { status: 500 }
    );
  }
}