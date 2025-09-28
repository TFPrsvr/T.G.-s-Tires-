import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <Link href="/" className="text-2xl font-bold text-gray-900">
                T.G.'s Tires
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
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <CardDescription className="text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>

              <h3 className="text-xl font-medium mb-2">Personal Information</h3>
              <p className="mb-4">
                When you create an account or use our services, we may collect:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Name and contact information (email, phone number, address)</li>
                <li>Business information and seller details</li>
                <li>Payment and billing information</li>
                <li>Profile pictures and business logos</li>
              </ul>

              <h3 className="text-xl font-medium mb-2">Listing Information</h3>
              <p className="mb-4">
                When you create tire or yard sale listings, we collect:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Product descriptions, photos, and pricing</li>
                <li>Location and contact preferences</li>
                <li>Transaction history and customer interactions</li>
              </ul>

              <h3 className="text-xl font-medium mb-2">Usage Data</h3>
              <p className="mb-4">
                We automatically collect information about how you use our platform:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>IP address and device information</li>
                <li>Browser type and operating system</li>
                <li>Pages visited and features used</li>
                <li>Search queries and preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Provide and maintain our tire marketplace services</li>
                <li>Process transactions and facilitate communications between buyers and sellers</li>
                <li>Send important updates about your account and listings</li>
                <li>Improve our platform and develop new features</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations and resolve disputes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>

              <h3 className="text-xl font-medium mb-2">With Other Users</h3>
              <p className="mb-4">
                Your public listings and seller profile information are visible to platform users to facilitate transactions.
              </p>

              <h3 className="text-xl font-medium mb-2">With Service Providers</h3>
              <p className="mb-4">
                We share information with trusted third-party services that help us operate our platform:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Payment processors (Stripe) for secure transactions</li>
                <li>Cloud hosting services for data storage and security</li>
                <li>Email and SMS services for communications</li>
                <li>Analytics services to improve our platform</li>
              </ul>

              <h3 className="text-xl font-medium mb-2">Legal Requirements</h3>
              <p className="mb-4">
                We may disclose information when required by law or to protect our rights and the safety of our users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure payment processing through certified providers</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights and Choices</h2>

              <h3 className="text-xl font-medium mb-2">Account Management</h3>
              <p className="mb-4">
                You can update your account information and privacy preferences at any time through your dashboard settings.
              </p>

              <h3 className="text-xl font-medium mb-2">Data Access and Portability</h3>
              <p className="mb-4">
                You have the right to request a copy of your personal data and to transfer it to another service.
              </p>

              <h3 className="text-xl font-medium mb-2">Data Deletion</h3>
              <p className="mb-4">
                You can request deletion of your account and personal data. Some information may be retained for legal and business purposes.
              </p>

              <h3 className="text-xl font-medium mb-2">Communication Preferences</h3>
              <p className="mb-4">
                You can opt out of promotional communications while still receiving important account-related messages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Remember your preferences and settings</li>
                <li>Analyze platform usage and performance</li>
                <li>Provide personalized content and recommendations</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="mb-4">
                You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
              <p className="mb-4">
                Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this privacy policy periodically. We will notify you of significant changes through email or platform notifications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>T.G.'s Tires</strong></p>
                <p>Email: privacy@tgstires.com</p>
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
              © 2024 T.G.'s Tires. Professional tire marketplace.
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