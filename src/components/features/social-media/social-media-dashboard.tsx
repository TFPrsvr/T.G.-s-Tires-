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
  Music,
  Camera,
  Eye,
  ThumbsUp,
  MessageSquare as MessageIcon,
  TrendingUp,
  Users,
  ExternalLink,
  HelpCircle,
  Info
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
      return <Music className={className} />;
    case 'SNAPCHAT':
      return <Camera className={className} />;
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
    { value: 'TWITTER', label: 'X (formerly Twitter)' },
    { value: 'TIKTOK', label: 'TikTok' },
    { value: 'SNAPCHAT', label: 'Snapchat' },
  ];

  const getPlatformGuide = (platform: string) => {
    const guides = {
      FACEBOOK: {
        steps: [
          'Go to developers.facebook.com',
          'Create a new app (choose "Business" type)',
          'Add your Facebook page',
          'Generate a Page Access Token',
          'Use your Page ID as Account ID'
        ],
        link: 'https://developers.facebook.com/',
        tokenHelp: 'Get a Page Access Token from your app dashboard'
      },
      INSTAGRAM: {
        steps: [
          'Use Facebook for Developers (Instagram uses Facebook API)',
          'Connect your Instagram business account',
          'Generate an Instagram User Access Token',
          'Use your Instagram username as Account ID'
        ],
        link: 'https://developers.facebook.com/docs/instagram-api/',
        tokenHelp: 'Instagram tokens come through Facebook Developer platform'
      },
      TWITTER: {
        steps: [
          'Go to developer.twitter.com',
          'Apply for developer account (free)',
          'Create a new project/app',
          'Generate Bearer Token or Access Token',
          'Use your @username as Account ID'
        ],
        link: 'https://developer.twitter.com/',
        tokenHelp: 'Use Bearer Token for app-only access or Access Token for user context'
      },
      TIKTOK: {
        steps: [
          'Go to developers.tiktok.com',
          'Register as a developer',
          'Create an app for your business',
          'Complete OAuth flow to get access token',
          'Use your TikTok username as Account ID'
        ],
        link: 'https://developers.tiktok.com/',
        tokenHelp: 'TikTok requires OAuth authentication for access tokens'
      },
      SNAPCHAT: {
        steps: [
          'Go to developers.snap.com',
          'Register for Snapchat Marketing API',
          'Create an app',
          'Complete OAuth for access token',
          'Use your Snapchat username as Account ID'
        ],
        link: 'https://developers.snap.com/',
        tokenHelp: 'Snapchat uses OAuth flow for secure token generation'
      }
    };
    return guides[platform as keyof typeof guides];
  };

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
          See All Connected Accounts
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

          {formData.platform && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Setup Guide for {platforms.find(p => p.value === formData.platform)?.label}</h4>
              </div>

              {getPlatformGuide(formData.platform) && (
                <>
                  <div className="space-y-2">
                    <p className="text-sm text-blue-700 font-medium">Steps to get your access token:</p>
                    <ol className="text-sm text-blue-600 space-y-1 ml-4">
                      {getPlatformGuide(formData.platform).steps.map((step, index) => (
                        <li key={index} className="list-decimal">{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    <a
                      href={getPlatformGuide(formData.platform).link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Open {platforms.find(p => p.value === formData.platform)?.label} Developer Portal
                    </a>
                  </div>
                </>
              )}
            </div>
          )}

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
            {formData.platform && getPlatformGuide(formData.platform) && (
              <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-md">
                <Info className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  {getPlatformGuide(formData.platform).tokenHelp}
                </p>
              </div>
            )}
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
            <Button type="button" className="btn-primary" onClick={() => setOpen(false)}>
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
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
              <PlatformIcon platform={post.platform} className="h-4 w-4" />
              <span className="font-medium text-sm">Posted to {post.platform}</span>
            </div>
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
    <div className="space-y-4 mr-8 ml-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 ml-4">
            <Share2 className="h-8 w-8 text-blue-600" />
            Social Media Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg ml-6">
            Manage your social media accounts and automated posting
          </p>
        </div>
      </div>

      {/* Quick Actions Header */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50 flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Users className="h-5 w-5" />
              Connected Accounts
            </CardTitle>
            <CardDescription className="text-blue-600">
              Manage your social media connections
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4 flex-1 flex flex-col justify-end">
            <div className="text-2xl font-bold text-blue-800 mb-3">
              {accounts.length} Connected
            </div>
            <Button
              className="btn-primary w-full"
              onClick={() => document.getElementById('accounts')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Accounts
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <MessageIcon className="h-5 w-5" />
              Post History
            </CardTitle>
            <CardDescription className="text-green-600">
              View all your social media posts
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4 flex-1 flex flex-col justify-end">
            <div className="text-2xl font-bold text-green-800 mb-3">
              {posts.length} Posts
            </div>
            <Button
              className="btn-primary w-full"
              onClick={() => document.getElementById('post-history')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Posts
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription className="text-purple-600">
              Track your posting performance
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4 flex-1 flex flex-col justify-end">
            <div className="text-2xl font-bold text-purple-800 mb-3">
              {analytics?.successfulPosts || 0} Success
            </div>
            <Button
              className="btn-primary w-full"
              onClick={() => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Settings className="h-5 w-5" />
              Auto-Post Settings
            </CardTitle>
            <CardDescription className="text-orange-600">
              Configure automatic posting
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4 flex-1 flex flex-col justify-end">
            <div className="text-2xl font-bold text-orange-800 mb-3">
              {Object.values(autoPostSettings).filter(Boolean).length} Active
            </div>
            <Button
              className="btn-primary w-full"
              onClick={() => document.getElementById('settings')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts Section */}
      <section id="accounts" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 ml-4">
              <Users className="h-6 w-6 text-blue-600" />
              Connected Accounts
            </h2>
            <p className="text-gray-600 mt-1 ml-10">
              Manage your social media platform connections
            </p>
          </div>
          <AddAccountDialog onAccountAdded={loadData} />
        </div>

        {accounts.length === 0 ? (
          <Card className="border-blue-200">
            <CardContent className="py-12 text-center">
              <Share2 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map(account => (
              <Card key={account.platform} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <PlatformIcon platform={account.platform} className="h-6 w-6" />
                      <span className="font-semibold text-lg">{account.platform}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRemoveAccount(account.platform)}
                      className="btn-primary text-red-600 hover:text-red-700"
                      aria-label={`Remove ${account.platform} account`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 font-medium">
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
                    <p className="text-xs text-gray-500 mt-3">
                      Expires: {new Date(account.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Post History Section */}
      <section id="post-history" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 ml-4">
              <MessageIcon className="h-6 w-6 text-green-600" />
              Post History
            </h2>
            <p className="text-gray-600 mt-1 ml-10">
              View and manage all your social media posts
            </p>
          </div>
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create New Post
          </Button>
        </div>

        {posts.length === 0 ? (
          <Card className="border-green-200">
            <CardContent className="py-12 text-center">
              <MessageIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 mb-4">
                Your social media posts will appear here once you start posting
              </p>
              <Button className="btn-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <PostHistoryCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 ml-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              Analytics & Performance
            </h2>
            <p className="text-gray-600 mt-1 ml-10">
              Track your social media posting performance and engagement
            </p>
          </div>
          <Button className="btn-primary">
            <TrendingUp className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {analytics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    <span className="font-semibold">Total Posts</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{analytics.totalPosts}</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span className="font-semibold">Successful</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{analytics.successfulPosts}</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 bg-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="h-6 w-6 text-purple-600" />
                    <span className="font-semibold">Failed</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">{analytics.failedPosts}</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-6 w-6 text-red-600" />
                    <span className="font-semibold">Success Rate</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600">
                    {analytics.totalPosts > 0
                      ? Math.round((analytics.successfulPosts / analytics.totalPosts) * 100)
                      : 0}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-purple-200 ml-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Platform Breakdown
                </CardTitle>
                <CardDescription>
                  Number of posts per platform in the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.platformBreakdown).map(([platform, count]) => {
                    const isConnected = accounts.some(account => account.platform === platform && account.isActive && !account.tokenExpired);
                    return (
                      <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <PlatformIcon platform={platform} className="h-5 w-5" />
                          <span className="font-semibold">{platform}</span>
                          {isConnected ? (
                            <Badge className="bg-green-100 text-green-800" variant="secondary">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800" variant="secondary">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Not Connected
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="font-semibold">{count} posts</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-purple-200">
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No analytics data available
              </h3>
              <p className="text-gray-600 mb-4">
                Analytics will appear here once you start posting
              </p>
              <Button className="btn-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Start Posting to See Analytics
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Auto-Post Settings Section */}
      <section id="settings" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 ml-4">
              <Settings className="h-6 w-6 text-orange-600" />
              Auto-Post Settings
            </h2>
            <p className="text-gray-600 mt-1 ml-10">
              Configure automatic posting when you create new tire listings
            </p>
          </div>
          <Button className="btn-primary">
            <Settings className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              Automatic Posting Preferences
            </CardTitle>
            <CardDescription>
              Enable automatic posting to social media platforms when you create new listings.
              Connect your social media accounts first to activate automatic posting for each platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { key: 'autoPostToFacebook', platform: 'FACEBOOK', label: 'Facebook', description: 'Auto-post to your Facebook page or profile' },
              { key: 'autoPostToInstagram', platform: 'INSTAGRAM', label: 'Instagram', description: 'Share listings to your Instagram feed' },
              { key: 'autoPostToTwitter', platform: 'TWITTER', label: 'X (formerly Twitter)', description: 'Post your listings to X followers' },
              { key: 'autoPostToTiktok', platform: 'TIKTOK', label: 'TikTok', description: 'Create posts for TikTok audience' },
              { key: 'autoPostToSnapchat', platform: 'SNAPCHAT', label: 'Snapchat', description: 'Share to your Snapchat story' },
            ].map(({ key, platform, label, description }) => {
              const hasAccount = accounts.some(acc => acc.platform === platform && acc.isActive);

              return (
                <div key={key} className={`flex items-center justify-between p-4 border-2 rounded-lg transition-colors ${
                  hasAccount ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-4">
                    <PlatformIcon platform={platform} className="h-6 w-6" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{label}</span>
                        {hasAccount ? (
                          <Badge className="bg-green-100 text-green-800" variant="secondary">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800" variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Account Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{description}</p>
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

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg">Global Auto-Post Settings</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Apply these settings to all enabled platforms
                  </p>
                </div>
                <Button className="btn-gradient-primary">
                  <Settings className="h-4 w-4 mr-2" />
                  Save All Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}