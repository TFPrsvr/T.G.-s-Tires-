import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, MapPin, Phone, Mail, Shield, Star, Heart } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getListing(id: string) {
  try {
    const listing = await prisma.tireListing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    if (!listing) {
      return null;
    }

    // Increment view count
    await prisma.tireListing.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    return listing;
  } catch (error) {
    console.error("Error fetching listing:", error);
    return null;
  }
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);

  if (!listing) {
    notFound();
  }

  const formatCondition = (condition: string) => {
    return condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSellerName = () => {
    return `${listing.user.firstName} ${listing.user.lastName}`.trim() || 'Anonymous Seller';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button asChild className="btn-primary">
              <Link href="/marketplace">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <Button className="btn-primary">
                <Heart className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button className="btn-gradient-primary">
                Contact Seller
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-500 text-xl">Tire Images</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-500">Photo {i + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Listing Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{listing.title}</CardTitle>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        {formatCondition(listing.condition)}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-600">
                        <Eye className="h-4 w-4 mr-1" />
                        {listing.views} views
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      ${listing.price}
                    </div>
                    {listing.rimServiceAvailable && listing.rimServicePrice && (
                      <div className="text-sm text-blue-600">
                        +${listing.rimServicePrice} rim service
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tire Specifications */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tire Specifications</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div><strong>Brand:</strong> {listing.brand}</div>
                      {listing.model && <div><strong>Model:</strong> {listing.model}</div>}
                      <div><strong>Size:</strong> {listing.size}</div>
                      <div><strong>Condition:</strong> {formatCondition(listing.condition)}</div>
                    </div>
                    <div className="space-y-2">
                      <div><strong>Tread Depth:</strong> {listing.treadDepth}/32&quot;</div>
                      <div><strong>Quantity:</strong> {listing.quantity} available</div>
                      <div><strong>Listed:</strong> {new Date(listing.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {listing.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
                  </div>
                )}

                {/* Rim Service */}
                {listing.rimServiceAvailable && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-blue-900">Rim Mounting Service Available</h3>
                    <p className="text-blue-800">
                      Professional rim mounting service available for an additional ${listing.rimServicePrice || 0}.
                      Save time and ensure proper installation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-semibold">{getSellerName()}</div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    Professional Seller
                  </div>
                </div>

                {listing.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {listing.location}
                  </div>
                )}

                <div className="space-y-2">
                  <Button className="w-full btn-gradient-primary">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Seller
                  </Button>
                  <Button className="w-full btn-primary">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>

                {listing.contactInfo && (
                  <div className="text-sm text-gray-600 mt-4">
                    <strong>Contact:</strong> {listing.contactInfo}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div>• Inspect tires in person before purchasing</div>
                <div>• Check tread depth and sidewall condition</div>
                <div>• Verify tire age from DOT code</div>
                <div>• Meet in a safe, public location</div>
                <div>• Use secure payment methods</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}