import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const TireListingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().optional(),
  size: z.string().min(1, 'Size is required'),
  treadDepth: z.number().min(1, 'Tread depth is required'),
  condition: z.enum(['LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price cannot be negative'),
  rimServiceAvailable: z.boolean().optional(),
  rimServicePrice: z.number().min(0).optional(),
  location: z.string().optional(),
  contactInfo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = TireListingSchema.parse(body);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create tire listing
    const listing = await prisma.tireListing.create({
      data: {
        ...validatedData,
        sellerId: user.id,
        status: 'ACTIVE',
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        status: listing.status
      }
    });

  } catch (error) {
    console.error('Error creating tire listing:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const size = searchParams.get('size');
    const location = searchParams.get('location');

    // For marketplace (public) access, show only published listings
    // For dashboard (authenticated user), show their own listings
    const isPublicAccess = status === 'PUBLISHED';

    const where: Record<string, any> = {};

    if (isPublicAccess) {
      // Public marketplace access - show published listings from all users
      where.status = 'PUBLISHED';
    } else if (userId) {
      // Dashboard access - show user's own listings
      const user = await prisma.user.findUnique({
        where: { clerkId: userId }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      where.sellerId = user.id;
      if (status) {
        where.status = status.toUpperCase();
      }
    } else {
      // No user and not public access
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add search filters
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (size) {
      where.size = size;
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Get listings with pagination
    const [listings, total] = await Promise.all([
      prisma.tireListing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            }
          }
        }
      }),
      prisma.tireListing.count({ where })
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching tire listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}