"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Tag,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { YardSaleForm } from './yard-sale-form';
import type { YardSaleItem } from '@/types';

interface YardSaleItemCardProps {
  item: YardSaleItem;
  onEdit: (item: YardSaleItem) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

function YardSaleItemCard({ item, onEdit, onDelete, onToggleActive }: YardSaleItemCardProps) {
  const [showActions, setShowActions] = useState(false);

  const conditions = {
    'NEW': { label: 'New', color: 'bg-green-100 text-green-800' },
    'LIKE_NEW': { label: 'Like New', color: 'bg-blue-100 text-blue-800' },
    'GOOD': { label: 'Good', color: 'bg-yellow-100 text-yellow-800' },
    'FAIR': { label: 'Fair', color: 'bg-orange-100 text-orange-800' },
    'POOR': { label: 'Poor', color: 'bg-red-100 text-red-800' },
  };

  const nextSaleDate = item.availableDates
    .filter(date => date >= new Date())
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return (
    <Card className={`relative ${!item.isActive ? 'opacity-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="outline" className="mr-2">
                {item.category}
              </Badge>
              <Badge className={conditions[item.condition]?.color} variant="secondary">
                {conditions[item.condition]?.label}
              </Badge>
            </CardDescription>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>

            {showActions && (
              <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-1 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    onEdit(item);
                    setShowActions(false);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    onToggleActive(item.id, !item.isActive);
                    setShowActions(false);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {item.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => {
                    onDelete(item.id);
                    setShowActions(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Item Images */}
        {item.images.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto">
              {item.images.slice(0, 3).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${item.title} ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                />
              ))}
              {item.images.length > 3 && (
                <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-gray-600">+{item.images.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Price and Next Sale Date */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="font-semibold text-lg">
              {item.price ? `$${item.price.toFixed(2)}` : 'Make Offer'}
            </span>
          </div>

          {nextSaleDate && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              {nextSaleDate.toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Sale Address */}
        <div className="flex items-start gap-1 text-sm text-gray-600">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className={!item.showAddress ? 'italic' : ''}>
            {item.showAddress ? item.saleAddress : 'Address shared with buyers'}
          </span>
        </div>

        {/* Status Badge */}
        {!item.isActive && (
          <Badge variant="secondary" className="mt-3">
            Inactive
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export function YardSaleDashboard() {
  const { userId } = useAuth();
  const [items, setItems] = useState<YardSaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<YardSaleItem | null>(null);

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
  }, [userId]);

  const loadItems = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/yard-sale?ownerId=${userId}`);
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

  const handleCreateItem = async (itemData: YardSaleItem) => {
    try {
      const response = await fetch('/api/yard-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      const data = await response.json();

      if (data.success) {
        setItems(prev => [data.item, ...prev]);
        setShowCreateForm(false);
        toast.success('Yard sale item created successfully!');
      } else {
        toast.error(data.error || 'Failed to create item');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Failed to create item');
    }
  };

  const handleUpdateItem = async (itemData: YardSaleItem) => {
    try {
      const response = await fetch(`/api/yard-sale/${itemData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      const data = await response.json();

      if (data.success) {
        setItems(prev => prev.map(item => item.id === itemData.id ? data.item : item));
        setEditingItem(null);
        toast.success('Item updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/yard-sale/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setItems(prev => prev.filter(item => item.id !== id));
        toast.success('Item deleted successfully');
      } else {
        toast.error(data.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/yard-sale/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: active }),
      });

      const data = await response.json();

      if (data.success) {
        setItems(prev => prev.map(item =>
          item.id === id ? { ...item, isActive: active } : item
        ));
        toast.success(`Item ${active ? 'activated' : 'deactivated'}`);
      } else {
        toast.error(data.error || 'Failed to update item status');
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesCondition = !filterCondition || item.condition === filterCondition;

    return matchesSearch && matchesCategory && matchesCondition;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading w-6 h-6" />
        <span className="ml-2">Loading yard sale items...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="h-6 w-6" />
            Yard Sale Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your yard sale items and upcoming sales
          </p>
        </div>

        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="btn-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Yard Sale Item</DialogTitle>
              <DialogDescription>
                Create a new listing for your yard sale
              </DialogDescription>
            </DialogHeader>
            <YardSaleForm
              onSubmit={handleCreateItem}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
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
          <CardContent className="py-12 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {items.length === 0 ? 'No yard sale items yet' : 'No items match your search'}
            </h3>
            <p className="text-gray-600 mb-4">
              {items.length === 0
                ? 'Get started by adding your first yard sale item'
                : 'Try adjusting your search criteria'
              }
            </p>
            {items.length === 0 && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="btn-gradient-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <YardSaleItemCard
              key={item.id}
              item={item}
              onEdit={setEditingItem}
              onDelete={handleDeleteItem}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={true} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Yard Sale Item</DialogTitle>
              <DialogDescription>
                Update your yard sale item information
              </DialogDescription>
            </DialogHeader>
            <YardSaleForm
              initialData={editingItem}
              onSubmit={handleUpdateItem}
              isEditing={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}