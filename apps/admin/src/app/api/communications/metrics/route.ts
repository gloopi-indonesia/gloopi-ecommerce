import { NextRequest, NextResponse } from 'next/server';
import { communicationManager } from '@/lib/services/communication-manager';
import { verifyJWT } from '@/lib/jwt';

/**
 * GET handler for retrieving communication metrics
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
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const adminUserId = payload.userId as string;
    const searchParams = request.nextUrl.searchParams;
    
    // Parse date filters
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const includeAllAdmins = searchParams.get('includeAllAdmins') === 'true';

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    // Get communication metrics
    const metrics = await communicationManager.getCommunicationMetrics(
      startDate,
      endDate,
      includeAllAdmins ? undefined : adminUserId
    );

    return NextResponse.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Communication metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve communication metrics' },
      { status: 500 }
    );
  }
}