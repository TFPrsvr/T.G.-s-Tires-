# T.G.'s Tires - Vercel Environment Variables Setup Guide

## 🔐 Security Keys (CRITICAL - Generate First)

### 1. NEXTAUTH_SECRET
**Purpose:** Encrypts session tokens and cookies

**How to Generate:**
```bash
# Option 1: Using OpenSSL (Recommended)
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online Generator
# Visit: https://generate-secret.vercel.app/32
```

**Example Output:** `aB3dEf7GhI9jKl2MnO5pQr8StU1vWxY4zA6bC0dE=`

**Add to Vercel:**
- Variable Name: `NEXTAUTH_SECRET`
- Value: [Generated secret]
- Environment: Production, Preview, Development

---

### 2. ENCRYPTION_KEY
**Purpose:** Encrypts sensitive data in database (credit cards, personal info)

**How to Generate:**
```bash
# Generate 32-character encryption key
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example Output:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`

**Add to Vercel:**
- Variable Name: `ENCRYPTION_KEY`
- Value: [Generated key]
- Environment: Production, Preview, Development

---

## 🔑 Required Service Keys

### 3. Clerk Authentication
**Purpose:** User authentication and management

**How to Get:**
1. Go to https://dashboard.clerk.com
2. Sign up or log in
3. Create a new application (or select existing)
4. Go to **API Keys** section
5. Copy the keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)

**Add to Vercel:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_your_key_xxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_your_key_xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

### 4. Stripe Payment Processing
**Purpose:** Handle payments and subscriptions

**How to Get:**
1. Go to https://dashboard.stripe.com
2. Sign up or log in
3. Click **Developers** → **API keys**
4. Copy:
   - **Publishable key** (starts with `pk_your_key_` or `pk_your_key_`)
   - **Secret key** (starts with `sk_your_key_` or `sk_your_key_`)

**Webhook Secret:**
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://t-g-s-tires.vercel.app/api/webhooks/stripe`
4. Events to listen: `checkout.session.completed`, `payment_intent.succeeded`, `customer.subscription.updated`
5. Copy the **Signing secret** (starts with `whsec_your_key_`)

**Add to Vercel:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_your_key_xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_your_key_xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_your_key_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ Important:** Use test keys for development/preview, live keys for production only!

---

### 5. Supabase Database
**Purpose:** PostgreSQL database connection

**How to Get:**
1. Go to https://supabase.com/dashboard
2. Sign up or log in
3. Create a new project (or select existing)
4. Go to **Settings** → **Database**
5. Under **Connection string**, select **URI** format
6. Copy the connection string

**Add to Vercel:**
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxx.supabase.co:5432/postgres
```

**⚠️ Important:** Replace `[YOUR-PASSWORD]` with your actual database password

---

### 6. App Configuration
**Purpose:** Set app URLs and business info

**Add to Vercel:**
```
NEXT_PUBLIC_APP_URL=https://t-g-s-tires.vercel.app
NEXT_PUBLIC_APP_NAME=T.G.'s Tires
NEXT_PUBLIC_COMPANY_NAME=T.G.'s Tires
BUSINESS_ADDRESS=123 Main St, City, State 12345
BUSINESS_PHONE=+1-555-123-4567
BUSINESS_EMAIL=contact@tgstires.com
```

---

## 📧 Optional: Email Service (SendGrid or SMTP)

### Option A: SendGrid (Recommended)
**How to Get:**
1. Go to https://sendgrid.com
2. Sign up or log in
3. Go to **Settings** → **API Keys**
4. Click **Create API Key**
5. Give it full access
6. Copy the API key

**Add to Vercel:**
```
SENDGRID_API_KEY=SG_your_api_key_here
SMTP_FROM_EMAIL=noreply@tgstires.com
```

### Option B: Gmail SMTP
**How to Get:**
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to **Security** → **App passwords**
4. Generate an app password for "Mail"
5. Copy the 16-character password

**Add to Vercel:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

---

## 📱 Optional: Twilio SMS Notifications

**How to Get:**
1. Go to https://console.twilio.com
2. Sign up or log in
3. Get a Twilio phone number
4. Go to **Account** → **API Keys & Tokens**
5. Copy:
   - Account SID
   - Auth Token

**Add to Vercel:**
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 📤 Optional: UploadThing File Uploads

**How to Get:**
1. Go to https://uploadthing.com
2. Sign up or log in
3. Create a new app
4. Go to **API Keys**
5. Copy:
   - Secret Key
   - App ID

**Add to Vercel:**
```
UPLOADTHING_SECRET=sk_your_key_xxxxxxxxxxxxxxxxxxxxxxxxxx
UPLOADTHING_APP_ID=xxxxxxxxx
```

---

## 📱 Optional: Social Media Auto-Posting

### Facebook Graph API
1. Go to https://developers.facebook.com
2. Create an app
3. Get your App ID and App Secret
4. Generate a long-lived access token

```
FACEBOOK_APP_ID=xxxxxxxxxxxxxxxxxx
FACEBOOK_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
FACEBOOK_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Twitter/X API
1. Go to https://developer.twitter.com
2. Create a project and app
3. Generate API keys and access tokens

