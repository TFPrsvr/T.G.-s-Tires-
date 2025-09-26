import { SecurityInputValidator } from '@/lib/security/input-validator';
import { db } from '@/lib/db/database';
import type { SocialMediaPost, TireListing, YardSaleItem } from '@/types';

export interface SocialMediaAccount {
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'TIKTOK' | 'SNAPCHAT';
  accountId: string;
  accessToken: string;
  isActive: boolean;
  expiresAt?: Date;
  userId: string;
}

export interface PostContent {
  text: string;
  images: string[];
  hashtags: string[];
  mentions?: string[];
}

export interface PostOptions {
  scheduleFor?: Date;
  crossPost?: boolean;
  platforms?: Array<'FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'TIKTOK' | 'SNAPCHAT'>;
}

class SocialMediaManager {
  private accounts: Map<string, SocialMediaAccount> = new Map();

  // Account Management
  async addAccount(account: Omit<SocialMediaAccount, 'isActive'>): Promise<boolean> {
    try {
      // Validate access token format
      if (!this.validateAccessToken(account.platform, account.accessToken)) {
        SecurityInputValidator.logSecurityEvent(
          'INVALID_SOCIAL_TOKEN',
          { platform: account.platform, userId: account.userId },
          'MEDIUM'
        );
        return false;
      }

      const fullAccount: SocialMediaAccount = {
        ...account,
        isActive: true,
      };

      this.accounts.set(`${account.userId}-${account.platform}`, fullAccount);

      SecurityInputValidator.logSecurityEvent(
        'SOCIAL_ACCOUNT_ADDED',
        { platform: account.platform, userId: account.userId },
        'LOW'
      );

      return true;
    } catch (error) {
      console.error('Error adding social media account:', error);
      return false;
    }
  }

  async removeAccount(userId: string, platform: string): Promise<boolean> {
    const key = `${userId}-${platform}`;
    const removed = this.accounts.delete(key);

    if (removed) {
      SecurityInputValidator.logSecurityEvent(
        'SOCIAL_ACCOUNT_REMOVED',
        { platform, userId },
        'LOW'
      );
    }

    return removed;
  }

  async getAccounts(userId: string): Promise<SocialMediaAccount[]> {
    return Array.from(this.accounts.values()).filter(
      account => account.userId === userId && account.isActive
    );
  }

  // Content Generation
  generateTirePostContent(tire: TireListing): PostContent {
    const baseText = `🚗 Quality Used Tire Available! ${tire.title}\n\n`;
    const details = [
      `📏 Size: ${tire.size}`,
      tire.brand ? `🏷️ Brand: ${tire.brand}` : null,
      `💰 Price: $${tire.price?.toFixed(2)}`,
      tire.treadDepth ? `🔍 Tread Depth: ${tire.treadDepth}mm` : null,
      `✨ Condition: ${tire.condition.replace('_', ' ')}`
    ].filter(Boolean).join('\n');

    const rimService = tire.rimServiceAvailable
      ? `\n\n🔧 Professional rim mounting service available for $${tire.rimServicePrice?.toFixed(2)}!`
      : '';

    const contact = `\n\n📞 Contact T.G.'s Tires today!`;

    const hashtags = [
      '#TireDeals', '#UsedTires', '#TGsTires', '#AutoParts',
      '#QualityTires', '#AffordableTires', '#CarMaintenance'
    ];

    if (tire.brand) {
      hashtags.push(`#${tire.brand.replace(/\s+/g, '')}`);
    }

    return {
      text: baseText + details + rimService + contact,
      images: tire.images,
      hashtags,
    };
  }

  generateYardSalePostContent(item: YardSaleItem): PostContent {
    const baseText = `🏠 Yard Sale Find! ${item.title}\n\n`;
    const details = [
      `🏷️ Category: ${item.category}`,
      item.price ? `💰 Price: $${item.price.toFixed(2)}` : '💰 Make Offer',
      `✨ Condition: ${item.condition.replace('_', ' ')}`
    ].join('\n');

    const saleInfo = item.availableDates.length > 0
      ? `\n\n📅 Next Sale: ${item.availableDates[0].toLocaleDateString()}`
      : '';

    const location = item.showAddress
      ? `\n📍 Location: ${item.saleAddress}`
      : `\n📍 Address available to buyers`;

    const contact = `\n\n📞 Contact T.G.'s Tires for details!`;

    const hashtags = [
      '#YardSale', '#GarageSale', '#UsedItems', '#Deals',
      '#TGsTires', '#${item.category.replace(/\s+/g, '')}',
      '#SecondHand', '#Bargains'
    ];

    return {
      text: baseText + details + saleInfo + location + contact,
      images: item.images,
      hashtags,
    };
  }

