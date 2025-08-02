import { NextRequest, NextResponse } from 'next/server';
import { communicationManager } from '@/lib/services/communication-manager';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

const completeFollowUpSchema = z.object({
  notes: z.string().optional(),
});

/**
 * PATCH handler for completing a follow-up
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
    if (!payload || !(payload as any).sub) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const adminUserId = (payload as any).sub as string;
    const { followUpId } = params;

    // Validate request body
    const body = await request.json();
    const validatedData = completeFollowUpSchema.parse(body);

    // Complete the follow-up
    const followUp = await communicationManager.completeFollowUp(
      followUpId,
      validatedData.notes,
      adminUserId
    );

    return NextResponse.json({
      success: true,
      data: followUp,
      message: 'Follow-up completed successfully'
    });

  } catch (error) {
    console.error('Complete follow-up error:', error);

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
      { error: 'Failed to complete follow-up' },
      { status: 500 }
    );
  }
}