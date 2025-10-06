"use client";

import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Shield, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import getStripe, { STRIPE_CONFIG } from '@/lib/payments/stripe-config';
import type { TireListing, YardSaleItem } from '@/types';

interface CheckoutFormProps {
  item: TireListing | YardSaleItem;
  itemType: 'TIRE' | 'YARD_SALE_ITEM';
}

interface PaymentFormData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  includeRimService: boolean;
}

// Inner form component that uses Stripe hooks
function CheckoutFormInner({ item, itemType }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [formData, setFormData] = useState<PaymentFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    includeRimService: false,
  });
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');

  const isTireListing = itemType === 'TIRE' && 'rimServiceAvailable' in item;
  const rimServicePrice = isTireListing && item.rimServiceAvailable ? (item.rimServicePrice || 0) : 0;
  const basePrice = item.price || 0;
  const totalPrice = basePrice + (formData.includeRimService ? rimServicePrice : 0);

  // Create payment intent when form data changes
  useEffect(() => {
    if (formData.customerEmail && formData.customerName) {
      createPaymentIntent();
    }
  }, [formData.customerEmail, formData.customerName, formData.includeRimService]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice,
          itemId: item.id,
          itemType,
          customerEmail: formData.customerEmail,
          customerName: formData.customerName,
          includesRimService: formData.includeRimService,
          rimServicePrice: formData.includeRimService ? rimServicePrice : 0,
          paymentType: 'immediate',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClientSecret(data.clientSecret);
      } else {
        toast.error(data.error || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment intent creation error:', error);
      toast.error('Failed to initialize payment');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!clientSecret) {
      toast.error('Payment not initialized. Please check your information.');
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
          receipt_email: formData.customerEmail,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment error:', error);
        toast.error(error.message || 'Payment failed');
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        toast.success('Payment successful!');
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast.error('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (succeeded) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase! You&apos;ll receive a receipt via email shortly.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Next Steps:</strong> T.G.&apos;s Tires will contact you within 24 hours to arrange pickup or delivery.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Checkout
        </CardTitle>
        <CardDescription>
          Complete your purchase with secure payment processing by Stripe
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{item.title}</span>
              <span>${basePrice.toFixed(2)}</span>
            </div>
            {isTireListing && item.rimServiceAvailable && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="rim-service"
                    checked={formData.includeRimService}
                    onCheckedChange={(checked) => handleInputChange('includeRimService', checked)}
                  />
                  <Label htmlFor="rim-service" className="text-sm">
                    Professional Rim Mounting
                  </Label>
                </div>
                <span className={formData.includeRimService ? 'text-green-600' : 'text-gray-400'}>
                  ${rimServicePrice.toFixed(2)}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="font-semibold">Customer Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name" className="required">Full Name</Label>
              <Input
                id="customer-name"
                placeholder="Enter your full name"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-email" className="required">Email Address</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="your@email.com"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-phone">Phone Number (Optional)</Label>
            <Input
              id="customer-phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
            />
          </div>
        </div>

        {/* Payment Form */}
        {clientSecret && formData.customerEmail && formData.customerName && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Payment Information</Label>
              <div className="border rounded-lg p-4">
                <PaymentElement
                  options={{
                    layout: 'tabs',
                    business: {
                      name: "T.G.'s Tires",
                    },
                  }}
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Secure Payment Processing</p>
                <p className="text-blue-700">
                  Your payment information is encrypted and processed securely by Stripe.
                </p>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              type="submit"
              disabled={!stripe || processing}
              className="w-full btn-gradient-primary"
              size="lg"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="loading w-4 h-4" />
                  Processing Payment...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Pay ${totalPrice.toFixed(2)}
                </div>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              By completing this purchase, you agree to T.G.&apos;s Tires terms of service.
            </p>
          </form>
        )}

        {!clientSecret && formData.customerEmail && formData.customerName && (
          <div className="flex items-center justify-center py-8">
            <div className="loading w-6 h-6" />
            <span className="ml-2">Initializing secure payment...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main component that wraps with Stripe Elements provider
export function CheckoutForm({ item, itemType }: CheckoutFormProps) {
  const [stripePromise] = useState(() => getStripe());

  const options = {
    appearance: STRIPE_CONFIG.APPEARANCE,
    loader: 'auto' as const,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutFormInner item={item} itemType={itemType} />
    </Elements>
  );
}