import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { PaymentProcessor } from '@/lib/payments/payment-processor';
import { SecurityInputValidator } from '@/lib/security/input-validator';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Stripe webhook endpoint signature
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      SecurityInputValidator.logSecurityEvent(
        'STRIPE_WEBHOOK_NO_SIGNATURE',
        { timestamp: new Date().toISOString() },
        'HIGH'
      );
      return NextResponse.json(
        { error: 'No Stripe signature found' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      SecurityInputValidator.logSecurityEvent(
        'STRIPE_WEBHOOK_INVALID_SIGNATURE',
        {
          error: err instanceof Error ? err.message : 'Invalid signature',
          timestamp: new Date().toISOString()
        },
        'HIGH'
      );
      console.error('Stripe webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);

        await PaymentProcessor.handlePaymentSuccess(paymentIntent.id, event);

        SecurityInputValidator.logSecurityEvent(
          'PAYMENT_SUCCEEDED',
          {
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            customerEmail: paymentIntent.receipt_email,
          },
          'LOW'
        );
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);

        await PaymentProcessor.handlePaymentFailure(paymentIntent.id);

        SecurityInputValidator.logSecurityEvent(
          'PAYMENT_FAILED',
          {
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            lastPaymentError: paymentIntent.last_payment_error?.message,
          },
          'MEDIUM'
        );
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment canceled:', paymentIntent.id);

        await PaymentProcessor.handlePaymentFailure(paymentIntent.id);
        break;
      }

      case 'payment_method.attached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        console.log('Payment method attached:', paymentMethod.id);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);

        if (session.payment_intent && typeof session.payment_intent === 'string') {
          await PaymentProcessor.handlePaymentSuccess(session.payment_intent, event);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment succeeded:', invoice.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment failed:', invoice.id);

        SecurityInputValidator.logSecurityEvent(
          'INVOICE_PAYMENT_FAILED',
          {
            invoiceId: invoice.id,
            customerEmail: invoice.customer_email,
            amount: invoice.amount_due,
          },
          'MEDIUM'
        );
        break;
      }

      default: {
        console.log(`Unhandled Stripe event type: ${event.type}`);
        break;
      }
    }

    return NextResponse.json({
      received: true,
      eventType: event.type,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Stripe webhook error:', error);

    SecurityInputValidator.logSecurityEvent(
      'STRIPE_WEBHOOK_ERROR',
      { error: error instanceof Error ? error.message : 'Unknown webhook error' },
      'HIGH'
    );

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Stripe webhook endpoint active',
    supportedEvents: [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'payment_intent.canceled',
      'checkout.session.completed',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
    ],
    timestamp: new Date().toISOString(),
  });
}