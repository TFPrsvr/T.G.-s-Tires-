import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Store, Bell, Shield, CreditCard, Globe, Trash2, Save } from "lucide-react";

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage your account and business preferences."
      />

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  placeholder="John"
                  defaultValue="T.G."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  placeholder="Smith"
                  defaultValue="Owner"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                defaultValue="owner@tgstires.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                defaultValue="(217) 555-0123"
              />
            </div>

            <div className="flex gap-2">
              <Button className="btn-gradient-primary">
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Configure your business details and marketplace presence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                placeholder="T.G.'s Tires"
                defaultValue="T.G.'s Tires"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="business-description">Business Description</Label>
              <Textarea
                id="business-description"
                placeholder="Professional tire sales and mounting services..."
                defaultValue="Professional tire sales and mounting services with over 20 years of experience. We specialize in quality used tires and expert rim mounting."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="business-address">Business Address</Label>
                <Input
                  id="business-address"
                  placeholder="123 Main St, Springfield, IL"
                  defaultValue="456 Tire Street, Springfield, IL 62701"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="business-hours">Business Hours</Label>
                <Input
                  id="business-hours"
                  placeholder="Mon-Fri 8AM-6PM"
                  defaultValue="Mon-Fri 8AM-6PM, Sat 8AM-4PM"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="btn-gradient-primary">
                <Save className="mr-2 h-4 w-4" />
                Save Business Info
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Control how and when you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-600">Receive important updates via text</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Desktop Notifications</Label>
                  <p className="text-sm text-gray-600">Show notifications in your browser</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Communications</Label>
                  <p className="text-sm text-gray-600">Receive product updates and promotions</p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment & Billing
            </CardTitle>
            <CardDescription>
              Manage your payment methods and billing preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="default-currency">Default Currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD - US Dollar</SelectItem>
                  <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="eur">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-accept payments</Label>
                <p className="text-sm text-gray-600">Automatically accept payments under $500</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Payment confirmations</Label>
                <p className="text-sm text-gray-600">Send email confirmations for all payments</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="pt-4">
              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Payment Methods
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Control your privacy settings and account security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile visibility</Label>
                <p className="text-sm text-gray-600">Make your profile visible to other users</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show contact information</Label>
                <p className="text-sm text-gray-600">Display phone and email on listings</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics tracking</Label>
                <p className="text-sm text-gray-600">Help us improve our service with usage data</p>
              </div>
              <Switch />
            </div>

            <div className="pt-4 space-y-2">
              <Button variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              <Button variant="outline">
                <Globe className="mr-2 h-4 w-4" />
                Download My Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium text-red-900">Delete Account</h4>
                <p className="text-sm text-red-700">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <Button variant="destructive">
                Delete Account
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
              <div>
                <h4 className="font-medium text-orange-900">Reset All Settings</h4>
                <p className="text-sm text-orange-700">
                  Reset all settings to default values.
                </p>
              </div>
              <Button variant="outline">
                Reset Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}