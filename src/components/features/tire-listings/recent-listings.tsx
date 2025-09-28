"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, DollarSign, Calendar, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface TireListing {
  id: string;
  title: string;
  brand: string;
  size: string;
  condition: string;
  price: number;
  status: string;
  views: number;
  createdAt: string;
  publishedAt: string | null;
}

export function RecentListings() {
  const [listings, setListings] = useState<TireListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('/api/listings?limit=3');
        if (response.ok) {
          const data = await response.json();
          setListings(data.listings || []);
        }
      } catch (error) {
        console.error('Error fetching recent listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="product-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="product-card">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No listings yet. Create your first tire listing to get started!</p>
            <Button asChild className="mt-4 btn-gradient-primary">
              <Link href="/dashboard/listings/new">
                Create Listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {listings.map((listing) => (
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
                        variant={listing.condition === "LIKE_NEW" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {listing.condition.replace('_', ' ')}
                      </Badge>
                      {listing.status === "PENDING" && (
                        <Badge variant="outline" className="text-xs status-warning">
                          Pending
                        </Badge>
                      )}
                      {listing.status === "DRAFT" && (
                        <Badge variant="outline" className="text-xs">
                          Draft
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ${listing.price}
                    </div>
                    <div className="text-xs text-gray-500">
                      {listing.brand} {listing.size}
                    </div>
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
                    {new Date(listing.createdAt).toLocaleDateString()}
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
            <Button asChild size="sm" className="btn-primary">
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