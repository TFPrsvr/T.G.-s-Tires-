import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user (only business users can send emails)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { to, from, subject, html, text } = body;

    if (!to || (!html && !text)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, and either html or text' },
        { status: 400 }
      );
    }

    // Priority 1: Use SendGrid if API key is available
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: to,
        from: from || process.env.SENDGRID_FROM_EMAIL || 'noreply@tgstires.com',
        subject: subject || 'Message from T.G.\'s Tires',
        text: text || undefined,
        html: html || undefined,
        replyTo: from || process.env.NEXT_PUBLIC_BUSINESS_EMAIL || process.env.SENDGRID_FROM_EMAIL,
      };

      const result = await sgMail.send(msg);

      return NextResponse.json({
        success: true,
        messageId: result[0].headers['x-message-id'],
        provider: 'SendGrid',
        statusCode: result[0].statusCode,
      });
    }
    // Priority 2: Use SMTP if configured
    else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: from || process.env.SMTP_USER,
        to: to,
        subject: subject || 'Message from T.G.\'s Tires',
        html: html || undefined,
        text: text || undefined,
        replyTo: from || process.env.NEXT_PUBLIC_BUSINESS_EMAIL || process.env.SMTP_USER,
      };

      const info = await transporter.sendMail(mailOptions);

      return NextResponse.json({
        success: true,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        provider: 'SMTP',
        response: info.response,
      });
    } else {
      // Development mode - log the email
      console.log('📧 Email would be sent:', {
        to,
        from: from || process.env.SENDGRID_FROM_EMAIL || 'noreply@tgstires.com',
        subject: subject || 'Message from T.G.\'s Tires',
        html: html ? `HTML content (${html.length} chars)` : undefined,
        text: text ? `Text content (${text.length} chars)` : undefined,
        provider: 'Development Mode',
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        messageId: `mock_${Date.now()}@tgstires.com`,
        accepted: [to],
        rejected: [],
        provider: 'Development Mode',
        note: 'Email sent in development mode (mocked)',
      });
    }

  } catch (error) {
    console.error('Email sending error:', error);

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}