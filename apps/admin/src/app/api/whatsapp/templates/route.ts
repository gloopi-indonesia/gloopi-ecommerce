import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/services/whatsapp-service';
import { verifyJWT } from '@/lib/jwt';

/**
 * GET handler for retrieving WhatsApp message templates
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

    // Get available message templates
    const templates = whatsappService.getMessageTemplates();

    return NextResponse.json({
      success: true,
      templates
    });

  } catch (error) {
    console.error('WhatsApp templates error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve message templates' },
      { status: 500 }
    );
  }
}