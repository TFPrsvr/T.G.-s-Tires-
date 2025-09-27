import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Car, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  // If user is authenticated, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">T.G.'s Tires</span>
          </div>
          <div className="flex items-center gap-6 space-x-4">
            <a
              href="/sign-in"
              className="btn-primary"
              style={{
                background: '#ffffff',
                color: '#64748b',
                padding: '16px 32px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '18px',
                border: '2px solid #64748b',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '160px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              Sign In
            </a>
            <a
              href="/sign-up"
              className="btn-gradient-primary"
              style={{
                background: 'linear-gradient(to right, #64748b, #475569)',
                color: '#ffffff',
                padding: '16px 32px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '18px',
                border: 'none',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '160px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              Get Started
            </a>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Professional Tire Marketplace
            <span className="block text-blue-600 mt-2">with Secure Payments</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            List your used tires, offer professional rim mounting services, and sell yard sale items.
            Accept secure payments and manage everything from one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <a
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 py-6 text-lg font-semibold text-white rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              style={{
                background: 'linear-gradient(to right, #64748b, #475569)',
                minWidth: '200px'
              }}
            >
              Start Selling Today
            </a>
            <a
              href="/marketplace"
              className="inline-flex items-center justify-center px-8 py-6 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              style={{
                background: '#ffffff',
                color: '#64748b',
                border: '2px solid #64748b',
                minWidth: '200px'
              }}
            >
              Browse Marketplace
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Car className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Tire Listings</h3>
              <p className="text-gray-600">
                Upload photos, set prices, and offer rim mounting services with detailed tire specifications.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Accept payments online through Stripe or collect cash on delivery with automatic receipts.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Social Media Integration</h3>
              <p className="text-gray-600">
                Automatically post your listings to Facebook Marketplace, Instagram, and other platforms.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center bg-white rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Tire Business?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of tire sellers who trust T.G.'s Tires for their marketplace needs.
            Professional tools, secure payments, and unlimited listings.
          </p>
          <a
            href="/sign-up"
            className="inline-flex items-center justify-center px-8 py-6 text-lg font-semibold text-white rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
            style={{
              background: 'linear-gradient(to right, #64748b, #475569)',
              minWidth: '220px'
            }}
          >
            Create Free Account
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-4 mt-16 border-t">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <div className="text-sm text-gray-600">
            © 2024 T.G.'s Tires. Professional tire marketplace.
          </div>
          <div className="flex space-x-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}