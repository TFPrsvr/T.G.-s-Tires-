"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Share2,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  Settings,
  Facebook,
  Instagram,
  Twitter,
  Smartphone,
  Video,
  Eye,
  ThumbsUp,
  MessageSquare as MessageIcon,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

interface SocialAccount {
  platform: string;
  accountId: string;
  isActive: boolean;
  expiresAt?: Date;
  hasToken: boolean;
  tokenExpired: boolean;
}

interface SocialPost {
  id: string;
  platform: string;
  postId?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'POSTED' | 'FAILED';
  content: string;
  images: string[];
  itemId: string;
  itemType: 'TIRE' | 'YARD_SALE_ITEM';
  scheduledFor?: Date;
  postedAt?: Date;
  createdAt: Date;
}

interface PostAnalytics {
  totalPosts: number;
  successfulPosts: number;
  failedPosts: number;
  platformBreakdown: Record<string, number>;
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

function AddAccountDialog({ onAccountAdded }: { onAccountAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    platform: '',
    accountId: '',
    accessToken: '',
    expiresAt: '',
  });

  const platforms = [
    { value: 'FACEBOOK', label: 'Facebook' },
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'TWITTER', label: 'Twitter / X' },
    { value: 'TIKTOK', label: 'TikTok' },
    { value: 'SNAPCHAT', label: 'Snapchat' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/social-media/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setFormData({ platform: '', accountId: '', accessToken: '', expiresAt: '' });
        setOpen(false);
        onAccountAdded();
      } else {
        toast.error(data.error || 'Failed to add account');
      }
    } catch (error) {
      console.error('Error adding account:', error);
      toast.error('Failed to add account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Social Media Account</DialogTitle>
          <DialogDescription>
            Connect your social media account to enable automated posting
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={formData.platform} onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map(platform => (
                  <SelectItem key={platform.value} value={platform.value}>
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={platform.value} />
                      {platform.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountId">Account ID / Username</Label>
            <Input
              id="accountId"
              placeholder="e.g., @tgstires or account ID"
              value={formData.accountId}
              onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="Paste your API access token"
              value={formData.accessToken}
              onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
              required
            />
            <p className="text-xs text-gray-500">
              Get your access token from the platform's developer console
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Token Expiration (Optional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.platform || !formData.accountId || !formData.accessToken}
              className="btn-gradient-primary"
            >
              {loading ? 'Adding...' : 'Add Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PostHistoryCard({ post }: { post: SocialPost }) {
  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SCHEDULED: 'bg-blue-100 text-blue-800',
    POSTED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={post.platform} />
            <span className="font-medium">{post.platform}</span>
          </div>
          <Badge className={statusColors[post.status]} variant="secondary">
            {post.status}
          </Badge>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {post.content}
        </p>

        {post.images.length > 0 && (
          <div className="flex gap-1 mb-3">
            {post.images.slice(0, 3).map((image, index) => (
              <img
                key={index}
                src={image}
                alt=""
                className="w-8 h-8 object-cover rounded border"
              />
            ))}
            {post.images.length > 3 && (
              <div className="w-8 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs">
                +{post.images.length - 3}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500">
          {post.status === 'POSTED' && post.postedAt && (
            <span>Posted: {new Date(post.postedAt).toLocaleDateString()}</span>
          )}
          {post.status === 'SCHEDULED' && post.scheduledFor && (
            <span>Scheduled: {new Date(post.scheduledFor).toLocaleDateString()}</span>
          )}
          {post.status === 'FAILED' && (
            <span>Failed: {new Date(post.createdAt).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SocialMediaDashboard() {
  const { userId } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [analytics, setAnalytics] = useState<PostAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoPostSettings, setAutoPostSettings] = useState({
    autoPostToFacebook: false,
    autoPostToInstagram: false,
    autoPostToTwitter: false,
    autoPostToTiktok: false,
    autoPostToSnapchat: false,
  });

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      // Load accounts and posts in parallel
      const [accountsRes, postsRes] = await Promise.all([
        fetch('/api/social-media/accounts'),
        fetch('/api/social-media/post'),
      ]);

      const [accountsData, postsData] = await Promise.all([
        accountsRes.json(),
        postsRes.json(),
      ]);

      if (accountsData.success) {
        setAccounts(accountsData.accounts || []);
      }

      if (postsData.success) {
        setPosts(postsData.posts || []);
        setAnalytics(postsData.analytics);
      }
    } catch (error) {
      console.error('Error loading social media data:', error);
      toast.error('Failed to load social media data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccount = async (platform: string) => {
    if (!confirm(`Remove ${platform} account?`)) return;

    try {
      const response = await fetch(`/api/social-media/accounts?platform=${platform}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setAccounts(prev => prev.filter(acc => acc.platform !== platform));
      } else {
        toast.error(data.error || 'Failed to remove account');
      }
    } catch (error) {
      console.error('Error removing account:', error);
      toast.error('Failed to remove account');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading w-6 h-6" />
        <span className="ml-2">Loading social media dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="h-6 w-6" />
            Social Media Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your social media accounts and automated posting
          </p>
        </div>
        <AddAccountDialog onAccountAdded={loadData} />
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="posts">Post History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Auto-Post Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          {accounts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No social media accounts connected
                </h3>
                <p className="text-gray-600 mb-4">
                  Connect your social media accounts to enable automated posting
                </p>
                <AddAccountDialog onAccountAdded={loadData} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map(account => (
                <Card key={account.platform}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={account.platform} />
                        <span className="font-medium">{account.platform}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAccount(account.platform)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      @{account.accountId}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {account.isActive && !account.tokenExpired ? (
                          <Badge className="bg-green-100 text-green-800" variant="secondary">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800" variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {account.tokenExpired ? 'Token Expired' : 'Inactive'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {account.expiresAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Expires: {new Date(account.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600">
                  Your social media posts will appear here once you start posting
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map(post => (
                <PostHistoryCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Total Posts</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">{analytics.totalPosts}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Successful</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">{analytics.successfulPosts}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium">Failed</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">{analytics.failedPosts}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium">Success Rate</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {analytics.totalPosts > 0
                        ? Math.round((analytics.successfulPosts / analytics.totalPosts) * 100)
                        : 0}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Breakdown</CardTitle>
                  <CardDescription>
                    Number of posts per platform in the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.platformBreakdown).map(([platform, count]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PlatformIcon platform={platform} />
                          <span className="font-medium">{platform}</span>
                        </div>
                        <Badge variant="outline">{count} posts</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No analytics data available
                </h3>
                <p className="text-gray-600">
                  Analytics will appear here once you start posting
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automatic Posting Settings</CardTitle>
              <CardDescription>
                Enable automatic posting to social media platforms when you create new listings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'autoPostToFacebook', platform: 'FACEBOOK', label: 'Facebook' },
                { key: 'autoPostToInstagram', platform: 'INSTAGRAM', label: 'Instagram' },
                { key: 'autoPostToTwitter', platform: 'TWITTER', label: 'Twitter / X' },
                { key: 'autoPostToTiktok', platform: 'TIKTOK', label: 'TikTok' },
                { key: 'autoPostToSnapchat', platform: 'SNAPCHAT', label: 'Snapchat' },
              ].map(({ key, platform, label }) => {
                const hasAccount = accounts.some(acc => acc.platform === platform && acc.isActive);

                return (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <PlatformIcon platform={platform} />
                      <div>
                        <span className="font-medium">{label}</span>
                        {!hasAccount && (
                          <p className="text-xs text-orange-600">Account required</p>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={autoPostSettings[key as keyof typeof autoPostSettings]}
                      onCheckedChange={(checked) => {
                        if (checked && !hasAccount) {
                          toast.error(`Please connect your ${label} account first`);
                          return;
                        }
                        setAutoPostSettings(prev => ({
                          ...prev,
                          [key]: checked,
                        }));
                      }}
                      disabled={!hasAccount}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}