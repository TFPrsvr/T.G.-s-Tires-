import { NextRequest, NextResponse } from 'next/server';
import { MessageRouter } from '@/lib/messaging/message-router';
import { SecurityInputValidator } from '@/lib/security/input-validator';

// Webhook handler for incoming email replies from customers
// This would typically be configured with your email service (SendGrid, Postmark, etc.)
export async function POST(_request: NextRequest) {
  try {
    const body = await request.json();

    // Extract email data (format varies by email service)
    // Example for SendGrid inbound parse webhook
    const from = body.from || body.sender;
    const to = body.to || body.recipient;
    const subject = body.subject || '';
    const text = body.text || body.plain || '';
    const html = body.html || '';

    // Parse email address
    const fromEmail = typeof from === 'string'
      ? from
      : from?.email || from?.address || '';

    // Validate email
    if (!SecurityInputValidator.validateEmail(fromEmail)) {
      SecurityInputValidator.logSecurityEvent(
        'INVALID_EMAIL_WEBHOOK',
        { from: fromEmail, to, subject },
        'MEDIUM'
      );
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Use text content, fallback to plain text from HTML
    let messageContent = text;
    if (!messageContent && html) {
      // Basic HTML to text conversion
      messageContent = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
    }

    if (!messageContent) {
      return NextResponse.json({ error: 'No message content found' }, { status: 400 });
    }

    // Check for suspicious content
    if (SecurityInputValidator.containsSuspiciousPatterns(messageContent)) {
      SecurityInputValidator.logSecurityEvent(
        'SUSPICIOUS_EMAIL_CONTENT',
        { from: fromEmail, subject, content: messageContent.substring(0, 100) },
        'HIGH'
      );
      return NextResponse.json({ error: 'Invalid message content' }, { status: 400 });
    }

    // Process incoming customer email
    const incomingMessage = await MessageRouter.handleIncomingMessage(
      fromEmail,
      messageContent,
      'EMAIL',
      'tgs-default',
      {
        subject,
        originalHtml: html,
        emailWebhook: true,
        receivedAt: new Date().toISOString(),
        emailService: 'webhook'
      }
    );

    console.log('Processed incoming email:', {
      messageId: incomingMessage.id,
      from: incomingMessage.from,
      conversationId: incomingMessage.conversationId,
      subject,
    });

    return NextResponse.json({
      success: true,
      messageId: incomingMessage.id,
      conversationId: incomingMessage.conversationId,
    });

  } catch (error) {
    console.error('Email webhook error:', error);

    SecurityInputValidator.logSecurityEvent(
      'EMAIL_WEBHOOK_ERROR',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'HIGH'
    );

    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    status: 'Email webhook endpoint active',
    timestamp: new Date().toISOString()
  });
}