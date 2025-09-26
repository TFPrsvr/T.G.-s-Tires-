import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/database';
import { SecurityInputValidator } from '@/lib/security/input-validator';
import { RateLimiter } from '@/lib/security/rate-limiter';
import { YardSaleItemSchema } from '@/types';

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

    // Validate the yard sale item data
    const validatedData = YardSaleItemSchema.parse({
      ...body,
      ownerId: userId,
      id: '',
      dateUploaded: new Date(),
      isActive: true,
    });

    // Security validation for required fields
    if (!validatedData.title || !validatedData.category || !validatedData.saleAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate price if provided
    if (validatedData.price && !SecurityInputValidator.validatePrice(validatedData.price)) {
      SecurityInputValidator.logSecurityEvent(
        'INVALID_YARD_SALE_PRICE',
        { price: validatedData.price, userId, itemTitle: validatedData.title },
        'MEDIUM'
      );
      return NextResponse.json(
        { error: 'Invalid price value' },
        { status: 400 }
      );
    }

    // Create the yard sale item
    const newItem = await db.createYardSaleItem({
      title: validatedData.title,
      description: validatedData.description,
      price: validatedData.price,
      category: validatedData.category,
      condition: validatedData.condition,
      images: validatedData.images,
      availableDates: validatedData.availableDates,
      saleAddress: validatedData.saleAddress,
      showAddress: validatedData.showAddress,
      isActive: validatedData.isActive,
      ownerId: userId,
    });

    SecurityInputValidator.logSecurityEvent(
      'YARD_SALE_ITEM_CREATED',
      {
        itemId: newItem.id,
        userId,
        category: newItem.category,
        hasPrice: !!newItem.price,
      },
      'LOW'
    );

    return NextResponse.json({
      success: true,
      item: newItem,
      message: 'Yard sale item created successfully'
    });

  } catch (error) {
    console.error('Yard sale creation error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid yard sale item data' },
        { status: 400 }
      );
    }

    SecurityInputValidator.logSecurityEvent(
      'YARD_SALE_CREATION_ERROR',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'MEDIUM'
    );

    return NextResponse.json(
      { error: 'Failed to create yard sale item' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);

    const ownerId = searchParams.get('ownerId');
    const category = searchParams.get('category');
    const condition = searchParams.get('condition');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const availableDate = searchParams.get('availableDate');

    let items;

    if (ownerId && userId && ownerId === userId) {
      // Get tab's own items (authenticated)
      items = await db.getYardSaleItemsByOwner(userId);
    } else {
      // Public search with filters
      items = await db.searchYardSaleItems({
        category: category || undefined,
        condition: condition || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        availableDate: availableDate ? new Date(availableDate) : undefined,
      });

      // Filter out inactive items for public view
      items = items.filter(item => item.isActive);

      // Hide sensitive info for public listings
      items = items.map(item => ({
        ...item,
        saleAddress: item.showAddress ? item.saleAddress : 'Address available to buyers',
      }));
    }

    return NextResponse.json({
      success: true,
      items,
      count: items.length
    });

  } catch (error) {
    console.error('Yard sale fetch error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch yard sale items' },
      { status: 500 }
    );
  }
}