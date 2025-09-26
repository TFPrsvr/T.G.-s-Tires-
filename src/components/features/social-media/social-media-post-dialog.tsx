"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Share2,
  Calendar,
  CheckCircle,
  AlertCircle,
  Facebook,
  Instagram,
  Twitter,
  Video,
  Smartphone,
  Clock,
  Send
} from "lucide-react";
import { toast } from "sonner";
import type { TireListing, YardSaleItem } from '@/types';

interface SocialMediaPostDialogProps {
  open: boolean;
  onClose: () => void;
  item: TireListing | YardSaleItem;
  itemType: 'TIRE' | 'YARD_SALE_ITEM';
  onPostCreated?: () => void;
}

function PlatformIcon({ platform, className = "h-4 w-4" }: { platform: string; className?: string }) {
  switch (platform.toUpperCase()) {
    case 'FACEBOOK':
      return <Facebook className={className} />;
    case 'INSTAGRAM':
      return <Instagram className={className} />;
    case 'TWITTER':
      return <Twitter className={className} />;
    case 'TIKTOK':
      return <Video className={className} />;
    case 'SNAPCHAT':
      return <Smartphone className={className} />;
    default:
      return <Share2 className={className} />;
  }
}

export function SocialMediaPostDialog({
  open,
  onClose,
  item,
  itemType,
  onPostCreated
}: SocialMediaPostDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [schedulePost, setSchedulePost] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [previewContent, setPreviewContent] = useState('');

  const platforms = [
    { id: 'FACEBOOK', name: 'Facebook', icon: Facebook },
    { id: 'INSTAGRAM', name: 'Instagram', icon: Instagram },
    { id: 'TWITTER', name: 'Twitter / X', icon: Twitter },
    { id: 'TIKTOK', name: 'TikTok', icon: Video },
    { id: 'SNAPCHAT', name: 'Snapchat', icon: Smartphone },
  ];

  // Generate preview content when dialog opens
  React.useEffect(() => {
    if (open && !previewContent) {
      generatePreviewContent();
    }
  }, [open, item, itemType]);

  const generatePreviewContent = () => {
    let content = '';
    let hashtags: string[] = [];

    if (itemType === 'TIRE') {
      const tire = item as TireListing;
      content = `🚗 Quality Used Tire Available! ${tire.title}\n\n`;
      content += `📏 Size: ${tire.size}\n`;
      if (tire.brand) content += `🏷️ Brand: ${tire.brand}\n`;
      content += `💰 Price: $${tire.price?.toFixed(2)}\n`;
      if (tire.treadDepth) content += `🔍 Tread Depth: ${tire.treadDepth}mm\n`;
      content += `✨ Condition: ${tire.condition.replace('_', ' ')}\n`;

      if (tire.rimServiceAvailable) {
        content += `\n🔧 Professional rim mounting service available for $${tire.rimServicePrice?.toFixed(2)}!`;
      }

      content += `\n\n📞 Contact T.G.'s Tires today!`;

      hashtags = ['#TireDeals', '#UsedTires', '#TGsTires', '#AutoParts', '#QualityTires'];
      if (tire.brand) hashtags.push(`#${tire.brand.replace(/\s+/g, '')}`);
    } else {
      const yardItem = item as YardSaleItem;
      content = `🏠 Yard Sale Find! ${yardItem.title}\n\n`;
      content += `🏷️ Category: ${yardItem.category}\n`;
      content += yardItem.price ? `💰 Price: $${yardItem.price.toFixed(2)}\n` : '💰 Make Offer\n';
      content += `✨ Condition: ${yardItem.condition.replace('_', ' ')}\n`;

      if (yardItem.availableDates.length > 0) {
        content += `\n📅 Next Sale: ${yardItem.availableDates[0].toLocaleDateString()}`;
      }

      content += yardItem.showAddress
        ? `\n📍 Location: ${yardItem.saleAddress}`
        : `\n📍 Address available to buyers`;

      content += `\n\n📞 Contact T.G.'s Tires for details!`;

      hashtags = ['#YardSale', '#GarageSale', '#UsedItems', '#Deals', '#TGsTires'];
      hashtags.push(`#${yardItem.category.replace(/\s+/g, '')}`);
    }

    setPreviewContent(content + '\n\n' + hashtags.join(' '));
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePost = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setLoading(true);

    try {
      const postData: any = {
        itemId: item.id,
        itemType,
        platforms: selectedPlatforms,
      };

      if (schedulePost && scheduledTime) {
        const scheduleDate = new Date(scheduledTime);
        if (scheduleDate <= new Date()) {
          toast.error('Scheduled time must be in the future');
          setLoading(false);
          return;
        }
        postData.scheduleFor = scheduleDate.toISOString();
      }

      const response = await fetch('/api/social-media/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (data.success) {
        const successCount = data.results.successCount;
        const totalCount = data.results.totalAttempted;

        if (successCount === totalCount) {
          toast.success(
            schedulePost
              ? `Post scheduled for ${successCount} platform(s)`
              : `Successfully posted to ${successCount} platform(s)`
          );
        } else if (successCount > 0) {
          toast.warning(
            `Posted to ${successCount} of ${totalCount} platforms. Some failed.`
          );
        } else {
          toast.error('Failed to post to any platforms');
        }

        if (onPostCreated) onPostCreated();
        onClose();
      } else {
        toast.error(data.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share to Social Media
          </DialogTitle>
          <DialogDescription>
            Share your {itemType === 'TIRE' ? 'tire listing' : 'yard sale item'} on social media platforms
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Preview */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="preview">Post Content Preview</Label>
              <Textarea
                id="preview"
                value={previewContent}
                onChange={(e) => setPreviewContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can edit the content before posting
              </p>
            </div>

            {/* Images Preview */}
            {item.images && item.images.length > 0 && (
              <div>
                <Label>Images to Include</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {item.images.slice(0, 6).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full aspect-square object-cover rounded border"
                    />
                  ))}
                  {item.images.length > 6 && (
                    <div className="aspect-square bg-gray-100 rounded border flex items-center justify-center text-sm text-gray-600">
                      +{item.images.length - 6} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Posting Options */}
          <div className="space-y-6">
            {/* Platform Selection */}
            <div>
              <Label>Select Platforms</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {platforms.map(platform => (
                  <div
                    key={platform.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={platform.id}
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={() => handlePlatformToggle(platform.id)}
                    />
                    <PlatformIcon platform={platform.id} />
                    <Label htmlFor={platform.id} className="flex-1 cursor-pointer">
                      {platform.name}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedPlatforms.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  Please select at least one platform
                </p>
              )}
            </div>

            {/* Schedule Option */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="schedule"
                  checked={schedulePost}
                  onCheckedChange={setSchedulePost}
                />
                <Label htmlFor="schedule">Schedule for later</Label>
              </div>

              {schedulePost && (
                <div>
                  <Label htmlFor="scheduledTime">Schedule Date & Time</Label>
                  <input
                    id="scheduledTime"
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)} // 5 minutes from now
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Platform Requirements Notice */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">Platform Requirements</p>
                    <ul className="mt-1 text-amber-700 space-y-1">
                      <li>• Instagram requires at least one image</li>
                      <li>• Twitter has a 280 character limit</li>
                      <li>• TikTok works best with video content</li>
                      <li>• Make sure your accounts are connected first</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handlePost}
            disabled={loading || selectedPlatforms.length === 0}
            className="btn-gradient-primary"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="loading w-4 h-4" />
                {schedulePost ? 'Scheduling...' : 'Posting...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {schedulePost ? (
                  <>
                    <Clock className="h-4 w-4" />
                    Schedule Post
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Post Now
                  </>
                )}
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}