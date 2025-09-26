import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/database';
import { SecurityInputValidator } from '@/lib/security/input-validator';
import { RateLimiter } from '@/lib/security/rate-limiter';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const item = await db.getYardSaleItemById(id);

    if (!item) {
      return NextResponse.json({ error: 'Yard sale item not found' }, { status: 404 });
    }

    const { userId } = await auth();
    const isOwner = userId && item.ownerId === userId;

    // Hide sensitive info for non-owners
    const responseItem = {
      ...item,
      saleAddress: (isOwner || item.showAddress) ? item.saleAddress : 'Address available to buyers',
    };

    return NextResponse.json({
      success: true,
      item: responseItem
    });

  } catch (error) {
    console.error('Yard sale item fetch error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch yard sale item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const clientIP = request.ip || '127.0.0.1';

    // Rate limiting
    const rateLimitResult = RateLimiter.check(clientIP, 'API');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Check if item exists and user owns it
    const existingItem = await db.getYardSaleItemById(id);
    if (!existingItem) {
      return NextResponse.json({ error: 'Yard sale item not found' }, { status: 404 });
    }

    if (existingItem.ownerId !== userId) {
      SecurityInputValidator.logSecurityEvent(
        'UNAUTHORIZED_YARD_SALE_UPDATE',
        { itemId: id, userId, actualOwnerId: existingItem.ownerId },
        'HIGH'
      );
      return NextResponse.json({ error: 'Not authorized to update this item' }, { status: 403 });
    }

    const body = await request.json();

    // Validate price if provided
    if (body.price !== undefined && body.price !== null && !SecurityInputValidator.validatePrice(body.price)) {
      SecurityInputValidator.logSecurityEvent(
        'INVALID_YARD_SALE_PRICE_UPDATE',
        { price: body.price, userId, itemId: id },
        'MEDIUM'
      );
      return NextResponse.json(
        { error: 'Invalid price value' },
        { status: 400 }
      );
    }

    // Update the item
    const updatedItem = await db.updateYardSaleItem(id, {
      ...body,
      // Prevent updating sensitive fields
      id: existingItem.id,
      ownerId: existingItem.ownerId,
      dateUploaded: existingItem.dateUploaded,
    });

    if (!updatedItem) {
      return NextResponse.json({ error: 'Failed to update yard sale item' }, { status: 500 });
    }

    SecurityInputValidator.logSecurityEvent(
      'YARD_SALE_ITEM_UPDATED',
      {
        itemId: id,
        userId,
        updatedFields: Object.keys(body),
      },
      'LOW'
    );

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: 'Yard sale item updated successfully'
    });

  } catch (error) {
    console.error('Yard sale item update error:', error);

    SecurityInputValidator.logSecurityEvent(
      'YARD_SALE_UPDATE_ERROR',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'MEDIUM'
    );

    return NextResponse.json(
      { error: 'Failed to update yard sale item' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const clientIP = request.ip || '127.0.0.1';

    // Rate limiting
    const rateLimitResult = RateLimiter.check(clientIP, 'API');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Check if item exists and user owns it
    const existingItem = await db.getYardSaleItemById(id);
    if (!existingItem) {
      return NextResponse.json({ error: 'Yard sale item not found' }, { status: 404 });
    }

    if (existingItem.ownerId !== userId) {
      SecurityInputValidator.logSecurityEvent(
        'UNAUTHORIZED_YARD_SALE_PATCH',
        { itemId: id, userId, actualOwnerId: existingItem.ownerId },
        'HIGH'
      );
      return NextResponse.json({ error: 'Not authorized to update this item' }, { status: 403 });
    }

    const body = await request.json();

    // Partial update - only allow specific fields
    const allowedFields = ['isActive', 'price', 'description', 'availableDates', 'showAddress'];
    const updateData = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {} as any);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Validate price if being updated
    if (updateData.price !== undefined && updateData.price !== null && !SecurityInputValidator.validatePrice(updateData.price)) {
      return NextResponse.json(
        { error: 'Invalid price value' },
        { status: 400 }
      );
    }

    const updatedItem = await db.updateYardSaleItem(id, updateData);

    if (!updatedItem) {
      return NextResponse.json({ error: 'Failed to update yard sale item' }, { status: 500 });
    }

    SecurityInputValidator.logSecurityEvent(
      'YARD_SALE_ITEM_PATCHED',
      {
        itemId: id,
        userId,
        updatedFields: Object.keys(updateData),
      },
      'LOW'
    );

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: 'Yard sale item updated successfully'
    });

  } catch (error) {
    console.error('Yard sale item patch error:', error);

    return NextResponse.json(
      { error: 'Failed to update yard sale item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const clientIP = request.ip || '127.0.0.1';

    // Rate limiting
    const rateLimitResult = RateLimiter.check(clientIP, 'API');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Check if item exists and user owns it
    const existingItem = await db.getYardSaleItemById(id);
    if (!existingItem) {
      return NextResponse.json({ error: 'Yard sale item not found' }, { status: 404 });
    }

    if (existingItem.ownerId !== userId) {
      SecurityInputValidator.logSecurityEvent(
        'UNAUTHORIZED_YARD_SALE_DELETE',
        { itemId: id, userId, actualOwnerId: existingItem.ownerId },
        'HIGH'
      );
      return NextResponse.json({ error: 'Not authorized to delete this item' }, { status: 403 });
    }

    const deleted = await db.deleteYardSaleItem(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete yard sale item' }, { status: 500 });
    }

    SecurityInputValidator.logSecurityEvent(
      'YARD_SALE_ITEM_DELETED',
      {
        itemId: id,
        userId,
        itemTitle: existingItem.title,
        category: existingItem.category,
      },
      'LOW'
    );

    return NextResponse.json({
      success: true,
      message: 'Yard sale item deleted successfully'
    });

  } catch (error) {
    console.error('Yard sale item deletion error:', error);

    SecurityInputValidator.logSecurityEvent(
      'YARD_SALE_DELETE_ERROR',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'MEDIUM'
    );

    return NextResponse.json(
      { error: 'Failed to delete yard sale item' },
      { status: 500 }
    );
  }
}