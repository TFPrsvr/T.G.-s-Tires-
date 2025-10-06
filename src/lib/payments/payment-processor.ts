import Stripe from 'stripe';
import { db } from '@/lib/db/database';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface CreatePaymentIntentParams {
  amount: number; // in dollars
  currency?: string;
  itemId: string;
  itemType: 'TIRE' | 'YARD_SALE_ITEM';
  customerEmail: string;
  customerName?: string;
  includesRimService?: boolean;
  rimServicePrice?: number;
  metadata?: Record<string, string>;
}

export class PaymentProcessor {
  // Create a payment intent for immediate payment
  static async createPaymentIntent({
    amount,
    currency = 'usd',
    itemId,
    itemType,
    customerEmail,
    customerName,
    includesRimService = false,
    rimServicePrice = 0,
    metadata = {},
  }: CreatePaymentIntentParams): Promise<PaymentIntent> {
    try {
      // Convert dollars to cents for Stripe
      const totalAmount = Math.round((amount + (includesRimService ? rimServicePrice : 0)) * 100);

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          itemId,
          itemType,
          customerEmail,
          customerName: customerName || '',
          includesRimService: includesRimService.toString(),
          rimServicePrice: rimServicePrice.toString(),
          businessName: "T.G.'s Tires",
          ...metadata,
        },
        description: `Payment for ${itemType.toLowerCase().replace('_', ' ')} from T.G.'s Tires`,
        receipt_email: customerEmail,
      });

      // Store payment record in database
      await db.createPayment({
        amount: totalAmount / 100, // Convert back to dollars for database
        currency: currency.toUpperCase(),
        status: 'PENDING',
        paymentMethod: 'STRIPE',
        stripePaymentIntentId: paymentIntent.id,
        itemId,
        itemType,
        includesRimService,
        rimServicePrice,
        tabId: customerEmail, // Using email as identifier for now
        tabEmail: customerEmail,
        companyName: "T.G.'s Tires",
        receiptSent: false,
      });

      return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret!,
        amount: totalAmount,
        currency,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Create a payment link for "pay later" option
  static async createPaymentLink({
    amount,
    currency = 'usd',
    itemId,
    itemType,
    customerEmail,
    customerName,
    includesRimService = false,
    rimServicePrice = 0,
    metadata = {},
  }: CreatePaymentIntentParams): Promise<{ url: string; id: string }> {
    try {
      const totalAmount = Math.round((amount + (includesRimService ? rimServicePrice : 0)) * 100);

      // Create a payment link that can be sent to customer
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: `${itemType.replace('_', ' ')} from T.G.'s Tires`,
                description: includesRimService
                  ? `Includes tire mounting service ($${rimServicePrice})`
                  : 'Professional tire or yard sale item',
                metadata: {
                  itemId,
                  itemType,
                },
              },
              unit_amount: totalAmount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          itemId,
          itemType,
          customerEmail,
          customerName: customerName || '',
          includesRimService: includesRimService.toString(),
          rimServicePrice: rimServicePrice.toString(),
          businessName: "T.G.'s Tires",
          ...metadata,
        },
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          },
        },
      });

      // Store payment record
      await db.createPayment({
        amount: totalAmount / 100,
        currency: currency.toUpperCase(),
        status: 'PENDING',
        paymentMethod: 'STRIPE',
        stripePaymentIntentId: paymentLink.id,
        itemId,
        itemType,
        includesRimService,
        rimServicePrice,
        tabId: customerEmail,
        tabEmail: customerEmail,
        companyName: "T.G.'s Tires",
        receiptSent: false,
      });

      return {
        url: paymentLink.url,
        id: paymentLink.id,
      };
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw new Error('Failed to create payment link');
    }
  }

  // Handle successful payment webhook
  static async handlePaymentSuccess(paymentIntentId: string, stripeEvent: Stripe.Event): Promise<void> {
    try {
      const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;

      // Update payment record in database
      const paymentRecord = await this.getPaymentByStripeId(paymentIntentId);

      if (paymentRecord) {
        await db.updatePayment(paymentRecord.id, {
          status: 'PAID',
          receiptSent: true,
        });

        // Send receipt email
        await this.sendReceipt(paymentRecord, paymentIntent);

        // Notify business owner
        await this.notifyBusinessOfPayment(paymentRecord, paymentIntent);

        console.log(`Payment completed: ${paymentIntentId}`);
      }
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  }

  // Handle failed payment
  static async handlePaymentFailure(paymentIntentId: string): Promise<void> {
    try {
      const paymentRecord = await this.getPaymentByStripeId(paymentIntentId);

      if (paymentRecord) {
        await db.updatePayment(paymentRecord.id, {
          status: 'FAILED',
        });

        console.log(`Payment failed: ${paymentIntentId}`);
      }
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }

  // Get payment record by Stripe ID
  private static async getPaymentByStripeId(_stripeId: string): Promise<Payment | null> {
    // This would need to be implemented in your database layer
    // For now, returning null as placeholder
    return null;
  }

  // Send receipt email to customer
  private static async sendReceipt(payment: Payment, _paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const receiptHtml = this.generateReceiptHTML(payment, paymentIntent);

      await fetch('/api/messaging/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: payment.tabEmail,
          subject: `Receipt from T.G.'s Tires - Payment Confirmation`,
          html: receiptHtml,
        }),
      });
    } catch (error) {
      console.error('Error sending receipt:', error);
    }
  }

  // Notify business owner of new payment
  private static async notifyBusinessOfPayment(payment: Payment, _paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      await db.createNotification({
        type: 'IN_APP',
        title: 'Payment Received',
        message: `New payment of $${payment.amount} received from ${payment.tabEmail} for ${payment.itemType.toLowerCase().replace('_', ' ')}.`,
        recipient: 'business-owner',
        status: 'PENDING',
        metadata: {
          paymentId: payment.id,
          stripePaymentIntentId: payment.stripePaymentIntentId,
          amount: payment.amount,
          customerEmail: payment.tabEmail,
        },
      });
    } catch (error) {
      console.error('Error notifying business:', error);
    }
  }

  // Generate HTML receipt
  private static generateReceiptHTML(payment: Payment, _paymentIntent: Stripe.PaymentIntent): string {
    const receiptDate = new Date().toLocaleDateString();
    const receiptTime = new Date().toLocaleTimeString();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Receipt from T.G.'s Tires</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">T.G.'s Tires</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 16px;">Professional Tire Marketplace</p>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #059669; margin: 0 0 20px 0; display: flex; align-items: center;">
              ✓ Payment Confirmed
            </h2>

            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for your payment! Your transaction has been processed successfully.
            </p>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937;">Payment Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Receipt #:</td>
                  <td style="padding: 8px 0; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${payment.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Date & Time:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${receiptDate} at ${receiptTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Item:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${payment.itemType.replace('_', ' ')}</td>
                </tr>
                ${payment.includesRimService ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Rim Mounting Service:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">$${payment.rimServicePrice}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Total Amount:</td>
                  <td style="padding: 8px 0; font-weight: 700; font-size: 18px; color: #059669;">$${payment.amount}</td>
                </tr>
              </table>
            </div>

            <div style="margin: 25px 0; padding: 20px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px;">
              <p style="margin: 0; color: #92400e; font-weight: 600;">
                🏪 Ready for Pickup or Delivery
              </p>
              <p style="margin: 8px 0 0 0; color: #92400e;">
                We'll contact you within 24 hours to arrange pickup or delivery of your tire(s).
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Visit Our Marketplace
              </a>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
            <p>T.G.'s Tires - Professional Tire Marketplace</p>
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `;
  }
}

export default PaymentProcessor;