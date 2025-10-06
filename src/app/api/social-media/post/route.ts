import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/database';
import { socialMediaManager } from '@/lib/social-media/social-media-manager';
import { SecurityInputValidator } from '@/lib/security/input-validator';
import { RateLimiter } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientIP = request.ip || '127.0.0.1';

    // Rate limiting for social media posts
    const rateLimitResult = RateLimiter.check(clientIP, 'SOCIAL_MEDIA');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before posting again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      itemId,
      itemType,
      platforms,
      scheduleFor,
    } = body;

    // Validate required fields
    if (!itemId || !itemType) {
      return NextResponse.json(
        { error: 'Missing required fields: itemId, itemType' },
        { status: 400 }
      );
    }

    if (!['TIRE', 'YARD_SALE_ITEM'].includes(itemType)) {
      return NextResponse.json(
        { error: 'Invalid item type' },
        { status: 400 }
      );
    }

    // Get the item to post about
    let item;
    if (itemType === 'TIRE') {
      item = await db.getTireListingById(itemId);
    } else {
      item = await db.getYardSaleItemById(itemId);
    }

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (item.ownerId !== userId) {
      SecurityInputValidator.logSecurityEvent(
        'UNAUTHORIZED_SOCIAL_POST',
        { itemId, userId, actualOwnerId: item.ownerId },
        'HIGH'
      );
      return NextResponse.json(
        { error: 'Not authorized to post about this item' },
        { status: 403 }
      );
    }

    // Validate platforms if specified
    const validPlatforms = ['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'TIKTOK', 'SNAPCHAT'];
    const targetPlatforms = platforms?.length > 0
      ? platforms.filter((p: string) => validPlatforms.includes(p))
      : validPlatforms;

    if (targetPlatforms.length === 0) {
      return NextResponse.json(
        { error: 'No valid platforms specified' },
        { status: 400 }
      );
    }

    // Parse schedule date if provided
    let scheduledDate;
    if (scheduleFor) {
      scheduledDate = new Date(scheduleFor);
      if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
        return NextResponse.json(
          { error: 'Invalid schedule date. Must be in the future.' },
          { status: 400 }
        );
      }
    }

    // Create the post
    const result = await socialMediaManager.createPost(
      userId,
      item,
      itemType,
      {
        platforms: targetPlatforms,
        scheduleFor: scheduledDate,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to create social media posts' },
        { status: 500 }
      );
    }

    const successfulPosts = result.results.filter(r => r.success);
    const failedPosts = result.results.filter(r => !r.success);

    return NextResponse.json({
      success: true,
      message: `Successfully posted to ${successfulPosts.length} platform(s)`,
      results: {
        successful: successfulPosts,
        failed: failedPosts,
        totalAttempted: result.results.length,
        successCount: successfulPosts.length,
      }
    });

  } catch (error) {
    console.error('Social media post creation error:', error);

    SecurityInputValidator.logSecurityEvent(
      'SOCIAL_MEDIA_POST_ERROR',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'MEDIUM'
    );

    return NextResponse.json(
      { error: 'Failed to create social media post' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    let posts;
    if (itemId) {
      // Get posts for specific item
      posts = await db.getSocialMediaPostsByItem(itemId);
      // Verify user owns the item
      const allPosts = posts.filter(post => post.ownerId === userId);
      posts = allPosts;
    } else {
      // Get all user's posts
      posts = await db.getSocialMediaPostsByOwner(userId);
    }

    // Get analytics
    const analytics = await socialMediaManager.getPostAnalytics(userId);

    return NextResponse.json({
      success: true,
      posts,
      analytics,
      count: posts.length
    });

  } catch (error) {
    console.error('Social media posts fetch error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch social media posts' },
      { status: 500 }
    );
  }
}