```
TWITTER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx
TWITTER_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
TWITTER_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxx
TWITTER_ACCESS_TOKEN_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Instagram Basic Display API
1. Go to https://developers.facebook.com
2. Create an Instagram app
3. Generate access token

```
INSTAGRAM_APP_ID=xxxxxxxxxxxxxxxxxx
INSTAGRAM_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
INSTAGRAM_ACCESS_TOKEN=IGQxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🚀 Adding Environment Variables to Vercel

### Method 1: Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project (T.G.'s Tires)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key:** Variable name (e.g., `DATABASE_URL`)
   - **Value:** Your secret value
   - **Environment:** Select Production, Preview, and/or Development
5. Click **Save**

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Add environment variables
vercel env add DATABASE_URL production
# Paste your value when prompted

# Or pull existing environment variables
vercel env pull .env.local
```

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Use different keys for development/test and production
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use Vercel's encrypted environment variables
- ✅ Generate strong random keys (32+ characters)
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Use environment-specific keys (production vs preview)

### ❌ DON'T:
- ❌ Commit `.env` files to Git
- ❌ Share secrets in Slack/email
- ❌ Use the same keys across projects
- ❌ Use production keys in development
- ❌ Hard-code secrets in source code

---

## 📝 Quick Setup Checklist

### Minimum Required (App won't work without):
- [ ] `NEXTAUTH_SECRET` - Generated with OpenSSL
- [ ] `ENCRYPTION_KEY` - Generated with OpenSSL
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk Dashboard
- [ ] `CLERK_SECRET_KEY` - From Clerk Dashboard
- [ ] `DATABASE_URL` - From Supabase
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Stripe
- [ ] `STRIPE_SECRET_KEY` - From Stripe
- [ ] `STRIPE_WEBHOOK_SECRET` - From Stripe Webhooks
- [ ] `NEXT_PUBLIC_APP_URL` - Your Vercel domain

### Optional (For Full Features):
- [ ] Email service (SendGrid or SMTP)
- [ ] Twilio SMS
- [ ] UploadThing
- [ ] Social media APIs

---

## 🆘 Troubleshooting

### "Missing environment variable" error:
- Check variable name spelling in Vercel dashboard
- Ensure variable is set for correct environment (Production/Preview/Development)
- Redeploy after adding new variables

### Database connection errors:
- Verify `DATABASE_URL` format is correct
- Check Supabase project is active
- Ensure password doesn't contain special characters that need encoding

### Stripe webhook not working:
- Verify webhook URL is correct: `https://t-g-s-tires.vercel.app/api/webhooks/stripe`
- Check webhook secret matches Vercel environment variable
- Ensure webhook is enabled in Stripe dashboard

### Clerk authentication not working:
- Verify URLs match your Vercel deployment domain
- Check Clerk application is configured for production
- Ensure sign-in/sign-up URLs are correct

---

## 📞 Support

If you need help:
- Clerk: https://clerk.com/support
- Stripe: https://support.stripe.com
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/support

---

**Last Updated:** October 2, 2025
**Project:** T.G.'s Tires Marketplace
**Deployment:** https://t-g-s-tires.vercel.app
