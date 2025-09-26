// Database abstraction layer
// This will be implemented with Prisma once the database is set up

import type {
  Tab,
  TireListing,
  YardSaleItem,
  Payment,
  Notification,
  Settings,
  Invitation,
  SocialMediaPost
} from '@/types';

// Mock database for development
class MockDatabase {
  private tabs: Map<string, Tab> = new Map();
  private tireListings: Map<string, TireListing> = new Map();
  private yardSaleItems: Map<string, YardSaleItem> = new Map();
  private payments: Map<string, Payment> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private settings: Map<string, Settings> = new Map();
  private invitations: Map<string, Invitation> = new Map();
  private socialMediaPosts: Map<string, SocialMediaPost> = new Map();

  // Tab operations
  async createTab(data: Omit<Tab, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tab> {
    const tab: Tab = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tabs.set(tab.id, tab);
    return tab;
  }

  async getTabById(id: string): Promise<Tab | null> {
    return this.tabs.get(id) || null;
  }

  async getTabByEmail(email: string): Promise<Tab | null> {
    for (const tab of this.tabs.values()) {
      if (tab.email === email) return tab;
    }
    return null;
  }

  async updateTab(id: string, data: Partial<Tab>): Promise<Tab | null> {
    const tab = this.tabs.get(id);
    if (!tab) return null;

    const updatedTab = { ...tab, ...data, updatedAt: new Date() };
    this.tabs.set(id, updatedTab);
    return updatedTab;
  }

  // Tire listing operations
  async createTireListing(data: Omit<TireListing, 'id' | 'dateUploaded'>): Promise<TireListing> {
    const listing: TireListing = {
      ...data,
      id: this.generateId(),
      dateUploaded: new Date(),
    };
    this.tireListings.set(listing.id, listing);
    return listing;
  }

  async getTireListingById(id: string): Promise<TireListing | null> {
    return this.tireListings.get(id) || null;
  }

  async getTireListingsByOwner(ownerId: string): Promise<TireListing[]> {
    return Array.from(this.tireListings.values()).filter(
      listing => listing.ownerId === ownerId
    );
  }

  async getActiveTireListings(): Promise<TireListing[]> {
    return Array.from(this.tireListings.values()).filter(
      listing => listing.isActive
    );
  }

  async updateTireListing(id: string, data: Partial<TireListing>): Promise<TireListing | null> {
    const listing = this.tireListings.get(id);
    if (!listing) return null;

    const updatedListing = { ...listing, ...data };
    this.tireListings.set(id, updatedListing);
    return updatedListing;
  }

  async deleteTireListing(id: string): Promise<boolean> {
    return this.tireListings.delete(id);
  }

  // Yard sale operations
  async createYardSaleItem(data: Omit<YardSaleItem, 'id' | 'dateUploaded'>): Promise<YardSaleItem> {
    const item: YardSaleItem = {
      ...data,
      id: this.generateId(),
      dateUploaded: new Date(),
    };
    this.yardSaleItems.set(item.id, item);
    return item;
  }

  async getYardSaleItemsByOwner(ownerId: string): Promise<YardSaleItem[]> {
    return Array.from(this.yardSaleItems.values()).filter(
      item => item.ownerId === ownerId
    );
  }

  async getActiveYardSaleItems(): Promise<YardSaleItem[]> {
    return Array.from(this.yardSaleItems.values()).filter(
      item => item.isActive
    );
  }

  async getYardSaleItemById(id: string): Promise<YardSaleItem | null> {
    return this.yardSaleItems.get(id) || null;
  }

  async updateYardSaleItem(id: string, data: Partial<YardSaleItem>): Promise<YardSaleItem | null> {
    const item = this.yardSaleItems.get(id);
    if (!item) return null;

    const updatedItem = { ...item, ...data };
    this.yardSaleItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteYardSaleItem(id: string): Promise<boolean> {
    return this.yardSaleItems.delete(id);
  }

  // Search yard sale items
  async searchYardSaleItems(filters: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    availableDate?: Date;
    ownerId?: string;
  }): Promise<YardSaleItem[]> {
    let items = Array.from(this.yardSaleItems.values()).filter(item => item.isActive);

    if (filters.category) {
      items = items.filter(item =>
        item.category.toLowerCase().includes(filters.category!.toLowerCase())
      );
    }

    if (filters.condition) {
      items = items.filter(item => item.condition === filters.condition);
    }

    if (filters.minPrice) {
      items = items.filter(item => (item.price || 0) >= filters.minPrice!);
    }

    if (filters.maxPrice) {
      items = items.filter(item => (item.price || 0) <= filters.maxPrice!);
    }

    if (filters.availableDate) {
      items = items.filter(item =>
        item.availableDates.some(date =>
          date.toDateString() === filters.availableDate!.toDateString()
        )
      );
    }

    if (filters.ownerId) {
      items = items.filter(item => item.ownerId === filters.ownerId);
    }

    return items;
  }

  // Payment operations
  async createPayment(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const payment: Payment = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return this.payments.get(id) || null;
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment | null> {
    const payment = this.payments.get(id);
    if (!payment) return null;

    const updatedPayment = { ...payment, ...data, updatedAt: new Date() };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Settings operations
  async getSettingsByTabId(tabId: string): Promise<Settings | null> {
    for (const settings of this.settings.values()) {
      if (settings.tabId === tabId) return settings;
    }
    return null;
  }

  async updateSettings(tabId: string, data: Partial<Settings>): Promise<Settings> {
    let settings = await this.getSettingsByTabId(tabId);

    if (!settings) {
      settings = {
        id: this.generateId(),
        tabId,
        smsNotifications: true,
        emailNotifications: true,
        inAppNotifications: true,
        autoPostToFacebook: false,
        autoPostToInstagram: false,
        autoPostToTwitter: false,
        autoPostToTiktok: false,
        autoPostToSnapchat: false,
        showBusinessAddress: false,
        yardSaleEnabled: false,
        updatedAt: new Date(),
      };
    }

    const updatedSettings = { ...settings, ...data, updatedAt: new Date() };
    this.settings.set(updatedSettings.id, updatedSettings);
    return updatedSettings;
  }

  // Notification operations
  async createNotification(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const notification: Notification = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async getNotificationsByRecipient(recipient: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      notification => notification.recipient === recipient
    );
  }

  // Social media post operations
  async createSocialMediaPost(data: Omit<SocialMediaPost, 'id' | 'createdAt'>): Promise<SocialMediaPost> {
    const post: SocialMediaPost = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.socialMediaPosts.set(post.id, post);
    return post;
  }

  async getSocialMediaPostsByOwner(ownerId: string): Promise<SocialMediaPost[]> {
    return Array.from(this.socialMediaPosts.values()).filter(
      post => post.ownerId === ownerId
    );
  }

  async getSocialMediaPostsByItem(itemId: string): Promise<SocialMediaPost[]> {
    return Array.from(this.socialMediaPosts.values()).filter(
      post => post.itemId === itemId
    );
  }

  async updateSocialMediaPost(id: string, data: Partial<SocialMediaPost>): Promise<SocialMediaPost | null> {
    const post = this.socialMediaPosts.get(id);
    if (!post) return null;

    const updatedPost = { ...post, ...data };
    this.socialMediaPosts.set(id, updatedPost);
    return updatedPost;
  }

  // Invitation operations
  async createInvitation(data: Omit<Invitation, 'id' | 'token' | 'createdAt'>): Promise<Invitation> {
    const invitation: Invitation = {
      ...data,
      id: this.generateId(),
      token: this.generateToken(),
      createdAt: new Date(),
    };
    this.invitations.set(invitation.id, invitation);
    return invitation;
  }

  async getInvitationByToken(token: string): Promise<Invitation | null> {
    for (const invitation of this.invitations.values()) {
      if (invitation.token === token) return invitation;
    }
    return null;
  }

  async getInvitationById(id: string): Promise<Invitation | null> {
    return this.invitations.get(id) || null;
  }

  async getInvitationsByEmail(email: string): Promise<Invitation[]> {
    return Array.from(this.invitations.values()).filter(
      invitation => invitation.inviteeEmail === email
    );
  }

  async getInvitationsByInviter(inviterEmail: string): Promise<Invitation[]> {
    return Array.from(this.invitations.values()).filter(
      invitation => invitation.inviterEmail === inviterEmail
    );
  }

  async getPendingInvitationCount(inviterEmail: string): Promise<number> {
    return Array.from(this.invitations.values()).filter(
      invitation => invitation.inviterEmail === inviterEmail && invitation.status === 'PENDING'
    ).length;
  }

  async updateInvitation(id: string, data: Partial<Invitation>): Promise<Invitation | null> {
    const invitation = this.invitations.get(id);
    if (!invitation) return null;

    const updatedInvitation = { ...invitation, ...data };
    this.invitations.set(id, updatedInvitation);
    return updatedInvitation;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateToken(): string {
    return Math.random().toString(36).substr(2, 32);
  }
}

export const db = new MockDatabase();

// In production, replace with:
// import { PrismaClient } from '@prisma/client'
// export const db = new PrismaClient()