import { z } from 'zod';

// Tab Schema (User Schema)
export const TabSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  preferredName: z.string().optional(),
  avatar: z.string().url().optional(),
  dateOfBirth: z.date().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['OWNER', 'ADMIN', 'USER']).default('USER'),
  permissions: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Tire Listing Schema
export const TireListingSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  price: z.number().positive(),
  size: z.string().min(1).max(50),
  brand: z.string().max(50).optional(),
  treadDepth: z.number().min(0).max(20).optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  features: z.array(z.string()).default([]),
  abnormalities: z.string().optional(),
  images: z.array(z.string().url()),

  // Rim service options
  rimServiceAvailable: z.boolean().default(false),
  rimServicePrice: z.number().positive().optional(),

  // Location and contact
  locationAddress: z.string().optional(),
  showAddress: z.boolean().default(false),

  // Metadata
  dateUploaded: z.date(),
  isActive: z.boolean().default(true),
  viewCount: z.number().default(0),
  ownerId: z.string(),
});

// Yard Sale Item Schema
export const YardSaleItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  price: z.number().positive().optional(),
  category: z.string().max(50),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  images: z.array(z.string().url()),

  // Yard sale specific
  availableDates: z.array(z.date()),
  saleAddress: z.string(),
  showAddress: z.boolean().default(true),

  // Metadata
  dateUploaded: z.date(),
  isActive: z.boolean().default(true),
  ownerId: z.string(),
});

// Payment Schema
export const PaymentSchema = z.object({
  id: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
  paymentMethod: z.enum(['STRIPE', 'CASH_ON_DELIVERY']),
  stripePaymentIntentId: z.string().optional(),

  // Item details
  itemId: z.string(),
  itemType: z.enum(['TIRE', 'YARD_SALE_ITEM']),

  // Service details
  includesRimService: z.boolean().default(false),
  rimServicePrice: z.number().optional(),

  // Tab info
  tabId: z.string(),
  tabEmail: z.string().email(),

  // Receipt details
  companyName: z.string().default("T.G.'s Tires"),
  receiptSent: z.boolean().default(false),

  createdAt: z.date(),
  updatedAt: z.date(),
});

// Notification Schema
export const NotificationSchema = z.object({
  id: z.string(),
  type: z.enum(['SMS', 'EMAIL', 'IN_APP']),
  title: z.string().max(100),
  message: z.string().max(1000),
  recipient: z.string(),
  status: z.enum(['PENDING', 'SENT', 'FAILED']),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  sentAt: z.date().optional(),
});

// Social Media Post Schema
export const SocialMediaPostSchema = z.object({
  id: z.string(),
  platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'TIKTOK', 'SNAPCHAT']),
  postId: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'POSTED', 'FAILED']),
  content: z.string().max(2000),
  images: z.array(z.string().url()),
  itemId: z.string(),
  itemType: z.enum(['TIRE', 'YARD_SALE_ITEM']),
  scheduledFor: z.date().optional(),
  postedAt: z.date().optional(),
  createdAt: z.date(),
  ownerId: z.string(),
});

// Settings Schema
export const SettingsSchema = z.object({
  id: z.string(),
  tabId: z.string(),

  // Notification preferences
  smsNotifications: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  inAppNotifications: z.boolean().default(true),

  // Social media settings
  autoPostToFacebook: z.boolean().default(false),
  autoPostToInstagram: z.boolean().default(false),
  autoPostToTwitter: z.boolean().default(false),
  autoPostToTiktok: z.boolean().default(false),
  autoPostToSnapchat: z.boolean().default(false),

  // Business settings
  showBusinessAddress: z.boolean().default(false),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().optional(),

  // Yard sale settings
  yardSaleEnabled: z.boolean().default(false),

  updatedAt: z.date(),
});

// Invitation Schema
export const InvitationSchema = z.object({
  id: z.string(),
  inviterEmail: z.string().email(),
  inviteeEmail: z.string().email(),
  role: z.enum(['ADMIN', 'USER']).default('USER'),
  permissions: z.array(z.string()).default([]),
  status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED']),
  token: z.string(),
  expiresAt: z.date(),
  acceptedAt: z.date().optional(),
  createdAt: z.date(),
});

// TypeScript types derived from schemas
export type Tab = z.infer<typeof TabSchema>;
export type TireListing = z.infer<typeof TireListingSchema>;
export type YardSaleItem = z.infer<typeof YardSaleItemSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type SocialMediaPost = z.infer<typeof SocialMediaPostSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type Invitation = z.infer<typeof InvitationSchema>;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Upload types
export interface UploadResult {
  url: string;
  key: string;
  name: string;
  size: number;
}

// Social Media API types
export interface SocialMediaAccount {
  platform: string;
  accountId: string;
  accessToken: string;
  isActive: boolean;
  expiresAt?: Date;
}

// Search and filter types
export interface TireSearchFilters {
  size?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  rimServiceAvailable?: boolean;
}

export interface YardSaleSearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  availableDate?: Date;
}