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
import { ArrowLeft, Send, Users, UserPlus } from "lucide-react";
import Link from "next/link";

export default async function InviteTeamMemberPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Invite Team Member"
        text="Send an invitation to join your tire marketplace team."
      >
        <Button asChild variant="outline">
          <Link href="/dashboard/team">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Link>
        </Button>
      </DashboardHeader>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invitation Details
            </CardTitle>
            <CardDescription>
              Enter the details for the team member you want to invite.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  required
                />
                <p className="text-xs text-gray-600">
                  We'll send an invitation email to this address.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Full Name (Optional)</Label>
                <Input
                  id="name"
                  placeholder="John Smith"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600">
                  You can change the role later if needed.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Hi! I'd like to invite you to join our tire marketplace team. We'd love to have you help us manage our listings and grow our business."
                  rows={4}
                />
                <p className="text-xs text-gray-600">
                  Add a personal note to make the invitation more welcoming.
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" className="btn-gradient-primary">
                <Send className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/team">
                  Cancel
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Role Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Role Permissions
            </CardTitle>
            <CardDescription>
              What each role can do in your marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-green-700 mb-2">Admin</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full access to all features and settings</li>
                  <li>• Manage team members and permissions</li>
                  <li>• Access financial data and payment settings</li>
                  <li>• Delete any listings and manage all content</li>
                  <li>• Configure integrations and social media</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-blue-700 mb-2">Manager</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Create, edit, and manage tire listings</li>
                  <li>• View and respond to customer messages</li>
                  <li>• Process orders and handle payments</li>
                  <li>• View analytics and performance data</li>
                  <li>• Manage yard sale items and events</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Member</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Create and edit their own listings</li>
                  <li>• View their own performance metrics</li>
                  <li>• Respond to messages about their listings</li>
                  <li>• Access basic dashboard features</li>
                  <li>• Upload photos and manage their content</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}