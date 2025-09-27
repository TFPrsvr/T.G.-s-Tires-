import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, Trash2, DollarSign } from "lucide-react";
import Link from "next/link";

// Mock data - in production, this would come from your database
const mockListings = [
  {
    id: "1",
    title: "Michelin All-Season Tires - 225/60R16",
    price: 320,
    condition: "Good",
    views: 45,
    dateUploaded: "2024-03-15",
    status: "active",
    rimServiceAvailable: true,
    rimServicePrice: 40,
  },
  {
    id: "2",
    title: "Bridgestone Winter Tires - 205/55R16",
    price: 280,
    condition: "Like New",
    views: 32,
    dateUploaded: "2024-03-14",
    status: "active",
    rimServiceAvailable: false,
  },
  {
    id: "3",
    title: "Goodyear Performance Tires - 245/45R17",
    price: 450,
    condition: "Fair",
    views: 28,
    dateUploaded: "2024-03-13",
    status: "pending",
    rimServiceAvailable: true,
    rimServicePrice: 50,
  },
  {
    id: "4",
    title: "Continental Summer Tires - 195/65R15",
    price: 240,
    condition: "Good",
    views: 15,
    dateUploaded: "2024-03-12",
    status: "sold",
    rimServiceAvailable: false,
  },
];

export default async function ListingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Tire Listings"
        text="Manage all your tire listings and track their performance."
      >
        <Button asChild className="btn-gradient-primary">
          <Link href="/dashboard/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Listing
          </Link>
        </Button>
      </DashboardHeader>

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockListings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockListings.filter(l => l.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockListings.reduce((sum, l) => sum + l.views, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockListings.filter(l => l.status === 'sold').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Listings</CardTitle>
            <CardDescription>
              Track and manage all your tire listings in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{listing.title}</h3>
                      <Badge
                        variant={
                          listing.status === 'active' ? 'default' :
                          listing.status === 'sold' ? 'secondary' : 'outline'
                        }
                      >
                        {listing.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>${listing.price}</span>
                      <span>{listing.condition}</span>
                      <span>{listing.views} views</span>
                      <span>{new Date(listing.dateUploaded).toLocaleDateString()}</span>
                      {listing.rimServiceAvailable && (
                        <span className="text-blue-600">
                          Rim service: +${listing.rimServicePrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}