import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Settings, Mail, MoreHorizontal } from "lucide-react";
import Link from "next/link";

// Mock data - in production, this would come from your database
const mockTeamMembers = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    role: "Admin",
    status: "active",
    joinedDate: "2024-01-15",
    lastActive: "2024-03-15",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    role: "Manager",
    status: "active",
    joinedDate: "2024-02-01",
    lastActive: "2024-03-14",
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike.wilson@example.com",
    role: "Member",
    status: "pending",
    joinedDate: "2024-03-10",
    lastActive: null,
  },
];

export default async function TeamPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Team Management"
        text="Manage team members and their access to your tire marketplace."
      >
        <Button asChild className="btn-gradient-primary">
          <Link href="/dashboard/team/invite">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Link>
        </Button>
      </DashboardHeader>

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockTeamMembers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockTeamMembers.filter(m => m.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockTeamMembers.filter(m => m.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              View and manage all team members and their permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTeamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        member.role === 'Admin' ? 'default' :
                        member.role === 'Manager' ? 'secondary' : 'outline'
                      }
                    >
                      {member.role}
                    </Badge>

                    <Badge
                      variant={member.status === 'active' ? 'default' : 'outline'}
                    >
                      {member.status}
                    </Badge>

                    <div className="text-sm text-gray-600">
                      <div>Joined: {new Date(member.joinedDate).toLocaleDateString()}</div>
                      {member.lastActive && (
                        <div>Last active: {new Date(member.lastActive).toLocaleDateString()}</div>
                      )}
                    </div>

                    <Button className="btn-primary" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Info */}
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>
              Understanding what each role can do in your marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium">Admin</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full access to all features</li>
                  <li>• Manage team members</li>
                  <li>• Access financial data</li>
                  <li>• Delete listings</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Manager</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Create and edit listings</li>
                  <li>• View customer messages</li>
                  <li>• Process orders</li>
                  <li>• View basic analytics</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Member</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Create listings</li>
                  <li>• View own listings</li>
                  <li>• Respond to messages</li>
                  <li>• Basic dashboard access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}