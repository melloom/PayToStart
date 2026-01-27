#!/usr/bin/env node

/**
 * Webhook Setup Diagnostic Script
 * 
 * Checks if webhook is properly configured and provides guidance
 * on how to fix it if it's not working.
 */

// Try to load .env.local
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.warn('⚠️  dotenv not found. Make sure environment variables are set manually.');
}

const Stripe = require('stripe');

// Initialize Stripe
const isTestMode = process.env.STRIPE_MODE === 'test' || !process.env.STRIPE_MODE;
const secretKey = isTestMode 
  ? process.env.STRIPE_TEST_SECRET_KEY 
  : process.env.STRIPE_LIVE_SECRET_KEY;

const webhookSecret = isTestMode
  ? process.env.STRIPE_TEST_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET
  : process.env.STRIPE_LIVE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!secretKey) {
  console.error('❌ Stripe secret key not found');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logStep(message) {
  log(`\n📋 ${message}`, 'cyan');
}

/**
 * Check webhook endpoints in Stripe
 */
async function checkWebhookEndpoints() {
  logStep('Checking webhook endpoints in Stripe...');
  
  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 10 });
    
    if (endpoints.data.length === 0) {
      logError('No webhook endpoints found in Stripe!');
      logInfo('\nYou need to create a webhook endpoint:');
      logInfo('1. Go to: https://dashboard.stripe.com/test/webhooks (Test Mode)');
      logInfo('   or: https://dashboard.stripe.com/webhooks (Live Mode)');
      logInfo('2. Click "Add endpoint"');
      logInfo(`3. Enter URL: ${baseUrl}/api/stripe/webhook`);
      logInfo('4. Select event: checkout.session.completed');
      logInfo('5. Copy the signing secret to .env.local');
      return null;
    }
    
    logSuccess(`Found ${endpoints.data.length} webhook endpoint(s):`);
    
    let foundMatching = false;
    const webhookUrl = `${baseUrl}/api/stripe/webhook`;
    
    for (const endpoint of endpoints.data) {
      const isMatch = endpoint.url === webhookUrl || 
                     endpoint.url.includes('/api/stripe/webhook');
      
      logInfo(`\n  Endpoint: ${endpoint.url}`);
      logInfo(`  Status: ${endpoint.status}`);
      logInfo(`  Enabled: ${endpoint.enabled ? 'Yes' : 'No'}`);
      
      // Check events
      if (endpoint.enabled_events && endpoint.enabled_events.length > 0) {
        const hasCheckoutEvent = endpoint.enabled_events.includes('checkout.session.completed') ||
                                 endpoint.enabled_events.includes('*');
        logInfo(`  Events: ${endpoint.enabled_events.length} event(s)`);
        if (hasCheckoutEvent) {
          logSuccess(`    ✅ Has checkout.session.completed event`);
        } else {
          logWarning(`    ⚠️  Missing checkout.session.completed event`);
        }
      }
      
      if (isMatch) {
        foundMatching = true;
        logSuccess(`  ✅ This endpoint matches your app URL`);
        
        // Check recent events
        try {
          const events = await stripe.events.list({
            limit: 5,
          });
          
          if (events.data.length > 0) {
            logInfo(`\n  Recent webhook events:`);
            events.data.slice(0, 3).forEach(event => {
              logInfo(`    - ${event.type} at ${new Date(event.created * 1000).toLocaleString()}`);
            });
          } else {
            logWarning(`  ⚠️  No recent webhook events found`);
          }
        } catch (e) {
          // Ignore errors fetching events
        }
      } else {
        logWarning(`  ⚠️  URL doesn't match your app (${webhookUrl})`);
      }
    }
    
    if (!foundMatching) {
      logWarning('\n⚠️  No webhook endpoint found matching your app URL!');
      logInfo(`Expected URL: ${webhookUrl}`);
      logInfo('\nTo fix:');
      logInfo('1. Go to Stripe Dashboard → Webhooks');
      logInfo('2. Either update existing endpoint URL or create new one');
      logInfo(`3. Set URL to: ${webhookUrl}`);
    }
    
    return endpoints.data;
  } catch (error) {
    logError(`Failed to check webhooks: ${error.message}`);
    return null;
  }
}

/**
 * Check webhook secret
 */
