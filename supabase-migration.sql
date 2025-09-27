-- T.G.'s Tires Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/zydvqvjoazsymbscjnzx/sql

-- Create enum types
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SELLER', 'BUYER');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION');
CREATE TYPE "TeamRole" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER');
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');
CREATE TYPE "TireCondition" AS ENUM ('LIKE_NEW', 'GOOD', 'FAIR', 'POOR');
CREATE TYPE "ItemCondition" AS ENUM ('EXCELLENT', 'VERY_GOOD', 'GOOD', 'FAIR', 'POOR');
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PENDING', 'SOLD', 'EXPIRED', 'REMOVED');
CREATE TYPE "YardSaleCategory" AS ENUM ('FURNITURE', 'ELECTRONICS', 'CLOTHING', 'TOYS', 'BOOKS', 'KITCHEN', 'DECOR', 'TOOLS', 'SPORTS', 'OTHER');
CREATE TYPE "OrderType" AS ENUM ('TIRE', 'YARD_SALE');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "DeliveryMethod" AS ENUM ('PICKUP', 'DELIVERY', 'SHIPPING');
CREATE TYPE "MessageType" AS ENUM ('INQUIRY', 'OFFER', 'SYSTEM', 'SUPPORT');
CREATE TYPE "MessageStatus" AS ENUM ('UNREAD', 'READ', 'REPLIED', 'ARCHIVED');
CREATE TYPE "MessagePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "NotificationType" AS ENUM ('MESSAGE', 'SALE', 'LISTING', 'TEAM', 'SYSTEM', 'PAYMENT');
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'read', 'DISMISSED');
CREATE TYPE "ReviewType" AS ENUM ('SELLER', 'BUYER', 'PRODUCT');

-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar TEXT,
    business_name TEXT,
    business_description TEXT,
    business_address TEXT,
    business_hours TEXT,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    desktop_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    profile_visible BOOLEAN DEFAULT true,
    show_contact_info BOOLEAN DEFAULT true,
    analytics_tracking BOOLEAN DEFAULT false,
    role "UserRole" DEFAULT 'SELLER',
    status "UserStatus" DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Team members table
CREATE TABLE team_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    team_id TEXT NOT NULL,
    role "TeamRole" DEFAULT 'MEMBER',
    status "InvitationStatus" DEFAULT 'PENDING',
    invited_by TEXT,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    joined_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, team_id)
);

-- Tire listings table
CREATE TABLE tire_listings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT,
    size TEXT NOT NULL,
    tread_depth INTEGER NOT NULL,
    condition "TireCondition" NOT NULL,
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    rim_service_available BOOLEAN DEFAULT false,
    rim_service_price DECIMAL(10,2),
    images TEXT[] DEFAULT '{}',
    status "ListingStatus" DEFAULT 'DRAFT',
    featured BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    location TEXT,
    contact_info TEXT,
    seller_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    published_at TIMESTAMP WITH TIME ZONE,
    sold_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Yard sale items table
CREATE TABLE yard_sale_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category "YardSaleCategory" NOT NULL,
    brand TEXT,
    size TEXT,
    condition "ItemCondition" NOT NULL,
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    negotiable BOOLEAN DEFAULT false,
    pickup_only BOOLEAN DEFAULT false,
    cash_only BOOLEAN DEFAULT false,
    sale_date TIMESTAMP WITH TIME ZONE,
    sale_time TEXT,
    sale_address TEXT,
    images TEXT[] DEFAULT '{}',
    status "ListingStatus" DEFAULT 'DRAFT',
    views INTEGER DEFAULT 0,
    seller_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    sold_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_number TEXT UNIQUE NOT NULL,
    buyer_id TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    listing_type "OrderType" NOT NULL,
    item_price DECIMAL(10,2) NOT NULL,
    service_price DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status "PaymentStatus" DEFAULT 'PENDING',
    payment_method TEXT,
    stripe_payment_id TEXT,
    status "OrderStatus" DEFAULT 'PENDING',
    delivery_method "DeliveryMethod" NOT NULL,
    delivery_address TEXT,
    delivery_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (listing_id) REFERENCES tire_listings(id)
);

-- Messages table
CREATE TABLE messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    subject TEXT,
    content TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    recipient_id TEXT,
    listing_id TEXT,
    message_type "MessageType" DEFAULT 'INQUIRY',
    status "MessageStatus" DEFAULT 'UNREAD',
    priority "MessagePriority" DEFAULT 'NORMAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (listing_id) REFERENCES tire_listings(id)
);

-- Notifications table
CREATE TABLE notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type "NotificationType" NOT NULL,
    priority "NotificationPriority" DEFAULT 'MEDIUM',
    status "NotificationStatus" DEFAULT 'UNREAD',
    user_id TEXT NOT NULL,
    related_id TEXT,
    related_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    reviewer_id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    order_id TEXT,
    review_type "ReviewType" DEFAULT 'SELLER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (listing_id) REFERENCES tire_listings(id),
    UNIQUE(reviewer_id, listing_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tire_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE yard_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Optimized RLS policies with single permissive policies per action
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING ((SELECT auth.uid())::text = clerk_id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING ((SELECT auth.uid())::text = clerk_id);

-- Consolidated tire listings policies (single policy per action)
CREATE POLICY "View tire listings" ON tire_listings FOR SELECT USING (
  status = 'ACTIVE' OR (SELECT auth.uid())::text = (SELECT clerk_id FROM users WHERE id = seller_id)
);
CREATE POLICY "Insert tire listings" ON tire_listings FOR INSERT WITH CHECK (
  (SELECT auth.uid())::text = (SELECT clerk_id FROM users WHERE id = seller_id)
);
CREATE POLICY "Update tire listings" ON tire_listings FOR UPDATE USING (
  (SELECT auth.uid())::text = (SELECT clerk_id FROM users WHERE id = seller_id)
);
CREATE POLICY "Delete tire listings" ON tire_listings FOR DELETE USING (
  (SELECT auth.uid())::text = (SELECT clerk_id FROM users WHERE id = seller_id)
);

-- Consolidated yard sale items policies (single policy per action)
CREATE POLICY "View yard sale items" ON yard_sale_items FOR SELECT USING (
  status = 'ACTIVE' OR (SELECT auth.uid())::text = (SELECT clerk_id FROM users WHERE id = seller_id)
);
CREATE POLICY "Insert yard sale items" ON yard_sale_items FOR INSERT WITH CHECK (
  (SELECT auth.uid())::text = (SELECT clerk_id FROM users WHERE id = seller_id)
);
CREATE POLICY "Update yard sale items" ON yard_sale_items FOR UPDATE USING (
  (SELECT auth.uid())::text = (SELECT clerk_id FROM users WHERE id = seller_id)
);
CREATE POLICY "Delete yard sale items" ON yard_sale_items FOR DELETE USING (
  (SELECT auth.uid())::text = (SELECT clerk_id FROM users WHERE id = seller_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tire_listings_seller ON tire_listings(seller_id);
CREATE INDEX idx_tire_listings_status ON tire_listings(status);
CREATE INDEX idx_yard_sale_items_seller ON yard_sale_items(seller_id);
CREATE INDEX idx_yard_sale_items_status ON yard_sale_items(status);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_reviews_listing ON reviews(listing_id);

-- Create updated_at trigger function with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tire_listings_updated_at BEFORE UPDATE ON tire_listings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_yard_sale_items_updated_at BEFORE UPDATE ON yard_sale_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();