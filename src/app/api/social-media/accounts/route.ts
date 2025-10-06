import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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

    // Rate limiting
    const rateLimitResult = RateLimiter.check(clientIP, 'API');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { platform, accountId, accessToken, expiresAt } = body;

    // Validate required fields
    if (!platform || !accountId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, accountId, accessToken' },
        { status: 400 }
      );
    }

    // Validate platform
    const validPlatforms = ['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'TIKTOK', 'SNAPCHAT'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be one of: ' + validPlatforms.join(', ') },
        { status: 400 }
      );
    }

    // Validate access token format (basic validation)
    if (accessToken.length < 10) {
      SecurityInputValidator.logSecurityEvent(
        'INVALID_SOCIAL_TOKEN_FORMAT',
        { platform, userId, tokenLength: accessToken.length },
        'MEDIUM'
      );
      return NextResponse.json(
        { error: 'Invalid access token format' },
        { status: 400 }
      );
    }

    // Parse expiration date if provided
    let expirationDate;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid expiration date format' },
          { status: 400 }
        );
      }
    }

    // Add the account
    const success = await socialMediaManager.addAccount({
      platform,
      accountId,
      accessToken,
      userId,
      expiresAt: expirationDate,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to add social media account' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${platform} account added successfully`,
      account: {
        platform,
        accountId,
        expiresAt: expirationDate,
        isActive: true,
      }
    });

  } catch (error) {
    console.error('Social media account addition error:', error);

    SecurityInputValidator.logSecurityEvent(
      'SOCIAL_ACCOUNT_ADD_ERROR',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'MEDIUM'
    );

    return NextResponse.json(
      { error: 'Failed to add social media account' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await socialMediaManager.getAccounts(userId);

    // Remove sensitive access tokens from response
    const safeAccounts = accounts.map(account => ({
      platform: account.platform,
      accountId: account.accountId,
      isActive: account.isActive,
      expiresAt: account.expiresAt,
      hasToken: !!account.accessToken,
      tokenExpired: account.expiresAt && account.expiresAt < new Date(),
    }));

    return NextResponse.json({
      success: true,
      accounts: safeAccounts,
      count: safeAccounts.length
    });

  } catch (error) {
    console.error('Social media accounts fetch error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch social media accounts' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform parameter is required' },
        { status: 400 }
      );
    }

    const success = await socialMediaManager.removeAccount(userId, platform);

    if (!success) {
      return NextResponse.json(
        { error: 'Account not found or already removed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${platform} account removed successfully`
    });

  } catch (error) {
    console.error('Social media account removal error:', error);

    return NextResponse.json(
      { error: 'Failed to remove social media account' },
      { status: 500 }
    );
  }
}