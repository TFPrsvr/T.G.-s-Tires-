import { NextRequest, NextResponse } from 'next/server';
import { MessageRouter } from '@/lib/messaging/message-router';
import { SecurityInputValidator } from '@/lib/security/input-validator';

// Webhook handler for incoming SMS messages from customers
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract Twilio webhook data
    const from = formData.get('From')?.toString() || '';
    const to = formData.get('To')?.toString() || '';
    const body = formData.get('Body')?.toString() || '';
    const messageSid = formData.get('MessageSid')?.toString() || '';

    // Validate and sanitize input
    if (!SecurityInputValidator.validatePhoneNumber(from)) {
      SecurityInputValidator.logSecurityEvent(
        'INVALID_PHONE_WEBHOOK',
        { from, to, messageSid },
        'MEDIUM'
      );
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    if (SecurityInputValidator.containsSuspiciousPatterns(body)) {
      SecurityInputValidator.logSecurityEvent(
        'SUSPICIOUS_MESSAGE_CONTENT',
        { from, body: body.substring(0, 100) },
        'HIGH'
      );
      return NextResponse.json({ error: 'Invalid message content' }, { status: 400 });
    }

    // Process incoming customer message
    const incomingMessage = await MessageRouter.handleIncomingMessage(
      from,
      body,
      'SMS',
      'tgs-default',
      {
        messageSid,
        twilioWebhook: true,
        receivedAt: new Date().toISOString(),
      }
    );

    console.log('Processed incoming SMS:', {
      messageId: incomingMessage.id,
      from: incomingMessage.from,
      conversationId: incomingMessage.conversationId,
    });

    // Respond with TwiML to acknowledge receipt
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Message>
        Thank you for your message! T.G.'s Tires has received your inquiry and will respond shortly.
        For immediate assistance, visit us at ${process.env.NEXT_PUBLIC_APP_URL}
      </Message>
    </Response>`;

    return new NextResponse(twimlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error('Twilio webhook error:', error);

    SecurityInputValidator.logSecurityEvent(
      'WEBHOOK_PROCESSING_ERROR',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'HIGH'
    );

    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// Handle GET requests (for webhook verification if needed)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Twilio SMS webhook endpoint active',
    timestamp: new Date().toISOString()
  });
}