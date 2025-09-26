"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Link as LinkIcon,
  DollarSign,
  Send,
  CheckCircle,
  Clock,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { CheckoutForm } from './checkout-form';
import type { TireListing, YardSaleItem } from '@/types';

interface PaymentOptionsProps {
  item: TireListing | YardSaleItem;
  itemType: 'TIRE' | 'YARD_SALE_ITEM';
}

interface PaymentLinkData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  includeRimService: boolean;
}

export function PaymentOptions({ item, itemType }: PaymentOptionsProps) {
  const [linkData, setLinkData] = useState<PaymentLinkData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    includeRimService: false,
  });
  const [generatingLink, setGeneratingLink] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'immediate' | 'link'>('immediate');

  const isTireListing = itemType === 'TIRE' && 'rimServiceAvailable' in item;
  const rimServicePrice = isTireListing && item.rimServiceAvailable ? (item.rimServicePrice || 0) : 0;
  const basePrice = item.price || 0;
  const totalPrice = basePrice + (linkData.includeRimService ? rimServicePrice : 0);

  const handleLinkInputChange = (field: keyof PaymentLinkData, value: string | boolean) => {
    setLinkData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePaymentLink = async () => {
    if (!linkData.customerName.trim() || !linkData.customerEmail.trim()) {
      toast.error('Please provide customer name and email');
      return;
    }

    setGeneratingLink(true);
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice,
          itemId: item.id,
          itemType,
          customerEmail: linkData.customerEmail,
          customerName: linkData.customerName,
          includesRimService: linkData.includeRimService,
          rimServicePrice: linkData.includeRimService ? rimServicePrice : 0,
          paymentType: 'link',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentLink(data.paymentUrl);
        toast.success('Payment link generated successfully!');
      } else {
        toast.error(data.error || 'Failed to generate payment link');
      }
    } catch (error) {
      console.error('Payment link generation error:', error);
      toast.error('Failed to generate payment link');
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      toast.success('Payment link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  const sendLinkViaSMS = async () => {
    if (!linkData.customerPhone?.trim()) {
      toast.error('Phone number is required to send SMS');
      return;
    }

    try {
      const response = await fetch('/api/messaging/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: linkData.customerPhone,
          body: `Hi ${linkData.customerName}! Here's your secure payment link for ${item.title} ($${totalPrice}): ${paymentLink} - T.G.'s Tires`,
        }),
      });

      if (response.ok) {
        toast.success('Payment link sent via SMS!');
      } else {
        toast.error('Failed to send SMS');
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      toast.error('Failed to send SMS');
    }
  };

  const sendLinkViaEmail = async () => {
    try {
      const response = await fetch('/api/messaging/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: linkData.customerEmail,
          subject: `Secure Payment Link - ${item.title} from T.G.'s Tires`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">T.G.'s Tires</h1>
                <p style="margin: 5px 0 0 0;">Secure Payment Link</p>
              </div>
              <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
                <p>Hi ${linkData.customerName},</p>
                <p>Please use the secure link below to complete your payment for:</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0;">${item.title}</h3>
                  <p style="margin: 0; color: #059669; font-size: 18px; font-weight: bold;">$${totalPrice.toFixed(2)}</p>
                  ${linkData.includeRimService ? '<p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">Includes professional rim mounting service</p>' : ''}
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${paymentLink}" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                    Complete Secure Payment
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                  This link is secure and encrypted. Your payment will be processed safely through Stripe.
                </p>
              </div>
            </div>
          `,
        }),
      });

      if (response.ok) {
        toast.success('Payment link sent via email!');
      } else {
        toast.error('Failed to send email');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      toast.error('Failed to send email');
    }
  };

  return (
    <div className="space-y-6">
      {/* Item Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
          <CardDescription>
            {itemType === 'TIRE' ? 'Professional Used Tire' : 'Yard Sale Item'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-lg">Base Price:</span>
            <Badge variant="outline" className="text-lg px-3 py-1">
              ${basePrice.toFixed(2)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Options</CardTitle>
          <CardDescription>
            Choose how you&apos;d like to process the payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'immediate' | 'link')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="immediate" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pay Now
              </TabsTrigger>
              <TabsTrigger value="link" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Send Payment Link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="immediate" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900">Immediate Payment</p>
                    <p className="text-green-700">
                      Process payment right now with credit/debit card or digital wallet
                    </p>
                  </div>
                </div>
                <CheckoutForm item={item} itemType={itemType} />
              </div>
            </TabsContent>

            <TabsContent value="link" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Send Payment Link</p>
                    <p className="text-blue-700">
                      Generate a secure link to send to the customer for later payment
                    </p>
                  </div>
                </div>

                {!paymentLink ? (
                  <div className="space-y-4">
                    {/* Customer Information for Link */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="link-customer-name" className="required">Customer Name</Label>
                        <Input
                          id="link-customer-name"
                          placeholder="Customer's full name"
                          value={linkData.customerName}
                          onChange={(e) => handleLinkInputChange('customerName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link-customer-email" className="required">Customer Email</Label>
                        <Input
                          id="link-customer-email"
                          type="email"
                          placeholder="customer@email.com"
                          value={linkData.customerEmail}
                          onChange={(e) => handleLinkInputChange('customerEmail', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="link-customer-phone">Customer Phone (Optional)</Label>
                      <Input
                        id="link-customer-phone"
                        type="tel"
                        placeholder="(555) 123-4567 - for SMS delivery"
                        value={linkData.customerPhone}
                        onChange={(e) => handleLinkInputChange('customerPhone', e.target.value)}
                      />
                    </div>

                    {/* Rim Service Option */}
                    {isTireListing && item.rimServiceAvailable && (
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="link-rim-service"
                            checked={linkData.includeRimService}
                            onCheckedChange={(checked) => handleLinkInputChange('includeRimService', checked)}
                          />
                          <Label htmlFor="link-rim-service">
                            Include Professional Rim Mounting Service
                          </Label>
                        </div>
                        <span className={linkData.includeRimService ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                          +${rimServicePrice.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Total Price Display */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Payment Amount:</span>
                        <span className="text-2xl font-bold text-green-600">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Generate Link Button */}
                    <Button
                      onClick={generatePaymentLink}
                      disabled={generatingLink || !linkData.customerName.trim() || !linkData.customerEmail.trim()}
                      className="w-full btn-gradient-primary"
                      size="lg"
                    >
                      {generatingLink ? (
                        <div className="flex items-center gap-2">
                          <div className="loading w-4 h-4" />
                          Generating Secure Link...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4" />
                          Generate Payment Link
                        </div>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Success Message */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">Payment Link Generated!</span>
                      </div>
                      <p className="text-green-700 text-sm">
                        Share this secure link with {linkData.customerName} to complete their payment.
                      </p>
                    </div>

                    {/* Payment Link Display */}
                    <div className="space-y-2">
                      <Label>Secure Payment Link</Label>
                      <div className="flex gap-2">
                        <Input
                          value={paymentLink}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          onClick={copyLinkToClipboard}
                          variant="outline"
                          size="sm"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Send Options */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Send Link to Customer</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                          onClick={sendLinkViaEmail}
                          variant="outline"
                          className="btn-primary"
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Send via Email
                        </Button>

                        <Button
                          onClick={sendLinkViaSMS}
                          variant="outline"
                          disabled={!linkData.customerPhone?.trim()}
                          className="btn-primary"
                        >
                          <Smartphone className="h-4 w-4 mr-2" />
                          Send via SMS
                        </Button>
                      </div>

                      <p className="text-xs text-gray-500 text-center">
                        The customer will receive a secure, encrypted link that expires in 24 hours
                      </p>
                    </div>

                    {/* Generate New Link */}
                    <Button
                      onClick={() => {
                        setPaymentLink('');
                        setLinkData({
                          customerName: '',
                          customerEmail: '',
                          customerPhone: '',
                          includeRimService: false,
                        });
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Generate New Link
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}