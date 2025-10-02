#!/bin/bash
# T.G.'s Tires - Security Keys Generator
# Run this script to generate all required security keys

echo "🔐 T.G.'s Tires - Security Keys Generator"
echo "=========================================="
echo ""

echo "1️⃣ NEXTAUTH_SECRET (for session encryption):"
openssl rand -base64 32
echo ""

echo "2️⃣ ENCRYPTION_KEY (for data encryption):"
openssl rand -hex 32
echo ""

echo "✅ Copy these values to Vercel Environment Variables"
echo "📝 See VERCEL_ENV_SETUP_GUIDE.md for complete setup instructions"
