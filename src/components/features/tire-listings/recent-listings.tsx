"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, DollarSign, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock data - in production, this would come from your database
const mockListings = [
  {
    id: "1",
    title: "Michelin All-Season Tires - 225/60R16",
    price: 320,
    condition: "Good",
    views: 45,
    dateUploaded: "2024-03-15",
    images: ["/api/placeholder/300/200"],
    rimServiceAvailable: true,
    rimServicePrice: 40,
    status: "active",
  },
  {
    id: "2",
    title: "Bridgestone Winter Tires - 205/55R16",
    price: 280,
    condition: "Like New",
    views: 32,
    dateUploaded: "2024-03-14",
    images: ["/api/placeholder/300/200"],
    rimServiceAvailable: false,
    status: "active",
  },
  {
    id: "3",
    title: "Goodyear Performance Tires - 245/45R17",
    price: 450,
    condition: "Fair",
    views: 28,
    dateUploaded: "2024-03-13",
    images: ["/api/placeholder/300/200"],
    rimServiceAvailable: true,
    rimServicePrice: 50,
    status: "pending",
  },
];

export function RecentListings() {
  return (
    <div className="space-y-4">
      {mockListings.map((listing) => (
        <Card key={listing.id} className="product-card">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Image */}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-500">No Image</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={listing.condition === "Like New" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {listing.condition}
                      </Badge>
                      {listing.status === "pending" && (
                        <Badge variant="outline" className="text-xs status-warning">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ${listing.price}
                    </div>
                    {listing.rimServiceAvailable && (
                      <div className="text-xs text-gray-500">
                        +${listing.rimServicePrice} rim service
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {listing.views} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(listing.dateUploaded).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* View All Link */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">View All Listings</CardTitle>
              <CardDescription className="text-xs">
                Manage all your tire listings and track performance
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="btn-primary">
              <Link href="/dashboard/listings" className="flex items-center gap-2">
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}