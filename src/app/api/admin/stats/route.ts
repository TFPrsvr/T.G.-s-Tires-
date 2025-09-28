import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Admin email list - in production, this would be in environment variables
const ADMIN_EMAILS = [
  "admin@tgtires.com",
  "support@tgtires.com",
  // Add your admin emails here
];

async function isAdmin() {
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  return userEmail && ADMIN_EMAILS.includes(userEmail);
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get comprehensive stats
    const [
      totalUsers,
      totalListings,
      publishedListings,
      pendingListings,
      draftListings,
      totalViews
    ] = await Promise.all([
      prisma.user.count(),
      prisma.tireListing.count(),
      prisma.tireListing.count({ where: { status: 'PUBLISHED' } }),
      prisma.tireListing.count({ where: { status: 'PENDING' } }),
      prisma.tireListing.count({ where: { status: 'DRAFT' } }),
      prisma.tireListing.aggregate({
        _sum: { views: true }
      })
    ]);

    // Get recent activity (last 10 listings)
    const recentActivity = await prisma.tireListing.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      totalUsers,
      totalListings,
      publishedListings,
      pendingListings,
      draftListings,
      totalViews: totalViews._sum.views || 0,
      recentActivity
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}