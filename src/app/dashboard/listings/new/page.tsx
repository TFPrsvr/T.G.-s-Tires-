import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, Plus } from "lucide-react";
import Link from "next/link";

export default async function NewListingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Add New Tire Listing"
        text="Create a new tire listing with photos and detailed specifications."
      >
        <Button asChild variant="outline">
          <Link href="/dashboard/listings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Link>
        </Button>
      </DashboardHeader>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Tire Details</CardTitle>
            <CardDescription>
              Provide detailed information about your tire listing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Listing Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Michelin All-Season Tires - 225/60R16"
                  className="max-w-md"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the condition, tread depth, any wear patterns, etc."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="320"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select>
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
                  <Label htmlFor="size">Tire Size</Label>
                  <Input
                    id="size"
                    placeholder="225/60R16"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="Michelin"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="Defender T+H"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tread-depth">Tread Depth (32nds)</Label>
                  <Input
                    id="tread-depth"
                    type="number"
                    placeholder="8"
                    min="1"
                    max="32"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="4"
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Rim Mounting Service</h3>
              <div className="flex items-center space-x-2">
                <Checkbox id="rim-service" />
                <Label htmlFor="rim-service">
                  Offer rim mounting service
                </Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rim-price">Rim Service Price ($)</Label>
                <Input
                  id="rim-price"
                  type="number"
                  placeholder="40"
                  min="0"
                  step="0.01"
                  className="max-w-xs"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Photos</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload tire photos or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG up to 10MB each (max 6 photos)
                </p>
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Photos
                </Button>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" className="btn-gradient-primary">
                Create Listing
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/listings">
                  Cancel
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}