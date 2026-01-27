#!/bin/bash

# Quick script to start webhook forwarding
# Run this after stripe login is complete

export PATH="/opt/homebrew/bin:$PATH"

echo "🔄 Starting Stripe webhook forwarding..."
echo ""
echo "This will forward webhooks to: http://localhost:3000/api/stripe/webhook"
echo ""
echo "⚠️  Keep this terminal window open while developing!"
echo ""
echo "When you see the webhook secret (whsec_...), copy it to .env.local as:"
echo "   STRIPE_TEST_WEBHOOK_SECRET=whsec_xxxxx"
echo ""
echo "Press Ctrl+C to stop forwarding"
echo ""
echo "Starting..."
echo ""

stripe listen --forward-to localhost:3000/api/stripe/webhook
