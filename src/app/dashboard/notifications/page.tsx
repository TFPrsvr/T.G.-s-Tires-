import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, MessageSquare, DollarSign, Users, Settings, Trash2, CheckCheck } from "lucide-react";

// Mock data - in production, this would come from your database
const mockNotifications = [
  {
    id: "1",
    type: "message",
    title: "New customer inquiry",
    message: "John Smith asked about your Michelin tires listing",
    timestamp: "2 minutes ago",
    read: false,
    priority: "high",
  },
  {
    id: "2",
    type: "sale",
    title: "Payment received",
    message: "You received $320 for Michelin All-Season Tires",
    timestamp: "1 hour ago",
    read: false,
    priority: "high",
  },
  {
    id: "3",
    type: "listing",
    title: "Listing approved",
    message: "Your Bridgestone Winter Tires listing is now live",
    timestamp: "3 hours ago",
    read: true,
    priority: "medium",
  },
  {
    id: "4",
    type: "team",
    title: "Team member joined",
    message: "Sarah Johnson accepted your team invitation",
    timestamp: "1 day ago",
    read: true,
    priority: "low",
  },
  {
    id: "5",
    type: "system",
    title: "Account verification complete",
    message: "Your seller account has been verified and approved",
    timestamp: "2 days ago",
    read: true,
    priority: "medium",
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "message":
      return MessageSquare;
    case "sale":
      return DollarSign;
    case "listing":
      return Bell;
    case "team":
      return Users;
    case "system":
      return Settings;
    default:
      return Bell;
  }
};


export default async function NotificationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Notifications"
        text="Stay updated with your tire marketplace activity."
      >
        <div className="flex gap-2">
          <Button className="btn-primary" size="sm">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
          <Button className="btn-primary" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </DashboardHeader>

      <div className="space-y-6">
        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockNotifications.filter(n => n.type === 'message').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockNotifications.filter(n => n.type === 'sale').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockNotifications.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose what notifications you want to receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Messages</Label>
                    <p className="text-sm text-gray-600">Customer inquiries and messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Notifications</Label>
                    <p className="text-sm text-gray-600">Payment received and processing updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Listing Updates</Label>
                    <p className="text-sm text-gray-600">Listing approval and status changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Team Activities</Label>
                    <p className="text-sm text-gray-600">Team member actions and updates</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Updates</Label>
                    <p className="text-sm text-gray-600">Product updates and promotions</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>
              Your latest notifications and updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const read = notification.read;

                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      !read ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      !read ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                      <IconComponent className={`h-4 w-4 ${
                        !read ? "text-blue-600" : "text-gray-600"
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-sm font-medium ${
                            !read ? "text-gray-900" : "text-gray-700"
                          }`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.timestamp}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Badge
                            variant={
                              notification.priority === "high" ? "default" :
                              notification.priority === "medium" ? "secondary" : "outline"
                            }
                            className="text-xs"
                          >
                            {notification.priority}
                          </Badge>
                          {!read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button className="btn-primary" size="sm">
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                      <Button className="btn-primary" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}