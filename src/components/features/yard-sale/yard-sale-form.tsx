"use client";

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarIcon, ImageIcon, MapPin, DollarSign, Tag, CheckCircle, AlertCircle, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { YardSaleItemSchema } from '@/types';
import type { YardSaleItem } from '@/types';

interface YardSaleFormProps {
  onSubmit?: (item: YardSaleItem) => void;
  initialData?: Partial<YardSaleItem>;
  isEditing?: boolean;
}

export function YardSaleForm({ onSubmit, initialData, isEditing = false }: YardSaleFormProps) {
  const { userId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    category: initialData?.category || '',
    condition: initialData?.condition || 'GOOD',
    saleAddress: initialData?.saleAddress || '',
    showAddress: initialData?.showAddress ?? true,
    availableDates: initialData?.availableDates || [],
    images: initialData?.images || [],
  });

  const [imagePreview, setImagePreview] = useState<string[]>(initialData?.images || []);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const conditions = [
    { value: 'NEW', label: 'New', color: 'bg-green-100 text-green-800' },
    { value: 'LIKE_NEW', label: 'Like New', color: 'bg-blue-100 text-blue-800' },
    { value: 'GOOD', label: 'Good', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'FAIR', label: 'Fair', color: 'bg-orange-100 text-orange-800' },
    { value: 'POOR', label: 'Poor', color: 'bg-red-100 text-red-800' },
  ];

  const categories = [
    'Furniture', 'Electronics', 'Clothing', 'Books', 'Toys', 'Tools',
    'Household Items', 'Appliances', 'Jewelry', 'Collectibles',
    'Sporting Goods', 'Garden Items', 'Automotive', 'Other'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Simulate image upload - in production, upload to cloud storage
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(prev => [...prev, imageUrl]);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageUrl]
        }));
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${files.length} image(s) uploaded successfully`);
  };

  const removeImage = (index: number) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addAvailableDate = () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    const date = new Date(selectedDate);
    const existingDate = formData.availableDates.find(
      d => d.toDateString() === date.toDateString()
    );

    if (existingDate) {
      toast.error('Date already added');
      return;
    }

    setFormData(prev => ({
      ...prev,
      availableDates: [...prev.availableDates, date].sort((a, b) => a.getTime() - b.getTime())
    }));
    setSelectedDate('');
    toast.success('Date added');
  };

  const removeDate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availableDates: prev.availableDates.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('You must be logged in to create yard sale items');
      return;
    }

    setIsSubmitting(true);

    try {
      const itemData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
        ownerId: userId,
        isActive: true,
        dateUploaded: new Date(),
        id: isEditing ? initialData?.id || '' : '',
      };

      // Validate with schema
      const validatedData = YardSaleItemSchema.parse(itemData);

      if (onSubmit) {
        onSubmit(validatedData);
      } else {
        // Default API submission
        const response = await fetch('/api/yard-sale', {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        });

        const result = await response.json();

        if (result.success) {
          toast.success(isEditing ? 'Yard sale item updated!' : 'Yard sale item created!');
          // Reset form if creating new
          if (!isEditing) {
            setFormData({
              title: '',
              description: '',
              price: '',
              category: '',
              condition: 'GOOD',
              saleAddress: '',
              showAddress: true,
              availableDates: [],
              images: [],
            });
            setImagePreview([]);
          }
        } else {
          toast.error(result.error || 'Failed to save yard sale item');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save yard sale item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCondition = conditions.find(c => c.value === formData.condition);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          {isEditing ? 'Edit Yard Sale Item' : 'Add New Yard Sale Item'}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update your yard sale item information'
            : 'List an item for your yard sale with photos and details'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="required">Item Title</Label>
              <Input
                id="title"
                placeholder="e.g., Vintage Rocking Chair"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="required">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe the item's features, size, any damage, etc."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
          </div>

          {/* Price and Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (Optional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-10"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">Leave empty for "Make Offer"</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition" className="required">Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map(condition => (
                    <SelectItem key={condition.value} value={condition.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={condition.color} variant="secondary">
                          {condition.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sale Location */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="saleAddress" className="required">Sale Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="saleAddress"
                  placeholder="123 Main St, City, State 12345"
                  className="pl-10"
                  value={formData.saleAddress}
                  onChange={(e) => handleInputChange('saleAddress', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showAddress"
                checked={formData.showAddress}
                onCheckedChange={(checked) => handleInputChange('showAddress', checked)}
              />
              <Label htmlFor="showAddress">
                Show address publicly
              </Label>
              {!formData.showAddress && (
                <Badge variant="outline" className="text-xs">
                  Address will be shared only with buyers
                </Badge>
              )}
            </div>
          </div>

          {/* Available Dates */}
          <div className="space-y-4">
            <Label>Available Sale Dates</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="flex-1"
              />
              <Button type="button" onClick={addAvailableDate} className="btn-primary">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Add Date
              </Button>
            </div>

            {formData.availableDates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.availableDates.map((date, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {date.toLocaleDateString()}
                    <Button
                      type="button"
                      size="sm"
                      className="btn-primary h-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => removeDate(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            {formData.availableDates.length === 0 && (
              <p className="text-sm text-gray-500">Add at least one sale date</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <Label>Item Photos</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <Label htmlFor="images" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload photos of your item
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB each
                    </span>
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <Button type="button" className="btn-primary mt-2" asChild>
                  <Label htmlFor="images" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Label>
                </Button>
              </div>
            </div>

            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreview.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="btn-gradient-primary absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.category || !formData.saleAddress || formData.availableDates.length === 0}
              className="btn-gradient-primary"
              size="lg"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="loading w-4 h-4" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {isEditing ? 'Update Item' : 'Create Item'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}