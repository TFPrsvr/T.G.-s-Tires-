"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Car, MapPin, Eye, Heart, Loader2 } from "lucide-react";
import Link from "next/link";

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
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<TireListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const params = new URLSearchParams();

        // Add published filter to only show published listings
        params.append('status', 'PUBLISHED');

        // Add search and filter parameters
        if (searchTerm) params.append('search', searchTerm);
        if (selectedSize) params.append('size', selectedSize);
        if (selectedLocation) params.append('location', selectedLocation);

        const response = await fetch(`/api/listings?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setListings(data.listings || []);
        }
      } catch (error) {
        console.error('Error fetching marketplace listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [searchTerm, selectedSize, selectedLocation]);

  const handleSearch = () => {
    // Trigger re-fetch with current filters by updating searchTerm state
    // This will cause useEffect to re-run with the current search term
  };

  const formatCondition = (condition: string) => {
    return condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSellerName = (user: TireListing['user']) => {
    return `${user.firstName} ${user.lastName}`.trim() || 'Anonymous Seller';
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <Link href="/" className="text-2xl font-bold text-gray-900">
                T.G.&apos;s Tires Marketplace
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild className="btn-primary">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild className="btn-gradient-primary">
                <Link href="/sign-up">List Your Tires</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Find Quality Used Tires
            </h1>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by brand, size, or tire type..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Tire Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-sizes">All Sizes</SelectItem>
                  <SelectItem value="195/65R15">195/65R15</SelectItem>
                  <SelectItem value="205/55R16">205/55R16</SelectItem>
                  <SelectItem value="225/60R16">225/60R16</SelectItem>
                  <SelectItem value="245/45R17">245/45R17</SelectItem>
                  <SelectItem value="265/70R16">265/70R16</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-locations">All Locations</SelectItem>
                  <SelectItem value="Springfield">Springfield, IL</SelectItem>
                  <SelectItem value="Chicago">Chicago, IL</SelectItem>
                  <SelectItem value="Peoria">Peoria, IL</SelectItem>
                  <SelectItem value="Rockford">Rockford, IL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 mt-4">
              <Button onClick={handleSearch} className="btn-gradient-primary">
                <Search className="mr-2 h-4 w-4" />
                Search Tires
              </Button>
              <Button className="btn-primary">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-gray-600">Loading tire listings...</p>
            </div>
          ) : (
            <p className="text-gray-600">
              Showing {listings.length} tire listing{listings.length !== 1 ? 's' : ''} in your area
            </p>
          )}
        </div>

        {/* Listings Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            // Loading state
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="p-0">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : listings.length === 0 ? (
            // Empty state
            <div className="col-span-full text-center py-12">
              <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tire listings found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedSize || selectedLocation
                  ? "Try adjusting your search filters to find more results."
                  : "Be the first to list tires in the marketplace!"}
              </p>
              <Button asChild className="btn-gradient-primary">
                <Link href="/sign-up">List Your Tires</Link>
              </Button>
            </div>
          ) : (
            // Listings
            listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="p-0">
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg flex items-center justify-center">
                    <span className="text-gray-500">Tire Image</span>
                    <Button
                      className="btn-primary absolute top-2 right-2 bg-white/80 hover:bg-white"
                      size="sm"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{formatCondition(listing.condition)}</Badge>
                        <span className="text-sm text-gray-600">{listing.treadDepth}/32&quot; tread</span>
                        {listing.quantity > 1 && (
                          <span className="text-sm text-gray-600">({listing.quantity} available)</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          ${listing.price}
                        </div>
                        {listing.rimServiceAvailable && listing.rimServicePrice && (
                          <div className="text-xs text-gray-500">
                            +${listing.rimServicePrice} rim service
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-gray-500">{getSellerName(listing.user)}</div>
                        <div className="text-xs text-gray-400">
                          {listing.brand} {listing.size}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {listing.location || 'Location not specified'}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {listing.views} views
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button className="w-full btn-gradient-primary">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button className="btn-primary" size="lg">
            Load More Listings
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-1.5 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-0.5 md:space-y-0">
            <div className="text-xs text-gray-500">
              © 2024 T.G.&apos;s Tires
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}