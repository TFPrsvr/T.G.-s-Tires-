"use client";

import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Car,
  ShoppingBag,
  Bell,
  Share2,
  Users,
  BarChart3,
  Home
} from "lucide-react";
import Link from "next/link";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Car className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-lg">T.G.'s Tires</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
              aria-label="Dashboard home"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/listings"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
              aria-label="Tire listings management"
            >
              Tire Listings
            </Link>
            <Link
              href="/dashboard/yard-sale"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
              aria-label="Yard sale items"
            >
              Yard Sale
            </Link>
            <Link
              href="/dashboard/messages"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
              aria-label="Customer messages"
            >
              Messages
            </Link>
            <Link
              href="/dashboard/social-media"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
              aria-label="Social media automation"
            >
              Social Media
            </Link>
            <Link
              href="/dashboard/notifications"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
              aria-label="Notifications center"
            >
              Notifications
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
              aria-label="Account settings"
            >
              Settings
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "shadow-lg border",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b">
        <div className="container px-4">
          <div className="mobile-nav grid grid-cols-4 gap-2 py-2">
            <Link
              href="/dashboard"
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Dashboard home"
            >
              <Home className="h-5 w-5 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Home</span>
            </Link>
            <Link
              href="/dashboard/listings"
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Tire listings management"
            >
              <Car className="h-5 w-5 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Tires</span>
            </Link>
            <Link
              href="/dashboard/yard-sale"
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Yard sale items"
            >
              <ShoppingBag className="h-5 w-5 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Yard Sale</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Account settings"
            >
              <Settings className="h-5 w-5 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" className={cn("container px-4 py-8", className)}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
            <div className="text-sm text-gray-600">
              © 2024 T.G.'s Tires. Professional Tire Marketplace.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}