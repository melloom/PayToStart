# Payment Flow Test Scripts

This directory contains test scripts for testing the payment flow end-to-end.

## Available Scripts

### 1. `test-payment-flow.js`
Basic payment flow test that tests:
- Contract signing endpoint
- Stripe Checkout Session creation
- Payment Intent creation and confirmation
- Webhook simulation
- Payment verification

**Usage:**
```bash
npm run test:payment
# or
node scripts/test-payment-flow.js
```

### 2. `test-payment-e2e.js`
Comprehensive end-to-end test with signing flow tests:
- Tests signing page load and payment notice display
- Tests password protection (if applicable)
- Tests signing validation (missing fields, invalid formats)
- Tests contract signing submission
- Tests payment redirect after signing
- Tests Stripe Checkout creation
- Provides manual testing instructions

**Usage:**
```bash
# Basic test
npm run test:payment-e2e

# With signing token (tests signing page and validation)
node scripts/test-payment-e2e.js --signing-token=<token>

# With contract ID and signing token (full flow)
node scripts/test-payment-e2e.js --contract-id=<id> --signing-token=<token>

# With password (for password-protected contracts)
node scripts/test-payment-e2e.js --signing-token=<token> --password=<password>

# Skip actual signing (only test validation)
SKIP_SIGNING=true node scripts/test-payment-e2e.js --signing-token=<token>
```

## Prerequisites

1. **Environment Variables** (in `.env.local`):
   ```bash
   STRIPE_TEST_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   STRIPE_MODE=test
   ```

2. **Stripe Test Mode**: Make sure you're using Stripe test keys

3. **Test Card**: Use Stripe test card `4242 4242 4242 4242`

## Manual Testing Checklist

For complete end-to-end testing, follow these steps:

### 1. Create Contract
- [ ] Login as contractor
- [ ] Create new contract
- [ ] Set deposit amount (e.g., $100)
- [ ] Set total amount (e.g., $500)
- [ ] Send contract to test email

### 2. Test Signing Page
- [ ] Open signing link from email
- [ ] Verify payment notice is displayed
- [ ] Check deposit amount is shown correctly
- [ ] Check total amount is shown correctly
- [ ] Verify "Payment Required After Signing" warning
- [ ] Check agreement mentions payment

### 3. Sign Contract
- [ ] Enter full name
- [ ] Draw signature (optional)
- [ ] Check agreement checkbox
- [ ] Click "Sign Contract"
- [ ] Verify success message

### 4. Test Payment Redirect
- [ ] Verify automatic redirect to Stripe Checkout
- [ ] Or verify redirect to `/pay/[token]` page
- [ ] Check deposit amount is correct

### 5. Complete Payment
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Expiry: `12/2025` (any future date)
- [ ] CVC: `123`
- [ ] Complete payment

### 6. Verify Webhook
- [ ] Check server logs for webhook receipt
- [ ] Verify contract status = "paid"
- [ ] Check emails sent to both parties
- [ ] Verify PDF was generated

### 7. Verify Finalization
- [ ] Check contract dashboard shows "Paid"
- [ ] Verify timeline shows "Payment Received"
- [ ] Download and verify final PDF
- [ ] Check email attachments

## Test Scenarios

### Scenario 1: Contract with Deposit (Full Flow)
1. Create contract with $100 deposit, $500 total
2. Test signing page loads correctly
3. Verify payment notice is displayed
4. Test signing validation (missing fields, invalid formats)
5. Sign contract with full name and signature
6. Verify automatic redirect to Stripe Checkout
7. Complete payment
8. Verify webhook processing
9. Verify finalization

### Scenario 2: Contract without Deposit
1. Create contract with $0 deposit, $500 total
2. Test signing page (no payment notice should appear)
3. Sign contract
4. Verify no payment redirect
5. Verify immediate finalization

### Scenario 3: Password-Protected Contract
1. Create contract with password
2. Test password protection (wrong password should fail)
3. Test password verification (correct password should work)
4. Enter password to view contract
5. Sign contract
6. Complete payment flow (if deposit required)

### Scenario 4: Signing Validation Tests
1. Test missing fullName (should fail)
2. Test empty fullName (should fail)
3. Test missing agree checkbox (should fail)
4. Test invalid signature format (should fail)
5. Test valid signing (should succeed)

### Scenario 5: Payment Failure
1. Create contract with deposit
2. Sign contract
3. Use declined test card: `4000000000000002`
4. Verify error handling
5. Retry with valid card

## Troubleshooting

### Contract Not Found
- Verify signing token is correct
- Check contract exists in database
- Ensure `SIGNING_TOKEN_SECRET` is set correctly

### Payment Not Processing
- Check Stripe webhook is configured
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check webhook logs in Stripe dashboard

### Checkout Not Redirecting
- Verify contract is signed first
- Check Stripe API keys are correct
- Verify checkout session is created successfully

## Stripe Test Cards

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000000000000002`
- **3D Secure**: `4000002500003155`
- **Insufficient Funds**: `4000000000009995`

For more test cards, see: https://stripe.com/docs/testing
