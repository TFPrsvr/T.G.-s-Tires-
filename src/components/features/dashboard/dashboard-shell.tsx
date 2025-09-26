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
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="sr-only">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="listings" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                <span className="sr-only">Listings</span>
              </TabsTrigger>
              <TabsTrigger value="yard-sale" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="sr-only">Yard Sale</span>
              </TabsTrigger>
              <TabsTrigger value="more" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="sr-only">More</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" className={cn("container px-4 py-8", className)}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              © 2024 T.G.'s Tires. Professional tire marketplace with secure payments.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Separator orientation="vertical" className="h-4" />
              <Link href="/terms" className="hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
              <Separator orientation="vertical" className="h-4" />
              <Link href="/contact" className="hover:text-blue-600 transition-colors">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}