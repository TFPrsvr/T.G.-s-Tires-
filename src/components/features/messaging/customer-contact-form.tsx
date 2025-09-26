"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, MessageSquare, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { SecurityInputValidator } from '@/lib/security/input-validator';

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  message: string;
  listingId?: string;
  inquiryType: 'general' | 'tire' | 'yard_sale' | 'pricing' | 'service';
}

interface CustomerContactFormProps {
  listingId?: string;
  listingTitle?: string;
  preferredChannel?: 'SMS' | 'EMAIL' | 'IN_APP';
}

export function CustomerContactForm({
  listingId,
  listingTitle,
  preferredChannel = 'EMAIL'
}: CustomerContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    message: '',
    listingId,
    inquiryType: listingId ? 'tire' : 'general',
  });
  const [selectedChannel, setSelectedChannel] = useState<'SMS' | 'EMAIL' | 'IN_APP'>(preferredChannel);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Name is required');
    }

    if (!formData.message.trim()) {
      errors.push('Message is required');
    }

    if (formData.message.length > 2000) {
      errors.push('Message is too long (max 2000 characters)');
    }

    // Validate based on selected channel
    if (selectedChannel === 'SMS') {
      if (!formData.phone.trim()) {
        errors.push('Phone number is required for SMS');
      } else if (!SecurityInputValidator.validatePhoneNumber(formData.phone)) {
        errors.push('Please enter a valid phone number');
      }
    } else if (selectedChannel === 'EMAIL') {
      if (!formData.email.trim()) {
        errors.push('Email is required for email messages');
      } else if (!SecurityInputValidator.validateEmail(formData.email)) {
        errors.push('Please enter a valid email address');
      }
    }

    // Check for suspicious content
    if (SecurityInputValidator.containsSuspiciousPatterns(formData.message)) {
      errors.push('Message contains invalid content');
    }

    return errors;
  };

  const sendMessage = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setSending(true);
    try {
      // Determine customer identifier based on channel
      const customerIdentifier = selectedChannel === 'SMS' ? formData.phone : formData.email;

      // Format message with context
      let messageContent = formData.message;
      if (listingTitle) {
        messageContent = `Regarding: ${listingTitle}\n\n${messageContent}`;
      }
      messageContent += `\n\nCustomer: ${formData.name}`;
      if (selectedChannel === 'SMS' && formData.email) {
        messageContent += `\nEmail: ${formData.email}`;
      } else if (selectedChannel === 'EMAIL' && formData.phone) {
        messageContent += `\nPhone: ${formData.phone}`;
      }

      // Send message through the API
      const response = await fetch('/api/messaging/customer-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerIdentifier,
          channel: selectedChannel,
          message: messageContent,
          customerName: formData.name,
          inquiryType: formData.inquiryType,
          listingId: formData.listingId,
          contactInfo: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
          },
        }),
      });

      if (response.ok) {
        setSent(true);
        toast.success('Message sent successfully! T.G.\'s Tires will respond shortly.');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
          <p className="text-gray-600 mb-4">
            T.G.&apos;s Tires has received your inquiry and will respond shortly via {selectedChannel.toLowerCase()}.
          </p>
          <p className="text-sm text-gray-500">
            Response time is typically within 1-2 business hours during normal business hours.
          </p>
          <Button
            className="mt-6 btn-primary"
            onClick={() => {
              setSent(false);
              setFormData({
                name: '',
                phone: '',
                email: '',
                message: '',
                listingId,
                inquiryType: listingId ? 'tire' : 'general',
              });
            }}
          >
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Contact T.G.&apos;s Tires
        </CardTitle>
        <CardDescription>
          {listingTitle
            ? `Ask about: ${listingTitle}`
            : 'Send a message and get a personal response'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Channel Selection */}
        <div className="space-y-3">
          <Label>How would you like to be contacted?</Label>
          <Tabs value={selectedChannel} onValueChange={(value) => setSelectedChannel(value as typeof selectedChannel)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="EMAIL" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="SMS" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="IN_APP" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                In-App
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Contact Form */}
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="required">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          {/* Email (always shown but required only for EMAIL channel) */}
          <div className="space-y-2">
            <Label htmlFor="email" className={selectedChannel === 'EMAIL' ? 'required' : ''}>
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required={selectedChannel === 'EMAIL'}
            />
            {selectedChannel === 'EMAIL' && (
              <p className="text-xs text-gray-600">
                You&apos;ll receive replies at this email address
              </p>
            )}
          </div>

          {/* Phone (always shown but required only for SMS channel) */}
          <div className="space-y-2">
            <Label htmlFor="phone" className={selectedChannel === 'SMS' ? 'required' : ''}>
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required={selectedChannel === 'SMS'}
            />
            {selectedChannel === 'SMS' && (
              <p className="text-xs text-gray-600">
                You&apos;ll receive text message replies at this number
              </p>
            )}
          </div>

          {/* Inquiry Type */}
          <div className="space-y-2">
            <Label htmlFor="inquiryType">Type of Inquiry</Label>
            <select
              id="inquiryType"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.inquiryType}
              onChange={(e) => handleInputChange('inquiryType', e.target.value)}
            >
              <option value="general">General Question</option>
              <option value="tire">Tire Inquiry</option>
              <option value="yard_sale">Yard Sale Item</option>
              <option value="pricing">Pricing Question</option>
              <option value="service">Rim Mounting Service</option>
            </select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="required">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us what you're looking for or ask your question..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="min-h-[120px]"
              maxLength={2000}
              required
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Be specific to get the best response</span>
              <span>{formData.message.length}/2000</span>
            </div>
          </div>
        </div>

        {/* Channel-specific Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          {selectedChannel === 'EMAIL' && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">Email Response</p>
                <p className="text-gray-600">
                  You&apos;ll receive a detailed email response, typically within 1-2 hours during business hours.
                </p>
              </div>
            </div>
          )}

          {selectedChannel === 'SMS' && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">Text Message Response</p>
                <p className="text-gray-600">
                  You&apos;ll receive a quick text response. For detailed information, we may follow up with a call.
                </p>
              </div>
            </div>
          )}

          {selectedChannel === 'IN_APP' && (
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">In-App Notification</p>
                <p className="text-gray-600">
                  You&apos;ll receive a notification in your account. Create an account to access this feature.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Send Button */}
        <Button
          className="w-full btn-gradient-primary"
          onClick={sendMessage}
          disabled={sending}
        >
          {sending ? (
            <div className="flex items-center gap-2">
              <div className="loading w-4 h-4" />
              Sending Message...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Message via {selectedChannel === 'SMS' ? 'Text' : selectedChannel === 'EMAIL' ? 'Email' : 'App'}
            </div>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500">
          By sending this message, you agree to receive responses from T.G.&apos;s Tires via your selected method.
        </p>
      </CardContent>
    </Card>
  );
}