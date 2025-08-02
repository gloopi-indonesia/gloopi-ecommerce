import { NextRequest, NextResponse } from 'next/server';
import { communicationManager } from '@/lib/services/communication-manager';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';
import { FollowUpType } from '@prisma/client';

const createFollowUpSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  quotationId: z.string().optional(),
  orderId: z.string().optional(),
  type: z.nativeEnum(FollowUpType),
  scheduledAt: z.string().transform(str => new Date(str)),
  notes: z.string().optional(),
});

const _sendFollowUpMessageSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  quotationId: z.string().optional(),
  templateName: z.string().min(1, 'Template name is required'),
  parameters: z.record(z.string()).optional(),
  scheduledAt: z.string().transform(str => new Date(str)).optional(),
  notes: z.string().optional(),
});

/**
 * GET handler for retrieving follow-ups
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

    const adminUserId = (payload as any).sub as string;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const includeAllAdmins = searchParams.get('includeAllAdmins') === 'true';

    let followUps;

    if (type === 'today') {
      followUps = await communicationManager.getTodaysPendingFollowUps(
        includeAllAdmins ? undefined : adminUserId
      );
    } else if (type === 'overdue') {
      followUps = await communicationManager.getOverdueFollowUps(
        includeAllAdmins ? undefined : adminUserId
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter. Use "today" or "overdue"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: followUps
    });

  } catch (error) {
    console.error('Follow-ups GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve follow-ups' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating follow-ups
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
    const validatedData = createFollowUpSchema.parse(body);

    // Ensure required fields are present
    if (!validatedData.customerId || !validatedData.type || !validatedData.scheduledAt) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, type, and scheduledAt are required' },
        { status: 400 }
      );
    }

    // Create follow-up
    const followUp = await communicationManager.scheduleFollowUp({
      customerId: validatedData.customerId,
      quotationId: validatedData.quotationId,
      orderId: validatedData.orderId,
      type: validatedData.type,
      scheduledAt: validatedData.scheduledAt,
      notes: validatedData.notes,
      adminUserId,
    });

    return NextResponse.json({
      success: true,
      data: followUp,
      message: 'Follow-up scheduled successfully'
    });

  } catch (error) {
    console.error('Follow-ups POST error:', error);

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
      { error: 'Failed to create follow-up' },
      { status: 500 }
    );
  }
}