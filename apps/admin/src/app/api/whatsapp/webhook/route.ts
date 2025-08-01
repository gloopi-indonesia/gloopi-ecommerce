import { NextRequest, NextResponse } from 'next/server';
import { whatsappService, WhatsAppWebhook } from '@/lib/services/whatsapp-service';

/**
 * GET handler for WhatsApp webhook verification
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (!mode || !token || !challenge) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const verificationResult = whatsappService.verifyWebhook(mode, token, challenge);
    
    if (verificationResult) {
      return new NextResponse(verificationResult, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    } else {
      return NextResponse.json(
        { error: 'Webhook verification failed' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('WhatsApp webhook verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for WhatsApp webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const payload: WhatsAppWebhook = await request.json();

    // Verify the webhook payload structure
    if (!payload.object || payload.object !== 'whatsapp_business_account') {
      return NextResponse.json(
        { error: 'Invalid webhook object' },
        { status: 400 }
      );
    }

    // Process the webhook
    await whatsappService.handleIncomingWebhook(payload);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('WhatsApp webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}