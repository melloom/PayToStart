#!/bin/bash

# Quick setup script for local webhook forwarding
# This sets up Stripe CLI to forward webhooks to your local server

echo "🔧 Setting up Stripe CLI for local webhook forwarding..."
echo ""

# Add Homebrew to PATH (for Apple Silicon Macs)
export PATH="/opt/homebrew/bin:$PATH"

# Check if stripe is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not found. Make sure it's installed:"
    echo "   brew install stripe/stripe-cli/stripe"
    exit 1
fi

echo "✅ Stripe CLI found: $(stripe --version)"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Login to Stripe (this will open your browser):"
echo "   stripe login"
echo ""
echo "2. Forward webhooks to your local server (keep this running):"
echo "   stripe listen --forward-to localhost:3000/api/stripe/webhook"
echo ""
echo "3. Copy the webhook secret (starts with whsec_) from the output"
echo ""
echo "4. Add it to .env.local:"
echo "   STRIPE_TEST_WEBHOOK_SECRET=whsec_xxxxx"
echo ""
echo "5. Restart your dev server: npm run dev"
echo ""
echo "💡 Tip: Keep the 'stripe listen' command running in a separate terminal"
echo "   while you develop. Webhooks won't work if you close it!"
echo ""
