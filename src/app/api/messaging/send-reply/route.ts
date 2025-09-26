import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MessageRouter } from '@/lib/messaging/message-router';
import { SecurityInputValidator } from '@/lib/security/input-validator';
import { RateLimiter } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = RateLimiter.check(userId, 'API');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { conversationId, replyContent, inReplyToMessageId } = body;

    // Validate input
    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    if (!replyContent || typeof replyContent !== 'string' || replyContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reply content is required' },
        { status: 400 }
      );
    }

    if (replyContent.length > 2000) {
      return NextResponse.json(
        { error: 'Message too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    // Check for suspicious content
    if (SecurityInputValidator.containsSuspiciousPatterns(replyContent)) {
      SecurityInputValidator.logSecurityEvent(
        'SUSPICIOUS_REPLY_CONTENT',
        { userId, conversationId, content: replyContent.substring(0, 100) },
        'MEDIUM'
      );
      return NextResponse.json(
        { error: 'Invalid message content' },
        { status: 400 }
      );
    }

    // Send reply through the message router
    const outgoingMessage = await MessageRouter.sendReply(
      conversationId,
      replyContent.trim(),
      userId,
      inReplyToMessageId
    );

    if (!outgoingMessage) {
      return NextResponse.json(
        { error: 'Failed to send reply' },
        { status: 500 }
      );
    }

    console.log('Reply sent:', {
      messageId: outgoingMessage.id,
      conversationId,
      channel: outgoingMessage.channel,
      sentBy: userId,
    });

    return NextResponse.json({
      success: true,
      message: outgoingMessage,
      deliveredAt: outgoingMessage.timestamp,
    });

  } catch (error) {
    console.error('Send reply error:', error);

    SecurityInputValidator.logSecurityEvent(
      'REPLY_SEND_ERROR',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'MEDIUM'
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}