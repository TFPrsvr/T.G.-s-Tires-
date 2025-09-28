import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all stats in parallel
    const [
      totalListings,
      activeListings,
      soldListings,
      draftListings,
      totalViews,
      yardSaleItems,
      totalMessages,
      unreadMessages,
      thisMonthListings,
      thisMonthViews,
    ] = await Promise.all([
      // Total listings
      prisma.tireListing.count({
        where: { sellerId: user.id }
      }),

      // Active listings
      prisma.tireListing.count({
        where: { sellerId: user.id, status: 'ACTIVE' }
      }),

      // Sold listings
      prisma.tireListing.count({
        where: { sellerId: user.id, status: 'SOLD' }
      }),

      // Draft listings
      prisma.tireListing.count({
        where: { sellerId: user.id, status: 'DRAFT' }
      }),

      // Total views
      prisma.tireListing.aggregate({
        where: { sellerId: user.id },
        _sum: { views: true }
      }),

      // Yard sale items
      prisma.yardSaleItem.count({
        where: { sellerId: user.id }
      }),

      // Total messages
      prisma.message.count({
        where: {
          OR: [
            { senderId: user.id },
            { recipientId: user.id }
          ]
        }
      }),

      // Unread messages
      prisma.message.count({
        where: {
          recipientId: user.id,
          status: 'UNREAD'
        }
      }),

      // This month's listings
      prisma.tireListing.count({
        where: {
          sellerId: user.id,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // This month's views
      prisma.tireListing.aggregate({
        where: {
          sellerId: user.id,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { views: true }
      }),
    ]);

    // Calculate growth percentages (mock for now - would need historical data)
    const stats = {
      totalListings: {
        value: totalListings,
        change: '+12%',
        trend: 'up' as const
      },
      activeListings: {
        value: activeListings,
        change: '+8%',
        trend: 'up' as const
      },
      totalViews: {
        value: totalViews._sum.views || 0,
        change: '+24%',
        trend: 'up' as const
      },
      soldItems: {
        value: soldListings,
        change: '+15%',
        trend: 'up' as const
      },
      yardSaleItems: {
        value: yardSaleItems,
        change: '+5%',
        trend: 'up' as const
      },
      messages: {
        total: totalMessages,
        unread: unreadMessages,
        change: '+3%',
        trend: 'up' as const
      },
      thisMonth: {
        listings: thisMonthListings,
        views: thisMonthViews._sum.views || 0
      },
      breakdown: {
        active: activeListings,
        sold: soldListings,
        draft: draftListings,
        expired: totalListings - activeListings - soldListings - draftListings
      }
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}