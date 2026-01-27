#!/bin/bash

# Script to start Stripe webhook listening for local development
# This forwards Stripe webhooks to your local server

echo "🔧 Starting Stripe Webhook Listener..."
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is not installed."
    echo ""
    echo "📦 To install Stripe CLI:"
    echo ""
    echo "Option 1: Using Homebrew (recommended for macOS):"
    echo "  brew install stripe/stripe-cli/stripe"
    echo ""
    echo "Option 2: Download directly:"
    echo "  1. Visit: https://github.com/stripe/stripe-cli/releases/latest"
    echo "  2. Download the macOS version"
    echo "  3. Extract and move to /usr/local/bin/stripe"
    echo ""
    echo "Option 3: Using npm (if you have Node.js):"
    echo "  npm install -g stripe-cli"
    echo ""
    exit 1
fi

# Check if user is logged in
if ! stripe config --list &> /dev/null; then
    echo "🔐 You need to login to Stripe first:"
    echo "   stripe login"
    echo ""
    exit 1
fi

# Get the port from environment or default to 3000
PORT=${PORT:-3000}
WEBHOOK_URL="http://localhost:${PORT}/api/stripe/webhook"

echo "✅ Stripe CLI found"
echo "📡 Forwarding webhooks to: ${WEBHOOK_URL}"
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. Make sure your Next.js dev server is running on port ${PORT}"
echo "   2. Keep this terminal window open while developing"
echo "   3. Copy the webhook secret (whsec_...) to your .env.local file"
echo ""
echo "🚀 Starting webhook listener..."
echo "   (Press Ctrl+C to stop)"
echo ""

# Start Stripe webhook listening
stripe listen --forward-to "${WEBHOOK_URL}"
