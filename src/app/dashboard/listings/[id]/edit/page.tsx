"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface TireListing {
  id: string;
  title: string;
  description: string;
  brand: string;
  model?: string;
  size: string;
  treadDepth: number;
  condition: string;
  quantity: number;
  price: number;
  rimServiceAvailable: boolean;
  rimServicePrice?: number;
  location?: string;
  contactInfo?: string;
  status: string;
}

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    brand: "",
    model: "",
    size: "",
    treadDepth: "",
    condition: "",
    quantity: "1",
    price: "",
    rimServiceAvailable: false,
    rimServicePrice: "",
    location: "",
    contactInfo: "",
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${params.id}`);
        if (response.ok) {
          const listing: TireListing = await response.json();
          setFormData({
            title: listing.title,
            description: listing.description,
            brand: listing.brand,
            model: listing.model || "",
            size: listing.size,
            treadDepth: listing.treadDepth.toString(),
            condition: listing.condition.toLowerCase().replace('_', '-'),
            quantity: listing.quantity.toString(),
            price: listing.price.toString(),
            rimServiceAvailable: listing.rimServiceAvailable,
            rimServicePrice: listing.rimServicePrice?.toString() || "",
            location: listing.location || "",
            contactInfo: listing.contactInfo || "",
          });
        } else {
          toast.error("Failed to load listing");
          router.push("/dashboard/listings");
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast.error("Failed to load listing");
        router.push("/dashboard/listings");
      } finally {
        setIsFetching(false);
      }
    };

    fetchListing();
  }, [params.id, router]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.brand || !formData.size || !formData.condition || !formData.price || !formData.treadDepth) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Prepare data for API
      const submitData = {
        title: formData.title,
        description: formData.description,
        brand: formData.brand,
        model: formData.model || undefined,
        size: formData.size,
        treadDepth: parseInt(formData.treadDepth),
        condition: formData.condition.toUpperCase().replace('-', '_'),
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        rimServiceAvailable: formData.rimServiceAvailable,
        rimServicePrice: formData.rimServicePrice ? parseFloat(formData.rimServicePrice) : undefined,
        location: formData.location || undefined,
        contactInfo: formData.contactInfo || undefined,
      };

      const response = await fetch(`/api/listings/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update listing');
      }

      toast.success("Tire listing updated successfully!");
      router.push('/dashboard/listings');

    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error(error instanceof Error ? error.message : "Failed to update listing");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Edit Tire Listing"
        text="Update your tire listing with new information."
      >
        <Button asChild className="btn-primary">
          <Link href="/dashboard/listings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Link>
        </Button>
      </DashboardHeader>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Tire Details</CardTitle>
              <CardDescription>
                Update the information for your tire listing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Michelin All-Season Tires - 225/60R16"
                    className="max-w-md"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the condition, tread depth, any wear patterns, etc."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="320"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="like-new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="size">Tire Size *</Label>
                    <Input
                      id="size"
                      value={formData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      placeholder="225/60R16"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="Michelin"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      placeholder="Defender T+H"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tread-depth">Tread Depth (32nds) *</Label>
                    <Input
                      id="tread-depth"
                      type="number"
                      value={formData.treadDepth}
                      onChange={(e) => handleInputChange('treadDepth', e.target.value)}
                      placeholder="8"
                      min="1"
                      max="32"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      placeholder="4"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Rim Mounting Service</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Switch
                        id="rim-service"
                        checked={formData.rimServiceAvailable}
                        onCheckedChange={(checked) => handleInputChange('rimServiceAvailable', checked)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <div>
                        <Label htmlFor="rim-service" className="text-base font-medium cursor-pointer">
                          Offer rim mounting service
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Toggle to offer tire mounting for an additional fee
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formData.rimServiceAvailable ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium">
                          ✓ Service Available
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs">
                          Service Not Offered
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {formData.rimServiceAvailable && (
                  <div className="grid gap-2">
                    <Label htmlFor="rim-price">Rim Service Price ($)</Label>
                    <Input
                      id="rim-price"
                      type="number"
                      value={formData.rimServicePrice}
                      onChange={(e) => handleInputChange('rimServicePrice', e.target.value)}
                      placeholder="40"
                      min="0"
                      step="0.01"
                      className="max-w-xs"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State"
                    className="max-w-md"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact-info">Contact Info</Label>
                  <Input
                    id="contact-info"
                    value={formData.contactInfo}
                    onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                    placeholder="Phone number or email"
                    className="max-w-md"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="btn-gradient-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Listing'
                  )}
                </Button>
                <Button asChild className="btn-primary">
                  <Link href="/dashboard/listings">
                    Cancel
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardShell>
  );
}