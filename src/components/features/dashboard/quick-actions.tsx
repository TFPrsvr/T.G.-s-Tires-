"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, Share2, Settings, Bell, Users } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      title: "Add Tire Listing",
      description: "List a new tire for sale with photos and details",
      icon: Plus,
      href: "/dashboard/listings/new",
      variant: "default" as const,
      className: "btn-gradient-primary",
    },
    {
      title: "Add Yard Sale Item",
      description: "List items for your next yard sale",
      icon: Upload,
      href: "/dashboard/yard-sale/new",
      variant: "outline" as const,
      className: "btn-primary",
    },
    {
      title: "Share to Social Media",
      description: "Post your listings to Facebook, Instagram, and more",
      icon: Share2,
      href: "/dashboard/social",
      variant: "outline" as const,
      className: "btn-primary",
    },
    {
      title: "Invite Team Member",
      description: "Add someone to help manage your listings",
      icon: Users,
      href: "/dashboard/team/invite",
      variant: "outline" as const,
      className: "btn-primary",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {actions.map((action, index) => {
        const IconComponent = action.icon;

        return (
          <Card key={index} className="product-card hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-50 p-2 rounded-md">
                  <IconComponent className="h-5 w-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold">{action.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {action.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                asChild
                variant={action.variant}
                className={`w-full ${action.className}`}
                aria-label={action.title}
              >
                <Link href={action.href}>
                  Get Started
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}