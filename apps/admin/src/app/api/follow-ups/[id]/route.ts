import { NextRequest, NextResponse } from 'next/server';
import { communicationManager } from '@/lib/services/communication-manager';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

const updateFollowUpSchema = z.object({
  action: z.enum(['complete', 'cancel']),
  notes: z.string().optional(),
});

/**
 * PATCH handler for updating follow-ups (complete or cancel)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const followUpId = params.id;

    // Validate request body
    const body = await request.json();
    const validatedData = updateFollowUpSchema.parse(body);

    let followUp;

    if (validatedData.action === 'complete') {
      followUp = await communicationManager.completeFollowUp(
        followUpId,
        validatedData.notes,
        adminUserId
      );
    } else if (validatedData.action === 'cancel') {
      followUp = await communicationManager.cancelFollowUp(
        followUpId,
        validatedData.notes
      );
    }

    return NextResponse.json({
      success: true,
      data: followUp,
      message: `Follow-up ${validatedData.action}d successfully`
    });

  } catch (error) {
    console.error('Follow-up update error:', error);

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
      { error: 'Failed to update follow-up' },
      { status: 500 }
    );
  }
}