"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, DollarSign, Calendar, ArrowRight, Loader2, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('/api/listings?limit=9');
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
            <Button asChild className="mt-12 btn-gradient-primary">
              <Link href="/dashboard/listings/new">
                Create Listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const displayedListings = isExpanded ? listings : listings.slice(0, 4);
  const hasMoreListings = listings.length > 4;

  return (
    <div className="space-y-4">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedListings.map((listing) => (
          <Card key={listing.id} className="product-card">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Image */}
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-sm text-gray-500">No Image</span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {listing.title}
                      </h3>
                      <div className="text-xs text-gray-500 mt-1">
                        {listing.brand} {listing.size}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ${listing.price}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
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

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
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
      </div>

      {/* Expand/Collapse Button */}
      {hasMoreListings && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                Show Less
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show More ({listings.length - 4} more)
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

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
            <Button asChild className="btn-primary">
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