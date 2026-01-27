# Payment Methods Test Scripts

This directory contains test scripts to verify that all payment methods are working correctly.

## Available Test Scripts

### 1. Browser Console Test (Recommended for UI Testing)

**File:** `test-payment-methods-browser.js`

**Usage:**
1. Navigate to a contract completion page with remaining balance (e.g., `/sign/[token]/complete`)
2. Click "Pay Remaining Balance" to open the payment modal
3. Open browser console (F12 or Cmd+Option+I)
4. Copy and paste the entire contents of `test-payment-methods-browser.js`
5. Press Enter to run the test

**What it tests:**
- ✅ Each payment method button is clickable
- ✅ Button selection state updates correctly
- ✅ Toast notifications appear
- ✅ Payment form is visible after selection
- ✅ Smooth scrolling to payment form

**Expected output:**
```
🧪 Starting Payment Methods Test...
✅ Payment modal is open
Starting automated tests...

🧪 Testing: Credit/Debit Cards (1/6)
   ↳ Button clicked
   ✅ Credit/Debit Cards: Button clicked and selected successfully
   ↳ Toast notification appeared
   ↳ Payment form is visible

... (continues for all 6 methods)

📊 Test Results Summary:
✅ Credit/Debit Cards: PASSED
✅ Apple Pay: PASSED
✅ Google Pay: PASSED
✅ Cash App Pay: PASSED
✅ Stripe Link: PASSED
✅ Bank Transfer (ACH): PASSED
```

### 2. API Test Script

**File:** `test-payment-methods.js`

**Usage:**
```bash
node scripts/test-payment-methods.js <contract-token>
```

**Example:**
```bash
node scripts/test-payment-methods.js bb11af763f0b601b1b75c08c8bba35653d2fbc4c39b88093e7c671d022380fc1
```

**What it tests:**
- ✅ Payment intent creation for each payment method
- ✅ Payment method types are correctly configured
- ✅ Client secret generation
- ✅ API endpoint responses

**Environment variables:**
- `NEXT_PUBLIC_APP_URL` - Base URL (defaults to `http://localhost:3000`)

## Payment Methods Tested

1. **Credit/Debit Cards** - Standard card payments
2. **Apple Pay** - Apple Pay wallet integration
3. **Google Pay** - Google Pay wallet integration
4. **Cash App Pay** - Cash App payment method
5. **Stripe Link** - Stripe's one-click checkout
6. **Bank Transfer (ACH)** - ACH Direct Debit

## Troubleshooting

### Browser Test Fails

**Issue:** "Payment modal is not open"
- **Solution:** Make sure you've clicked "Pay Remaining Balance" button first

**Issue:** "Button not found"
- **Solution:** Check that the payment modal is fully loaded and all icons are visible

**Issue:** Button clicked but not selected
- **Solution:** Check browser console for JavaScript errors

### API Test Fails

**Issue:** "Failed to create payment intent"
- **Solution:** 
  - Verify Stripe API keys are configured
  - Check that the contract token is valid
  - Ensure the server is running

**Issue:** "Unknown payment method"
- **Solution:** Check that all payment methods are enabled in the payment intent API

## Manual Testing Checklist

For manual testing, verify each payment method:

- [ ] Credit/Debit Cards: Icon is clickable, shows selection state
- [ ] Apple Pay: Icon is clickable, shows selection state
- [ ] Google Pay: Icon is clickable, shows selection state
- [ ] Cash App Pay: Icon is clickable, shows selection state, displays QR code message
- [ ] Stripe Link: Icon is clickable, shows selection state
- [ ] Bank Transfer (ACH): Icon is clickable, shows selection state

For each method:
- [ ] Clicking the icon highlights it with amber border
- [ ] Toast notification appears
- [ ] Page scrolls to payment form
- [ ] Payment form shows the selected payment method option
- [ ] Can complete payment with that method

## Notes

- The browser test requires the payment modal to be open
- The API test requires a valid contract token
- Both tests are non-destructive (they don't create actual charges)
- For production testing, use Stripe test mode
