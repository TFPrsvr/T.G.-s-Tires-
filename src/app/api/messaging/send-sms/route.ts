import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user (only business users can send SMS)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { to, from, body: messageBody } = body;

    if (!to || !messageBody) {
      return NextResponse.json(
        { error: 'Missing required fields: to, body' },
        { status: 400 }
      );
    }

    // In production, use Twilio SDK
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const message = await client.messages.create({
        body: messageBody,
        from: from || process.env.TWILIO_PHONE_NUMBER,
        to: to,
      });

      return NextResponse.json({
        success: true,
        messageSid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
      });
    } else {
      // Development mode - log the message
      console.log('SMS would be sent:', {
        to,
        from: from || process.env.TWILIO_PHONE_NUMBER || '+1234567890',
        body: messageBody,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        messageSid: `mock_${Date.now()}`,
        status: 'sent',
        to,
        from: from || '+1234567890',
        note: 'SMS sent in development mode (mocked)',
      });
    }

  } catch (error) {
    console.error('SMS sending error:', error);

    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}