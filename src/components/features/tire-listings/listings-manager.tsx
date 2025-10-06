"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Trash2, DollarSign, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface TireListing {
  id: string;
  title: string;
  brand: string;
  model?: string;
  size: string;
  condition: string;
  price: number;
  views: number;
  treadDepth: number;
  quantity: number;
  rimServiceAvailable: boolean;
  rimServicePrice?: number;
  location?: string;
  contactInfo?: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
}

interface ListingsManagerProps {
  initialListings: TireListing[];
}

export function ListingsManager({ initialListings }: ListingsManagerProps) {
  const [listings, setListings] = useState<TireListing[]>(initialListings);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (listingId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(listingId));

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete listing');
      }

      // Remove from local state
      setListings(prev => prev.filter(listing => listing.id !== listingId));
      toast.success("Listing deleted successfully!");

    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error(error instanceof Error ? error.message : "Failed to delete listing");
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    }
  };

  const formatCondition = (condition: string) => {
    return condition.replace('_', ' ').toLowerCase();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listings.filter(l => l.status === 'PUBLISHED').length}
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
              {listings.reduce((sum, l) => sum + l.views, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listings.filter(l => l.status === 'DRAFT').length}
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
            {listings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No tire listings yet.</p>
                <Button asChild className="btn-gradient-primary">
                  <Link href="/dashboard/listings/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Listing
                  </Link>
                </Button>
              </div>
            ) : (
              listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{listing.title}</h3>
                      <Badge
                        variant={
                          listing.status === 'PUBLISHED' ? 'default' :
                          listing.status === 'DRAFT' ? 'secondary' : 'outline'
                        }
                      >
                        {formatCondition(listing.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>${listing.price}</span>
                      <span>{formatCondition(listing.condition)}</span>
                      <span>{listing.views} views</span>
                      <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                      {listing.rimServiceAvailable && listing.rimServicePrice && (
                        <span className="text-blue-600">
                          Rim service: +${listing.rimServicePrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild className="btn-primary" size="sm" title="View listing">
                      <Link href={`/marketplace/listing/${listing.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild className="btn-primary" size="sm" title="Edit listing">
                      <Link href={`/dashboard/listings/${listing.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      className="btn-primary"
                      size="sm"
                      title="Delete listing"
                      onClick={() => handleDelete(listing.id, listing.title)}
                      disabled={deletingIds.has(listing.id)}
                    >
                      {deletingIds.has(listing.id) ? (
                        <div className="h-4 w-4 animate-spin border-2 border-gray-400 border-t-transparent rounded-full" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}