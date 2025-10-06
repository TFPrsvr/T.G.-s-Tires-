import { NextRequest, NextResponse } from 'next/server';
import { PaymentProcessor } from '@/lib/payments/payment-processor';
import { SecurityInputValidator } from '@/lib/security/input-validator';
import { RateLimiter } from '@/lib/security/rate-limiter';

export async function POST(_request: NextRequest) {
  try {
    const clientIP = request.ip || '127.0.0.1';

    // Rate limiting for payment creation
    const rateLimitResult = RateLimiter.check(clientIP, 'API');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      amount,
      itemId,
      itemType,
      customerEmail,
      customerName,
      includesRimService = false,
      rimServicePrice = 0,
      paymentType = 'immediate', // 'immediate' or 'link'
    } = body;

    // Validate required fields
    if (!amount || !itemId || !itemType || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, itemId, itemType, customerEmail' },
        { status: 400 }
      );
    }

    // Validate email
    if (!SecurityInputValidator.validateEmail(customerEmail)) {
      SecurityInputValidator.logSecurityEvent(
        'INVALID_PAYMENT_EMAIL',
        { email: customerEmail, itemId, itemType },
        'MEDIUM'
      );
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate amount
    if (!SecurityInputValidator.validatePrice(amount)) {
      SecurityInputValidator.logSecurityEvent(
        'INVALID_PAYMENT_AMOUNT',
        { amount, itemId, itemType, customerEmail },
        'HIGH'
      );
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    // Validate item type
    if (!['TIRE', 'YARD_SALE_ITEM'].includes(itemType)) {
      return NextResponse.json(
        { error: 'Invalid item type' },
        { status: 400 }
      );
    }

    // Validate rim service price if included
    if (includesRimService && !SecurityInputValidator.validatePrice(rimServicePrice)) {
      return NextResponse.json(
        { error: 'Invalid rim service price' },
        { status: 400 }
      );
    }

    try {
      if (paymentType === 'link') {
        // Create payment link for "pay later" option
        const paymentLink = await PaymentProcessor.createPaymentLink({
          amount: parseFloat(amount),
          itemId,
          itemType,
          customerEmail,
          customerName,
          includesRimService,
          rimServicePrice: parseFloat(rimServicePrice || 0),
          metadata: {
            createdBy: 'api',
            clientIP,
            timestamp: new Date().toISOString(),
          },
        });

        return NextResponse.json({
          success: true,
          type: 'payment_link',
          paymentUrl: paymentLink.url,
          paymentId: paymentLink.id,
        });
      } else {
        // Create payment intent for immediate payment
        const paymentIntent = await PaymentProcessor.createPaymentIntent({
          amount: parseFloat(amount),
          itemId,
          itemType,
          customerEmail,
          customerName,
          includesRimService,
          rimServicePrice: parseFloat(rimServicePrice || 0),
          metadata: {
            createdBy: 'api',
            clientIP,
            timestamp: new Date().toISOString(),
          },
        });

        return NextResponse.json({
          success: true,
          type: 'payment_intent',
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        });
      }
    } catch (stripeError) {
      console.error('Stripe payment creation error:', stripeError);

      SecurityInputValidator.logSecurityEvent(
        'PAYMENT_CREATION_ERROR',
        {
          error: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error',
          customerEmail,
          itemId,
          itemType,
        },
        'HIGH'
      );

      return NextResponse.json(
        { error: 'Failed to create payment. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Payment creation error:', error);

    SecurityInputValidator.logSecurityEvent(
      'PAYMENT_API_ERROR',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'MEDIUM'
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    status: 'Payment creation endpoint active',
    supportedTypes: ['immediate', 'link'],
    supportedItemTypes: ['TIRE', 'YARD_SALE_ITEM'],
    timestamp: new Date().toISOString(),
  });
}