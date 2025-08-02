import { NextRequest, NextResponse } from 'next/server';
import { communicationManager } from '@/lib/services/communication-manager';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

const cancelFollowUpSchema = z.object({
  notes: z.string().optional(),
});

/**
 * PATCH handler for cancelling a follow-up
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { followUpId: string } }
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

    const { followUpId } = params;

    // Parse request body for optional notes
    let notes: string | undefined;
    try {
      const body = await request.json();
      const validatedData = cancelFollowUpSchema.parse(body);
      notes = validatedData.notes;
    } catch {
      // Body is optional for cancel operation
      notes = undefined;
    }

    // Cancel the follow-up
    const followUp = await communicationManager.cancelFollowUp(followUpId, notes);

    return NextResponse.json({
      success: true,
      data: followUp,
      message: 'Follow-up cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel follow-up error:', error);

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
      { error: 'Failed to cancel follow-up' },
      { status: 500 }
    );
  }
}