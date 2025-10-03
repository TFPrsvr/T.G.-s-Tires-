import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { InviteTeamMemberForm } from "@/components/features/team/invite-team-member-form";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Shield } from "lucide-react";
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
        <Button asChild className="btn-primary">
          <Link href="/dashboard/team">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Link>
        </Button>
      </DashboardHeader>

      <div className="max-w-4xl space-y-6">
        <InviteTeamMemberForm />

        {/* Role Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions
            </CardTitle>
            <CardDescription>
              What each role can do in your marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-gray-900 rounded-lg p-4 bg-gray-50">
                <h4 className="font-bold text-gray-900 mb-2 text-lg">Admin</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Full access to all features and settings</li>
                  <li>• Manage team members and permissions</li>
                  <li>• Access financial data and payment settings</li>
                  <li>• Delete any listings and manage all content</li>
                  <li>• Invite other Admins</li>
                </ul>
              </div>

              <div className="border-2 border-purple-600 rounded-lg p-4 bg-purple-50">
                <h4 className="font-bold text-purple-700 mb-2 text-lg">Manager</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Create, edit, and manage tire listings</li>
                  <li>• View and respond to customer messages</li>
                  <li>• Process orders and handle payments</li>
                  <li>• View analytics and performance data</li>
                  <li>• Manage yard sale items and events</li>
                </ul>
              </div>

              <div className="border-2 border-green-600 rounded-lg p-4 bg-green-50">
                <h4 className="font-bold text-green-700 mb-2 text-lg">Member</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Create and edit their own listings</li>
                  <li>• View their own performance metrics</li>
                  <li>• Respond to messages about their listings</li>
                  <li>• Access basic dashboard features</li>
                  <li>• Upload photos and manage their content</li>
                </ul>
              </div>

              <div className="border-2 border-blue-600 rounded-lg p-4 bg-blue-50">
                <h4 className="font-bold text-blue-700 mb-2 text-lg">Visitor</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Browse all active tire listings</li>
                  <li>• View yard sale items</li>
                  <li>• Contact sellers about listings</li>
                  <li>• Search and filter marketplace</li>
                  <li>• No access to dashboard</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
