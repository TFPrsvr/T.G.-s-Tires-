"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Tag,
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Eye,
  MessageSquare,
  Phone
} from "lucide-react";
import { toast } from "sonner";
import { PaymentOptions } from '@/components/features/payments/payment-options';
import type { YardSaleItem } from '@/types';

interface YardSaleItemCardProps {
  item: YardSaleItem;
  onViewDetails: (item: YardSaleItem) => void;
  onPurchase: (item: YardSaleItem) => void;
}

function YardSaleItemCard({ item, onViewDetails, onPurchase }: YardSaleItemCardProps) {
  const conditions = {
    'NEW': { label: 'New', color: 'bg-green-100 text-green-800' },
    'LIKE_NEW': { label: 'Like New', color: 'bg-blue-100 text-blue-800' },
    'GOOD': { label: 'Good', color: 'bg-yellow-100 text-yellow-800' },
    'FAIR': { label: 'Fair', color: 'bg-orange-100 text-orange-800' },
    'POOR': { label: 'Poor', color: 'bg-red-100 text-red-800' },
  };

  const nextSaleDate = item.availableDates
    .filter(date => new Date(date) >= new Date())
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="outline" className="mr-2">
                {item.category}
              </Badge>
              <Badge className={conditions[item.condition]?.color} variant="secondary">
                {conditions[item.condition]?.label}
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Item Images */}
        {item.images && item.images.length > 0 ? (
          <div className="mb-4">
            <div className="aspect-video relative overflow-hidden rounded-lg border bg-gray-100">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {item.images.length > 1 && (
                <Badge className="absolute top-2 right-2 bg-black/50 text-white">
                  +{item.images.length - 1}
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="aspect-video relative overflow-hidden rounded-lg border bg-gray-100 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex-1" />

        {/* Price and Next Sale Date */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="font-bold text-xl text-green-600">
                {item.price ? `$${item.price.toFixed(2)}` : 'Make Offer'}
              </span>
            </div>
          </div>

          {nextSaleDate && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Next sale: {new Date(nextSaleDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Sale Address */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {typeof item.saleAddress === 'string' && item.saleAddress.includes('Address available')
              ? 'Address available to buyers'
              : item.saleAddress
            }
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(item)}
            className="btn-primary"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          <Button
            size="sm"
            onClick={() => onPurchase(item)}
            className="btn-gradient-primary"
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Purchase
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function YardSaleItemDetailsModal({ item, open, onClose }: {
  item: YardSaleItem;
  open: boolean;
  onClose: () => void;
}) {
  const conditions = {
    'NEW': { label: 'New', color: 'bg-green-100 text-green-800' },
    'LIKE_NEW': { label: 'Like New', color: 'bg-blue-100 text-blue-800' },
    'GOOD': { label: 'Good', color: 'bg-yellow-100 text-yellow-800' },
    'FAIR': { label: 'Fair', color: 'bg-orange-100 text-orange-800' },
    'POOR': { label: 'Poor', color: 'bg-red-100 text-red-800' },
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{item.title}</DialogTitle>
          <DialogDescription>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{item.category}</Badge>
              <Badge className={conditions[item.condition]?.color} variant="secondary">
                {conditions[item.condition]?.label}
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images */}
          <div className="space-y-4">
            {item.images && item.images.length > 0 ? (
              <div className="space-y-2">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full aspect-video object-cover rounded-lg border"
                />
                {item.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {item.images.slice(1).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${item.title} ${index + 2}`}
                        className="w-full aspect-square object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-video bg-gray-100 rounded-lg border flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            {/* Price */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {item.price ? `$${item.price.toFixed(2)}` : 'Make Offer'}
                </span>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            )}

            {/* Sale Dates */}
            {item.availableDates && item.availableDates.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Available Sale Dates</h3>
                <div className="flex flex-wrap gap-2">
                  {item.availableDates
                    .filter(date => new Date(date) >= new Date())
                    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                    .map((date, index) => (
                      <Badge key={index} variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(date).toLocaleDateString()}
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Contact Seller</h3>
              <div className="flex items-center gap-1 text-sm text-blue-800 mb-1">
                <MapPin className="h-4 w-4" />
                <span>{item.saleAddress}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="btn-primary">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button size="sm" variant="outline" className="btn-primary">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function YardSaleBrowse() {
  const [items, setItems] = useState<YardSaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [selectedItem, setSelectedItem] = useState<YardSaleItem | null>(null);
  const [purchaseItem, setPurchaseItem] = useState<YardSaleItem | null>(null);

  const categories = [
    'Furniture', 'Electronics', 'Clothing', 'Books', 'Toys', 'Tools',
    'Household Items', 'Appliances', 'Jewelry', 'Collectibles',
    'Sporting Goods', 'Garden Items', 'Automotive', 'Other'
  ];

  const conditions = [
    { value: 'NEW', label: 'New' },
    { value: 'LIKE_NEW', label: 'Like New' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'POOR', label: 'Poor' },
  ];

  useEffect(() => {
    loadItems();
  }, [filterCategory, filterCondition]);

  const loadItems = async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set('category', filterCategory);
      if (filterCondition) params.set('condition', filterCondition);

      const response = await fetch(`/api/yard-sale?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.items || []);
      } else {
        toast.error('Failed to load yard sale items');
      }
    } catch (error) {
      console.error('Error loading yard sale items:', error);
      toast.error('Failed to load yard sale items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container px-4">
          <div className="flex items-center justify-center py-12">
            <div className="loading w-6 h-6" />
            <span className="ml-2">Loading yard sale items...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            T.G.'s Tires Yard Sale
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find great deals on household items, furniture, electronics, and more from our yard sales
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search yard sale items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterCondition} onValueChange={setFilterCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="All Conditions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Conditions</SelectItem>
                  {conditions.map(condition => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No yard sale items available
              </h3>
              <p className="text-gray-600">
                Check back soon for new items or adjust your search filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {filteredItems.length} Item{filteredItems.length !== 1 ? 's' : ''} Available
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map(item => (
                <YardSaleItemCard
                  key={item.id}
                  item={item}
                  onViewDetails={setSelectedItem}
                  onPurchase={setPurchaseItem}
                />
              ))}
            </div>
          </>
        )}

        {/* Item Details Modal */}
        {selectedItem && (
          <YardSaleItemDetailsModal
            item={selectedItem}
            open={!!selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}

        {/* Purchase Modal */}
        {purchaseItem && (
          <Dialog open={!!purchaseItem} onOpenChange={() => setPurchaseItem(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Purchase {purchaseItem.title}</DialogTitle>
                <DialogDescription>
                  Complete your purchase securely with Stripe
                </DialogDescription>
              </DialogHeader>
              <PaymentOptions
                item={purchaseItem}
                itemType="YARD_SALE_ITEM"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}