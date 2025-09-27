import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Car, MapPin, Eye, DollarSign, Star, Heart } from "lucide-react";
import Link from "next/link";

// Mock data - in production, this would come from your database
const mockListings = [
  {
    id: "1",
    title: "Michelin All-Season Tires - 225/60R16",
    price: 320,
    condition: "Good",
    views: 45,
    location: "Springfield, IL",
    seller: "T.G.'s Tires",
    rating: 4.8,
    images: ["/api/placeholder/300/200"],
    rimServiceAvailable: true,
    rimServicePrice: 40,
    datePosted: "2024-03-15",
    treadDepth: 8,
    brand: "Michelin",
    size: "225/60R16",
  },
  {
    id: "2",
    title: "Bridgestone Winter Tires - 205/55R16",
    price: 280,
    condition: "Like New",
    views: 32,
    location: "Chicago, IL",
    seller: "Mike's Auto Shop",
    rating: 4.5,
    images: ["/api/placeholder/300/200"],
    rimServiceAvailable: false,
    datePosted: "2024-03-14",
    treadDepth: 10,
    brand: "Bridgestone",
    size: "205/55R16",
  },
  {
    id: "3",
    title: "Goodyear Performance Tires - 245/45R17",
    price: 450,
    condition: "Fair",
    views: 28,
    location: "Peoria, IL",
    seller: "Performance Plus",
    rating: 4.2,
    images: ["/api/placeholder/300/200"],
    rimServiceAvailable: true,
    rimServicePrice: 50,
    datePosted: "2024-03-13",
    treadDepth: 6,
    brand: "Goodyear",
    size: "245/45R17",
  },
  {
    id: "4",
    title: "Continental Summer Tires - 195/65R15",
    price: 240,
    condition: "Good",
    views: 15,
    location: "Rockford, IL",
    seller: "City Tire Center",
    rating: 4.6,
    images: ["/api/placeholder/300/200"],
    rimServiceAvailable: false,
    datePosted: "2024-03-12",
    treadDepth: 7,
    brand: "Continental",
    size: "195/65R15",
  },
  {
    id: "5",
    title: "Pirelli All-Terrain Tires - 265/70R16",
    price: 520,
    condition: "Like New",
    views: 67,
    location: "Decatur, IL",
    seller: "Off-Road Specialists",
    rating: 4.9,
    images: ["/api/placeholder/300/200"],
    rimServiceAvailable: true,
    rimServicePrice: 60,
    datePosted: "2024-03-11",
    treadDepth: 11,
    brand: "Pirelli",
    size: "265/70R16",
  },
  {
    id: "6",
    title: "BF Goodrich Mud-Terrain - 33x12.50R15",
    price: 680,
    condition: "Good",
    views: 89,
    location: "Bloomington, IL",
    seller: "Truck & SUV Pros",
    rating: 4.4,
    images: ["/api/placeholder/300/200"],
    rimServiceAvailable: true,
    rimServicePrice: 75,
    datePosted: "2024-03-10",
    treadDepth: 9,
    brand: "BF Goodrich",
    size: "33x12.50R15",
  },
];

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <Link href="/" className="text-2xl font-bold text-gray-900">
                T.G.'s Tires Marketplace
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline">
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
                  />
                </div>
              </div>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tire Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="195/65R15">195/65R15</SelectItem>
                  <SelectItem value="205/55R16">205/55R16</SelectItem>
                  <SelectItem value="225/60R16">225/60R16</SelectItem>
                  <SelectItem value="245/45R17">245/45R17</SelectItem>
                  <SelectItem value="265/70R16">265/70R16</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="springfield">Springfield, IL</SelectItem>
                  <SelectItem value="chicago">Chicago, IL</SelectItem>
                  <SelectItem value="peoria">Peoria, IL</SelectItem>
                  <SelectItem value="rockford">Rockford, IL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 mt-4">
              <Button className="btn-gradient-primary">
                <Search className="mr-2 h-4 w-4" />
                Search Tires
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {mockListings.length} tire listings in your area
          </p>
        </div>

        {/* Listings Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockListings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="p-0">
                <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-500">Tire Image</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
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
                      <Badge variant="secondary">{listing.condition}</Badge>
                      <span className="text-sm text-gray-600">{listing.treadDepth}/32" tread</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ${listing.price}
                      </div>
                      {listing.rimServiceAvailable && (
                        <div className="text-xs text-gray-500">
                          +${listing.rimServicePrice} rim service
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        {listing.rating}
                      </div>
                      <div className="text-xs text-gray-500">{listing.seller}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {listing.location}
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
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Listings
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
              © 2024 T.G.'s Tires. Professional tire marketplace.
            </div>
            <div className="flex space-x-6 text-gray-600">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}