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

export default async function NewYardSaleItemPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Add New Yard Sale Item"
        text="List items for your next yard sale event."
      >
        <Button asChild variant="outline">
          <Link href="/dashboard/yard-sale">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Yard Sale
          </Link>
        </Button>
      </DashboardHeader>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>
              Add information about your yard sale item.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="item-title">Item Name</Label>
                <Input
                  id="item-title"
                  placeholder="e.g., Vintage Coffee Table, Kids Bicycle, etc."
                  className="max-w-md"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="item-description">Description</Label>
                <Textarea
                  id="item-description"
                  placeholder="Describe the item condition, dimensions, age, any defects, etc."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="item-price">Price ($)</Label>
                  <Input
                    id="item-price"
                    type="number"
                    placeholder="25.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="item-condition">Condition</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="very-good">Very Good</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="toys">Toys & Games</SelectItem>
                      <SelectItem value="books">Books & Media</SelectItem>
                      <SelectItem value="kitchen">Kitchen & Dining</SelectItem>
                      <SelectItem value="decor">Home Decor</SelectItem>
                      <SelectItem value="tools">Tools & Hardware</SelectItem>
                      <SelectItem value="sports">Sports & Outdoors</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="brand">Brand (if applicable)</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., IKEA, Samsung, etc."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="size">Size/Dimensions</Label>
                  <Input
                    id="size"
                    placeholder="e.g., Large, 24x18x10 inches"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sale Options</h3>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="negotiable" />
                  <Label htmlFor="negotiable">
                    Price negotiable
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="pickup-only" />
                  <Label htmlFor="pickup-only">
                    Pickup only (no delivery)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="cash-only" />
                  <Label htmlFor="cash-only">
                    Cash only
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Photos</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload item photos or drag and drop
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

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sale Event</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sale-date">Sale Date</Label>
                  <Input
                    id="sale-date"
                    type="date"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sale-time">Sale Time</Label>
                  <Input
                    id="sale-time"
                    placeholder="8:00 AM - 4:00 PM"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sale-address">Sale Address</Label>
                <Textarea
                  id="sale-address"
                  placeholder="123 Main Street, Anytown, ST 12345"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" className="btn-gradient-primary">
                Add Item to Sale
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/yard-sale">
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