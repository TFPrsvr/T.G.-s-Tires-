import { Suspense } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";

function PaymentSuccessContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">
              Payment Successful! 🎉
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your purchase from T.G.&apos;s Tires
            </p>
          </div>

          {/* What Happens Next */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              What Happens Next?
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-blue-900">Receipt Sent</p>
                  <p className="text-blue-700 text-sm">
                    A detailed receipt has been sent to your email address
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-blue-900">We&apos;ll Contact You</p>
                  <p className="text-blue-700 text-sm">
                    T.G.&apos;s Tires will reach out within 24 hours to arrange pickup or delivery
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-blue-900">Get Your Tire(s)</p>
                  <p className="text-blue-700 text-sm">
                    Pick up your tire(s) or have them delivered and professionally mounted
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              Need to Contact T.G.&apos;s Tires?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Call or Text</p>
                  <p className="text-sm text-gray-600">
                    {process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(555) 123-4567'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Send Message</p>
                  <p className="text-sm text-gray-600">
                    Use our contact form for questions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              asChild
              variant="outline"
              className="btn-primary"
            >
              <Link href="/" className="flex items-center gap-2">
                Browse More Tires
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <Button
              asChild
              className="btn-gradient-primary"
            >
              <Link href="/contact" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Contact T.G.&apos;s Tires
              </Link>
            </Button>
          </div>

          {/* Professional Service Notice */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
              <CheckCircle className="w-4 h-4" />
              Professional tire mounting and balancing available
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t">
            <p className="text-gray-600 mb-2">
              Thank you for choosing T.G.&apos;s Tires!
            </p>
            <p className="text-sm text-gray-500">
              Your payment was processed securely by Stripe
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading w-8 h-8" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}