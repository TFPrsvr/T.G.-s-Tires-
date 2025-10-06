"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { useState } from "react";

export function QuickSettings() {
  const [autoSocialMedia, setAutoSocialMedia] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [teamSync, setTeamSync] = useState(false);


  return (
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
            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300 h-6 w-10"
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
            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300 h-6 w-10"
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
            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300 h-6 w-10"
          />
        </div>
      </CardContent>
    </Card>
  );
}