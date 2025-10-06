import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <Link href="/" className="text-2xl font-bold text-gray-900">
                T.G.&apos;s Tires
              </Link>
            </div>
            <Button asChild className="btn-primary">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <CardDescription className="text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using T.G.&apos;s Tires marketplace platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Platform Description</h2>
              <p className="mb-4">
                T.G.&apos;s Tires operates an online marketplace platform that connects tire sellers with potential buyers. Our platform facilitates:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Listing and selling used tires and automotive products</li>
                <li>Yard sale item listings and marketplace services</li>
                <li>Professional tire mounting and rim services</li>
                <li>Secure payment processing and transaction management</li>
                <li>Communication tools between buyers and sellers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>

              <h3 className="text-xl font-medium mb-2">Account Creation</h3>
              <p className="mb-4">
                To use our services, you must create an account and provide accurate, complete information. You are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your contact information remains current</li>
              </ul>

              <h3 className="text-xl font-medium mb-2">Eligibility</h3>
              <p className="mb-4">
                You must be at least 18 years old and legally capable of entering into binding contracts to use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Seller Responsibilities</h2>

              <h3 className="text-xl font-medium mb-2">Listing Requirements</h3>
              <p className="mb-4">
                As a seller, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Provide accurate and complete product descriptions</li>
                <li>Use only genuine photos of the actual items being sold</li>
                <li>Set fair and reasonable prices</li>
                <li>Honor all posted prices and terms of sale</li>
                <li>Respond promptly to buyer inquiries</li>
              </ul>

              <h3 className="text-xl font-medium mb-2">Product Quality</h3>
              <p className="mb-4">
                Sellers warrant that all tires and products listed:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Are accurately described in terms of condition and specifications</li>
                <li>Are safe for intended use and free from defects that would make them unsafe</li>
                <li>Have been properly stored and maintained</li>
                <li>Meet all applicable safety standards and regulations</li>
              </ul>

              <h3 className="text-xl font-medium mb-2">Professional Services</h3>
              <p className="mb-4">
                If offering mounting, balancing, or other professional services, sellers must:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Possess appropriate licenses and certifications</li>
                <li>Maintain proper insurance coverage</li>
                <li>Follow industry-standard safety practices</li>
                <li>Provide warranties as required by local law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Buyer Responsibilities</h2>
              <p className="mb-4">
                As a buyer, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Pay for purchases promptly and in the agreed manner</li>
                <li>Inspect products upon delivery or pickup</li>
                <li>Communicate respectfully with sellers</li>
                <li>Follow through on committed purchases</li>
                <li>Report any issues or disputes in a timely manner</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Payments and Fees</h2>

              <h3 className="text-xl font-medium mb-2">Payment Processing</h3>
              <p className="mb-4">
                We use Stripe for secure payment processing. By using our payment services, you agree to Stripe&apos;s terms of service.
              </p>

              <h3 className="text-xl font-medium mb-2">Platform Fees</h3>
              <p className="mb-4">
                We may charge fees for certain services, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Transaction processing fees</li>
                <li>Premium listing features</li>
                <li>Additional marketplace tools and services</li>
              </ul>

              <h3 className="text-xl font-medium mb-2">Refunds and Disputes</h3>
              <p className="mb-4">
                Refund policies are determined by individual sellers. T.G.&apos;s Tires may mediate disputes but is not responsible for refunds or returns.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Prohibited Activities</h2>
              <p className="mb-4">
                Users may not:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>List stolen, counterfeit, or illegal items</li>
                <li>Misrepresent product condition or specifications</li>
                <li>Engage in fraudulent or deceptive practices</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Interfere with platform operations or other users</li>
                <li>Use the platform for any unlawful purpose</li>
                <li>Share contact information to circumvent platform fees</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Content and Intellectual Property</h2>

              <h3 className="text-xl font-medium mb-2">User Content</h3>
              <p className="mb-4">
                You retain ownership of content you submit but grant us a license to display, distribute, and promote your listings on our platform.
              </p>

              <h3 className="text-xl font-medium mb-2">Platform Content</h3>
              <p className="mb-4">
                Our platform design, features, and proprietary content are protected by intellectual property laws and may not be copied or reproduced.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="mb-4">
                T.G.&apos;s Tires acts as a marketplace platform connecting buyers and sellers. We are not responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>The quality, safety, or legality of listed items</li>
                <li>The accuracy of listings or seller representations</li>
                <li>The completion of transactions between users</li>
                <li>Any damages arising from transactions or platform use</li>
                <li>Third-party services or external websites</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Account Termination</h2>
              <p className="mb-4">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in prohibited activities. Users may also close their accounts at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Dispute Resolution</h2>
              <p className="mb-4">
                Any disputes arising from use of our platform will be resolved through binding arbitration in accordance with the laws of Illinois.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
              <p className="mb-4">
                We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
              <p className="mb-4">
                For questions about these terms of service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>T.G.&apos;s Tires</strong></p>
                <p>Email: legal@tgstires.com</p>
                <p>Phone: (217) 555-0123</p>
                <p>Address: 456 Tire Street, Springfield, IL 62701</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
              © 2024 T.G.&apos;s Tires. Professional tire marketplace.
            </div>
            <div className="flex space-x-6 text-gray-600">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}