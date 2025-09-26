import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MessageRouter } from '@/lib/messaging/message-router';
import { RateLimiter } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (conversationId) {
      // Get specific conversation
      const conversation = MessageRouter.getConversation(conversationId);

      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      // Mark as read
      MessageRouter.markConversationAsRead(conversationId, userId);

      return NextResponse.json({
        conversation,
        totalMessages: conversation.messages.length,
      });
    }

    // Get all active conversations for the business
    const conversations = MessageRouter.getActiveConversations('tgs-default');

    // Add summary information
    const conversationsWithSummary = conversations.map(conv => ({
      ...conv,
      messageCount: conv.messages.length,
      lastMessage: conv.messages[conv.messages.length - 1],
      unreadCount: conv.messages.filter(msg =>
        msg.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) &&
        'from' in msg &&
        msg.from !== 'tgs-default'
      ).length,
    }));

    return NextResponse.json({
      conversations: conversationsWithSummary,
      total: conversationsWithSummary.length,
      activeCount: conversationsWithSummary.filter(c => c.status === 'ACTIVE').length,
    });

  } catch (error) {
    console.error('Get conversations error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, action } = body;

    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    let success = false;

    switch (action) {
      case 'close':
        success = MessageRouter.closeConversation(conversationId);
        break;

      case 'archive':
        success = MessageRouter.archiveConversation(conversationId);
        break;

      case 'mark-read':
        MessageRouter.markConversationAsRead(conversationId, userId);
        success = true;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update conversation' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      action,
      conversationId,
    });

  } catch (error) {
    console.error('Update conversation error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}