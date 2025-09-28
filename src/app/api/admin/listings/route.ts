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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    let where: any = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    // Get listings with user information
    const listings = await prisma.tireListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
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

    const totalListings = await prisma.tireListing.count({ where });

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total: totalListings,
        totalPages: Math.ceil(totalListings / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}