function checkWebhookSecret() {
  logStep('Checking webhook secret configuration...');
  
  if (!webhookSecret) {
    logError('Webhook secret is not configured!');
    logInfo('\nTo fix:');
    logInfo('1. Go to Stripe Dashboard → Webhooks → Your endpoint');
    logInfo('2. Copy the "Signing secret" (starts with whsec_)');
    logInfo('3. Add to .env.local:');
    if (isTestMode) {
      logInfo('   STRIPE_TEST_WEBHOOK_SECRET=whsec_...');
    } else {
      logInfo('   STRIPE_LIVE_WEBHOOK_SECRET=whsec_...');
    }
    return false;
  }
  
  if (webhookSecret === 'whsec_your_webhook_secret' || webhookSecret.length < 20) {
    logError('Webhook secret appears to be a placeholder!');
    logInfo('Get the real secret from Stripe Dashboard → Webhooks');
    return false;
  }
  
  if (!webhookSecret.startsWith('whsec_')) {
    logWarning('Webhook secret should start with "whsec_"');
    logInfo('Current value starts with:', webhookSecret.substring(0, 10));
  } else {
    logSuccess('Webhook secret is configured');
    logInfo(`Secret: ${webhookSecret.substring(0, 15)}...`);
  }
  
  return true;
}

/**
 * Check if webhook endpoint is accessible
 */
async function checkWebhookEndpointAccessible() {
  logStep('Checking if webhook endpoint is accessible...');
  
  try {
    const response = await fetch(`${baseUrl}/api/stripe/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true }),
    });
    
    // We expect an error about missing signature, which means endpoint exists
    if (response.status === 400 || response.status === 500) {
      const text = await response.text();
      if (text.includes('signature') || text.includes('webhook')) {
        logSuccess('Webhook endpoint is accessible');
        logInfo('Endpoint returned expected error (missing signature) - this is good!');
        return true;
      }
    }
    
    logWarning(`Webhook endpoint returned unexpected status: ${response.status}`);
    return false;
  } catch (error) {
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      logError('Webhook endpoint is not accessible!');
      logInfo(`URL: ${baseUrl}/api/stripe/webhook`);
      logInfo('\nPossible causes:');
      logInfo('1. Server is not running');
      logInfo('2. URL is incorrect');
      logInfo('3. Firewall/network blocking access');
      logInfo('\nFor local development:');
      logInfo('  - Make sure your dev server is running: npm run dev');
      logInfo('  - Use Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe/webhook');
      return false;
    }
    
    logWarning(`Could not check endpoint: ${error.message}`);
    return false;
  }
}

/**
 * Main diagnostic function
 */
async function main() {
  log('\n🔍 Webhook Setup Diagnostic', 'cyan');
  log('==========================\n', 'cyan');
  
  logInfo(`Stripe Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);
  logInfo(`Base URL: ${baseUrl}`);
  logInfo(`Webhook URL: ${baseUrl}/api/stripe/webhook\n`);
  
  // Check 1: Webhook secret
  const secretOk = checkWebhookSecret();
  
  // Check 2: Webhook endpoints in Stripe
  const endpoints = await checkWebhookEndpoints();
  
  // Check 3: Endpoint accessibility
  const accessible = await checkWebhookEndpointAccessible();
  
  // Summary
  log('\n📊 Diagnostic Summary', 'cyan');
  log('====================', 'cyan');
  
  if (secretOk) {
    logSuccess('✅ Webhook secret is configured');
  } else {
    logError('❌ Webhook secret is missing or invalid');
  }
  
  if (endpoints && endpoints.length > 0) {
    logSuccess('✅ Webhook endpoints found in Stripe');
  } else {
    logError('❌ No webhook endpoints found in Stripe');
  }
  
  if (accessible) {
    logSuccess('✅ Webhook endpoint is accessible');
  } else {
    logError('❌ Webhook endpoint is not accessible');
  }
  
  // Recommendations
  log('\n💡 Recommendations', 'cyan');
  log('==================', 'cyan');
  
  if (!secretOk || !endpoints || endpoints.length === 0 || !accessible) {
    logInfo('\nTo fix webhook issues:');
    logInfo('1. Read the guide: docs/FIX_WEBHOOK.md');
    logInfo('2. For local dev: Use Stripe CLI');
    logInfo('   stripe listen --forward-to localhost:3000/api/stripe/webhook');
    logInfo('3. For production: Set up webhook in Stripe Dashboard');
    logInfo('   https://dashboard.stripe.com/webhooks');
  } else {
    logSuccess('\n✅ Webhook setup looks good!');
    logInfo('\nIf webhooks still aren\'t firing:');
    logInfo('1. Check Stripe Dashboard → Webhooks → Events for delivery status');
    logInfo('2. Check your server logs for webhook processing errors');
    logInfo('3. Test with: Stripe Dashboard → Send test webhook');
  }
  
  log('\n');
}

main().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
