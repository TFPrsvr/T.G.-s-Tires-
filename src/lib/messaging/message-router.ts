import { z } from 'zod';
import { db } from '@/lib/db/database';
import type { Notification } from '@/types';

export type MessageChannel = 'SMS' | 'EMAIL' | 'IN_APP';

export interface IncomingMessage {
  id: string;
  from: string; // Customer phone/email/userId
  to: string;   // Business phone/email
  content: string;
  channel: MessageChannel;
  timestamp: Date;
  conversationId: string;
  metadata?: Record<string, any>;
}

export interface OutgoingMessage {
  id: string;
  to: string;   // Customer phone/email/userId
  from: string; // Business phone/email
  content: string;
  channel: MessageChannel;
  timestamp: Date;
  conversationId: string;
  inReplyTo?: string;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  customerIdentifier: string; // phone, email, or userId
  businessId: string;
  channel: MessageChannel;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  lastMessageAt: Date;
  messages: (IncomingMessage | OutgoingMessage)[];
  createdAt: Date;
  updatedAt: Date;
}

export class MessageRouter {
  private static conversations = new Map<string, Conversation>();

  // Create or get existing conversation
  static async getOrCreateConversation(
    customerIdentifier: string,
    businessId: string,
    channel: MessageChannel
  ): Promise<Conversation> {
    const conversationId = this.generateConversationId(customerIdentifier, businessId, channel);

    let conversation = this.conversations.get(conversationId);

    if (!conversation) {
      conversation = {
        id: conversationId,
        customerIdentifier,
        businessId,
        channel,
        status: 'ACTIVE',
        lastMessageAt: new Date(),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.conversations.set(conversationId, conversation);
    }

    return conversation;
  }

  // Process incoming message from customer
  static async handleIncomingMessage(
    from: string,
    content: string,
    channel: MessageChannel,
    businessId: string = 'tgs-default',
    metadata?: Record<string, any>
  ): Promise<IncomingMessage> {
    const conversation = await this.getOrCreateConversation(from, businessId, channel);

    const incomingMessage: IncomingMessage = {
      id: this.generateMessageId(),
      from,
      to: businessId,
      content: this.sanitizeContent(content),
      channel,
      timestamp: new Date(),
      conversationId: conversation.id,
      metadata,
    };

    // Add to conversation
    conversation.messages.push(incomingMessage);
    conversation.lastMessageAt = new Date();
    conversation.updatedAt = new Date();

    // Notify T.G. about new customer message
    await this.notifyBusiness(incomingMessage, conversation);

    // Save conversation
    this.conversations.set(conversation.id, conversation);

    return incomingMessage;
  }

  // Send response back to customer through original channel
  static async sendReply(
    conversationId: string,
    replyContent: string,
    fromBusinessUser: string,
    inReplyToMessageId?: string
  ): Promise<OutgoingMessage | null> {
    const conversation = this.conversations.get(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const outgoingMessage: OutgoingMessage = {
      id: this.generateMessageId(),
      to: conversation.customerIdentifier,
      from: conversation.businessId,
      content: this.sanitizeContent(replyContent),
      channel: conversation.channel,
      timestamp: new Date(),
      conversationId: conversation.id,
      inReplyTo: inReplyToMessageId,
      metadata: {
        sentBy: fromBusinessUser,
        businessReply: true,
      },
    };

    // Add to conversation
    conversation.messages.push(outgoingMessage);
    conversation.lastMessageAt = new Date();
    conversation.updatedAt = new Date();

    // Send through appropriate channel
    const success = await this.deliverMessage(outgoingMessage, conversation);

    if (success) {
      // Save conversation
      this.conversations.set(conversation.id, conversation);
      return outgoingMessage;
    }

    return null;
  }

  // Deliver message through the appropriate channel
  private static async deliverMessage(
    message: OutgoingMessage,
    conversation: Conversation
  ): Promise<boolean> {
    try {
      switch (conversation.channel) {
        case 'SMS':
          return await this.sendSMS(message);

        case 'EMAIL':
          return await this.sendEmail(message);

        case 'IN_APP':
          return await this.sendInAppNotification(message);

        default:
          console.error(`Unsupported channel: ${conversation.channel}`);
          return false;
      }
    } catch (error) {
      console.error('Failed to deliver message:', error);
      return false;
    }
  }

  // SMS delivery via Twilio
  private static async sendSMS(message: OutgoingMessage): Promise<boolean> {
    try {
      // In production, use Twilio client
      const twilioResponse = await fetch('/api/messaging/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: message.to,
          from: process.env.TWILIO_PHONE_NUMBER,
          body: `T.G.'s Tires: ${message.content}`,
        }),
      });

      return twilioResponse.ok;
    } catch (error) {
      console.error('SMS delivery failed:', error);
      return false;
    }
  }

  // Email delivery
  private static async sendEmail(message: OutgoingMessage): Promise<boolean> {
    try {
      const emailResponse = await fetch('/api/messaging/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: message.to,
          from: process.env.BUSINESS_EMAIL || 'noreply@tgstires.com',
          subject: 'Reply from T.G.\'s Tires',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">T.G.'s Tires</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Professional Tire Marketplace</p>
              </div>
              <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
                <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                  ${message.content}
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Reply to this email to continue the conversation, or visit our website at
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #64748b;">tgstires.com</a>
                </p>
              </div>
            </div>
          `,
        }),
      });

      return emailResponse.ok;
    } catch (error) {
      console.error('Email delivery failed:', error);
      return false;
    }
  }

  // In-app notification
  private static async sendInAppNotification(message: OutgoingMessage): Promise<boolean> {
    try {
      // Create in-app notification for the user
      await db.createNotification({
        type: 'IN_APP',
        title: 'Reply from T.G.\'s Tires',
        message: message.content,
        recipient: message.to,
        status: 'PENDING',
        metadata: {
          conversationId: message.conversationId,
          messageId: message.id,
          channel: 'IN_APP',
        },
      });

      return true;
    } catch (error) {
      console.error('In-app notification failed:', error);
      return false;
    }
  }

  // Notify business about new customer message
  private static async notifyBusiness(
    message: IncomingMessage,
    conversation: Conversation
  ): Promise<void> {
    try {
      // Create notification for business owner/admins
      await db.createNotification({
        type: 'IN_APP',
        title: 'New Customer Message',
        message: `Message from ${this.formatCustomerIdentifier(message.from, conversation.channel)}: "${message.content}"`,
        recipient: 'business-owner', // This would be the actual business owner ID
        status: 'PENDING',
        metadata: {
          conversationId: conversation.id,
          messageId: message.id,
          customerIdentifier: message.from,
          channel: conversation.channel,
          priority: 'HIGH',
        },
      });

      // Also send email notification to business owner if configured
      if (process.env.BUSINESS_EMAIL) {
        await fetch('/api/messaging/notify-business', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerMessage: message,
            conversation,
          }),
        });
      }
    } catch (error) {
      console.error('Failed to notify business:', error);
    }
  }

  // Get conversation history
  static getConversation(conversationId: string): Conversation | null {
    return this.conversations.get(conversationId) || null;
  }

  // Get all conversations for a customer
  static getCustomerConversations(customerIdentifier: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter(conv => conv.customerIdentifier === customerIdentifier)
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  // Get all active conversations for business dashboard
  static getActiveConversations(businessId: string = 'tgs-default'): Conversation[] {
    return Array.from(this.conversations.values())
      .filter(conv => conv.businessId === businessId && conv.status === 'ACTIVE')
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  // Mark conversation as read
  static markConversationAsRead(conversationId: string, userId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.updatedAt = new Date();
      // In production, you'd track read status per user
      this.conversations.set(conversationId, conversation);
    }
  }

  // Helper methods
  private static generateConversationId(customer: string, business: string, channel: MessageChannel): string {
    return `${channel}_${customer}_${business}`.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  }

  private static generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static sanitizeContent(content: string): string {
    // Basic content sanitization
    return content
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML
      .slice(0, 2000); // Limit length
  }

  private static formatCustomerIdentifier(identifier: string, channel: MessageChannel): string {
    switch (channel) {
      case 'SMS':
        // Format phone number
        const cleaned = identifier.replace(/\D/g, '');
        if (cleaned.length === 10) {
          return `(${cleaned.substr(0, 3)}) ${cleaned.substr(3, 3)}-${cleaned.substr(6, 4)}`;
        }
        return identifier;

      case 'EMAIL':
        return identifier;

      case 'IN_APP':
        return `User ${identifier}`;

      default:
        return identifier;
    }
  }

  // Close conversation
  static closeConversation(conversationId: string): boolean {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.status = 'CLOSED';
      conversation.updatedAt = new Date();
      this.conversations.set(conversationId, conversation);
      return true;
    }
    return false;
  }

  // Archive conversation
  static archiveConversation(conversationId: string): boolean {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.status = 'ARCHIVED';
      conversation.updatedAt = new Date();
      this.conversations.set(conversationId, conversation);
      return true;
    }
    return false;
  }
}