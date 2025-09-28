import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const TireListingUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  brand: z.string().min(1, 'Brand is required').optional(),
  model: z.string().optional(),
  size: z.string().min(1, 'Size is required').optional(),
  treadDepth: z.number().min(1, 'Tread depth is required').optional(),
  condition: z.enum(['LIKE_NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1').optional(),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  rimServiceAvailable: z.boolean().optional(),
  rimServicePrice: z.number().min(0).optional(),
  location: z.string().optional(),
  contactInfo: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'PENDING']).optional(),
});

// GET single listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const listing = await prisma.tireListing.findFirst({
      where: {
        id: params.id,
        sellerId: user.id
      }
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json(listing);

  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update listing
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = TireListingUpdateSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if listing exists and belongs to user
    const existingListing = await prisma.tireListing.findFirst({
      where: {
        id: params.id,
        sellerId: user.id
      }
    });

    if (!existingListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Update the listing
    const updatedListing = await prisma.tireListing.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      listing: updatedListing
    });

  } catch (error) {
    console.error('Error updating tire listing:', error);

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

// DELETE listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if listing exists and belongs to user
    const existingListing = await prisma.tireListing.findFirst({
      where: {
        id: params.id,
        sellerId: user.id
      }
    });

    if (!existingListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Delete the listing
    await prisma.tireListing.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting tire listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}