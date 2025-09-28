"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Upload, Share2, Settings, Bell, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function QuickActions() {
  const [autoSocialMedia, setAutoSocialMedia] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [teamSync, setTeamSync] = useState(false);

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
      href: "/dashboard/social-media",
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
    <div className="space-y-6">
      {/* Quick Action Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {actions.map((action, index) => {
          const IconComponent = action.icon;

          return (
            <Card key={index} className="product-card hover:shadow-lg transition-all duration-200 flex flex-col h-full">
              <CardHeader className="pb-3 flex-1">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-50 p-2 rounded-md flex-shrink-0">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base font-semibold">{action.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-600 leading-relaxed">
                      {action.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 mt-auto">
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

      {/* Quick Settings Toggles */}
      <Card className="product-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Quick Settings
          </CardTitle>
          <CardDescription>
            Toggle common settings for faster workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Auto Social Media</div>
              <div className="text-xs text-gray-600">Automatically post new listings to social media</div>
            </div>
            <Switch
              checked={autoSocialMedia}
              onCheckedChange={setAutoSocialMedia}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Push Notifications</div>
              <div className="text-xs text-gray-600">Get notified about messages and activity</div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Team Sync</div>
              <div className="text-xs text-gray-600">Share listings with team members automatically</div>
            </div>
            <Switch
              checked={teamSync}
              onCheckedChange={setTeamSync}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}