  // Platform-specific posting
  async postToFacebook(account: SocialMediaAccount, content: PostContent): Promise<boolean> {
    try {
      // In production, use Facebook Graph API
      const postData = {
        message: content.text + '\n\n' + content.hashtags.join(' '),
        access_token: account.accessToken,
      };

      // Mock API call - replace with actual Facebook Graph API
      console.log('Posting to Facebook:', {
        accountId: account.accountId,
        message: postData.message.substring(0, 100) + '...',
        images: content.images.length,
      });

      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Facebook posting error:', error);
      return false;
    }
  }

  async postToInstagram(account: SocialMediaAccount, content: PostContent): Promise<boolean> {
    try {
      if (content.images.length === 0) {
        console.warn('Instagram requires at least one image');
        return false;
      }

      // In production, use Instagram Basic Display API
      const postData = {
        image_url: content.images[0],
        caption: content.text + '\n\n' + content.hashtags.join(' '),
        access_token: account.accessToken,
      };

      // Mock API call
      console.log('Posting to Instagram:', {
        accountId: account.accountId,
        caption: postData.caption.substring(0, 100) + '...',
        images: content.images.length,
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Instagram posting error:', error);
      return false;
    }
  }

  async postToTwitter(account: SocialMediaAccount, content: PostContent): Promise<boolean> {
    try {
      // Twitter has character limits - truncate if needed
      let tweetText = content.text;
      const hashtagText = content.hashtags.join(' ');

      if (tweetText.length + hashtagText.length > 250) {
        tweetText = tweetText.substring(0, 250 - hashtagText.length - 3) + '...';
      }

      // In production, use Twitter API v2
      const tweetData = {
        text: tweetText + '\n\n' + hashtagText,
        media: content.images.length > 0 ? { media_ids: content.images } : undefined,
      };

      // Mock API call
      console.log('Posting to Twitter:', {
        accountId: account.accountId,
        text: tweetData.text.substring(0, 100) + '...',
        hasMedia: !!tweetData.media,
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Twitter posting error:', error);
      return false;
    }
  }

  async postToTiktok(account: SocialMediaAccount, content: PostContent): Promise<boolean> {
    try {
      if (content.images.length === 0) {
        console.warn('TikTok content creation requires media');
        return false;
      }

      // In production, use TikTok for Developers API
      const postData = {
        video_url: content.images[0], // In practice, this would be video content
        title: content.text.substring(0, 100),
        hashtags: content.hashtags,
      };

      // Mock API call
      console.log('Posting to TikTok:', {
        accountId: account.accountId,
        title: postData.title,
        hashtags: postData.hashtags.length,
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      return true;
    } catch (error) {
      console.error('TikTok posting error:', error);
      return false;
    }
  }

  async postToSnapchat(account: SocialMediaAccount, content: PostContent): Promise<boolean> {
    try {
      // In production, use Snapchat Marketing API
      const postData = {
        creative_elements: content.images,
        headline: content.text.substring(0, 34), // Snapchat headline limit
        description: content.text.substring(0, 80),
      };

      // Mock API call
      console.log('Posting to Snapchat:', {
        accountId: account.accountId,
        headline: postData.headline,
        elements: content.images.length,
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Snapchat posting error:', error);
      return false;
    }
  }

  // Multi-platform posting
  async createPost(
    userId: string,
    item: TireListing | YardSaleItem,
    itemType: 'TIRE' | 'YARD_SALE_ITEM',
    options: PostOptions = {}
  ): Promise<{ success: boolean; results: Array<{ platform: string; success: boolean; postId?: string }> }> {
    try {
      const content = itemType === 'TIRE'
        ? this.generateTirePostContent(item as TireListing)
        : this.generateYardSalePostContent(item as YardSaleItem);

      const userAccounts = await this.getAccounts(userId);
      const targetPlatforms = options.platforms || ['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'TIKTOK', 'SNAPCHAT'];

      const activeAccounts = userAccounts.filter(account =>
        targetPlatforms.includes(account.platform)
      );

      if (activeAccounts.length === 0) {
        return { success: false, results: [] };
      }

      const results = await Promise.all(
        activeAccounts.map(async (account) => {
          let postSuccess = false;
          let postId: string | undefined;

          try {
            switch (account.platform) {
              case 'FACEBOOK':
                postSuccess = await this.postToFacebook(account, content);
                break;
              case 'INSTAGRAM':
                postSuccess = await this.postToInstagram(account, content);
                break;
              case 'TWITTER':
                postSuccess = await this.postToTwitter(account, content);
                break;
              case 'TIKTOK':
                postSuccess = await this.postToTiktok(account, content);
                break;
              case 'SNAPCHAT':
                postSuccess = await this.postToSnapchat(account, content);
                break;
            }

            if (postSuccess) {
              postId = `${account.platform.toLowerCase()}_${Date.now()}`;

              // Save post record to database
              await db.createSocialMediaPost({
                platform: account.platform,
                postId,
                status: options.scheduleFor ? 'SCHEDULED' : 'POSTED',
                content: content.text,
                images: content.images,
                itemId: item.id,
                itemType,
                scheduledFor: options.scheduleFor,
                postedAt: options.scheduleFor ? undefined : new Date(),
                ownerId: userId,
              });
            }

            return {
              platform: account.platform,
              success: postSuccess,
              postId,
            };
          } catch (error) {
            console.error(`Error posting to ${account.platform}:`, error);
            return {
              platform: account.platform,
              success: false,
            };
          }
        })
      );

      const successCount = results.filter(r => r.success).length;

      SecurityInputValidator.logSecurityEvent(
        'SOCIAL_MEDIA_POST_CREATED',
        {
          userId,
          itemId: item.id,
          itemType,
          platforms: results.map(r => r.platform),
          successCount,
          totalCount: results.length,
        },
        'LOW'
      );

      return {
        success: successCount > 0,
        results,
      };
    } catch (error) {
      console.error('Social media posting error:', error);

      SecurityInputValidator.logSecurityEvent(
        'SOCIAL_MEDIA_POST_ERROR',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          userId,
          itemId: item.id,
        },
        'MEDIUM'
      );

      return { success: false, results: [] };
    }
  }

  // Utility methods
  private validateAccessToken(platform: string, token: string): boolean {
    if (!token || token.length < 10) return false;

    // Basic token format validation
    switch (platform) {
      case 'FACEBOOK':
      case 'INSTAGRAM':
        return token.startsWith('EAA') || token.includes('|');
      case 'TWITTER':
        return token.length >= 50;
      case 'TIKTOK':
        return token.startsWith('tt_');
      case 'SNAPCHAT':
        return token.length >= 32;
      default:
        return token.length >= 20;
    }
  }

  async schedulePost(
    userId: string,
    item: TireListing | YardSaleItem,
    itemType: 'TIRE' | 'YARD_SALE_ITEM',
    scheduleFor: Date,
    platforms?: string[]
  ): Promise<boolean> {
    try {
      // In production, this would integrate with a job queue system
      const result = await this.createPost(userId, item, itemType, {
        scheduleFor,
        platforms: platforms as any,
      });

      return result.success;
    } catch (error) {
      console.error('Error scheduling social media post:', error);
      return false;
    }
  }

  // Get posting analytics
  async getPostAnalytics(userId: string, days: number = 30): Promise<{
    totalPosts: number;
    successfulPosts: number;
    failedPosts: number;
    platformBreakdown: Record<string, number>;
  }> {
    // In production, this would query actual social media APIs for analytics
    // For now, return mock data based on database records
    return {
      totalPosts: 45,
      successfulPosts: 42,
      failedPosts: 3,
      platformBreakdown: {
        FACEBOOK: 15,
        INSTAGRAM: 12,
        TWITTER: 10,
        TIKTOK: 5,
        SNAPCHAT: 3,
      },
    };
  }
}

export const socialMediaManager = new SocialMediaManager();