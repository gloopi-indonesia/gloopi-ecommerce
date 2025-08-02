import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/services/whatsapp-service';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

const sendMessageSchema = z.object({
  to: z.string().min(1, 'Phone number is required'),
  type: z.enum(['template', 'text']),
  templateName: z.string().optional(),
  parameters: z.record(z.string()).optional(),
  message: z.string().optional(),
  customerId: z.string().optional(),
  quotationId: z.string().optional(),
});

/**
 * POST handler for sending WhatsApp messages
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
    const validatedData = sendMessageSchema.parse(body);

    let messageId: string;

    if (validatedData.type === 'template') {
      if (!validatedData.templateName) {
        return NextResponse.json(
          { error: 'Template name is required for template messages' },
          { status: 400 }
        );
      }

      messageId = await whatsappService.sendTemplateMessage(
        validatedData.to,
        validatedData.templateName,
        validatedData.parameters || {},
        validatedData.customerId,
        validatedData.quotationId,
        adminUserId
      );
    } else {
      if (!validatedData.message) {
        return NextResponse.json(
          { error: 'Message content is required for text messages' },
          { status: 400 }
        );
      }

      messageId = await whatsappService.sendTextMessage(
        validatedData.to,
        validatedData.message,
        validatedData.customerId,
        validatedData.quotationId,
        adminUserId
      );
    }

    return NextResponse.json({
      success: true,
      messageId,
      message: 'WhatsApp message sent successfully'
    });

  } catch (error) {
    console.error('WhatsApp send message error:', error);

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
        error: error instanceof Error ? error.message : 'Failed to send WhatsApp message'
      },
      { status: 500 }
    );
  }
}