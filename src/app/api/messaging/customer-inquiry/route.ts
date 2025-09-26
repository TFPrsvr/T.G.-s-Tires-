import { NextRequest, NextResponse } from 'next/server';
import { MessageRouter } from '@/lib/messaging/message-router';
import { SecurityInputValidator } from '@/lib/security/input-validator';
import { RateLimiter } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.ip || '127.0.0.1';

    // Rate limiting for customer inquiries
    const rateLimitResult = RateLimiter.check(clientIP, 'REGISTRATION');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please wait before sending another.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      customerIdentifier,
      channel,
      message,
      customerName,
      inquiryType,
      listingId,
      contactInfo
    } = body;

    // Validate required fields
    if (!customerIdentifier || !channel || !message || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate channel
    if (!['SMS', 'EMAIL', 'IN_APP'].includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid communication channel' },
        { status: 400 }
      );
    }

    // Validate customer identifier based on channel
    if (channel === 'SMS' && !SecurityInputValidator.validatePhoneNumber(customerIdentifier)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    if (channel === 'EMAIL' && !SecurityInputValidator.validateEmail(customerIdentifier)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Validate message content
    if (typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    // Check for suspicious content
    if (SecurityInputValidator.containsSuspiciousPatterns(message)) {
      SecurityInputValidator.logSecurityEvent(
        'SUSPICIOUS_CUSTOMER_MESSAGE',
        { customerIdentifier, channel, messagePreview: message.substring(0, 100) },
        'MEDIUM'
      );
      return NextResponse.json(
        { error: 'Message contains invalid content' },
        { status: 400 }
      );
    }

    // Process the customer inquiry through message router
    const incomingMessage = await MessageRouter.handleIncomingMessage(
      customerIdentifier,
      message,
      channel as 'SMS' | 'EMAIL' | 'IN_APP',
      'tgs-default',
      {
        customerName,
        inquiryType,
        listingId,
        contactInfo,
        source: 'customer_form',
        submittedAt: new Date().toISOString(),
        clientIP,
      }
    );

    console.log('Customer inquiry processed:', {
      messageId: incomingMessage.id,
      conversationId: incomingMessage.conversationId,
      channel: incomingMessage.channel,
      customerName,
      inquiryType,
    });

    // Send immediate acknowledgment based on channel
    let acknowledgment = '';
    switch (channel) {
      case 'SMS':
        acknowledgment = `Hi ${customerName}! Thanks for your message about ${inquiryType}. T.G.'s Tires will text you back shortly.`;
        break;
      case 'EMAIL':
        acknowledgment = `Thank you ${customerName} for reaching out! We've received your ${inquiryType} inquiry and will email you back within 1-2 hours.`;
        break;
      case 'IN_APP':
        acknowledgment = `Message received, ${customerName}! Check your notifications for a response from T.G.'s Tires.`;
        break;
    }

    return NextResponse.json({
      success: true,
      messageId: incomingMessage.id,
      conversationId: incomingMessage.conversationId,
      acknowledgment,
      estimatedResponseTime: channel === 'SMS' ? '30 minutes' : '1-2 hours',
      channel,
    });

  } catch (error) {
    console.error('Customer inquiry processing error:', error);

    SecurityInputValidator.logSecurityEvent(
      'CUSTOMER_INQUIRY_ERROR',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'MEDIUM'
    );

    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Customer inquiry endpoint active',
    supportedChannels: ['SMS', 'EMAIL', 'IN_APP'],
    maxMessageLength: 2000,
    timestamp: new Date().toISOString()
  });
}