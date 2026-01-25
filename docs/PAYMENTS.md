`# Payment System Documentation

The payment system uses **Stripe Checkout Sessions** for fast, secure deposit collection.

## Architecture

### Flow

```
1. Client views contract at /sign/[token]
   ↓
2. Client sees prominent payment notice (if deposit required)
   - Shows deposit amount
   - Explains payment will be required after signing
   - Lists next steps
   ↓
3. Client signs contract → Status: "signed"
   ↓
4. System automatically creates Stripe Checkout Session
   - Via /api/stripe/create-checkout (called from signing API)
   - Creates payment record in database
   - Sends "signed but unpaid" email to client
   ↓
5. Client automatically redirected to Stripe Checkout
   - Or fallback to /pay/[token] if checkout URL not available
   ↓
6. Client completes payment in Stripe Checkout
   ↓
7. Stripe sends webhook: checkout.session.completed
   ↓
8. Webhook verifies payment & signature
   - Checks idempotency (prevents duplicate processing)
   - Verifies payment status is "paid"
   - Verifies contract is signed
   - Verifies payment amount matches deposit
   ↓
9. Update payment record to "completed"
   ↓
10. Update contract to "paid" status
   ↓
11. Finalize contract (PDF + Email)
    - Generate final contract PDF with signatures
    - Store PDF in storage
    - Email both parties with PDF attachment
    - Include payment receipt information
```

## Implementation

### Payment Notice Before Signing

**Location**: `/sign/[token]` page

Before clients sign a contract, they are shown a prominent payment notice if a deposit is required:

- **Warning Box**: Displays deposit amount, total contract amount, and balance information
- **Step-by-Step Guide**: Explains what happens after signing (sign → redirect to payment → complete payment → contract finalized)
- **Agreement Acknowledgment**: The signature agreement checkbox includes acknowledgment of the payment requirement
- **Welcome Dialog**: Payment information is also shown in the initial welcome dialog

This ensures clients are fully informed about payment requirements before committing to sign the contract.

### Checkout Session Creation

**Route**: `/api/stripe/create-checkout`  
**Method**: POST

Creates a Stripe Checkout Session for the contract deposit. This is automatically called when a contract with a deposit is signed, or can be called manually from the payment page.

**Request Body**:
```json
{
  "contractId": "contract-uuid",
  "signingToken": "token-string",
  "amount": 100.00,
  "currency": "usd"
}
```

**Response**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Features**:
- Validates contract is signed
- Creates payment record in database (status: "pending")
- Includes contract metadata for verification
- Sets success/cancel URLs
- Collects customer email and billing address
- Supports Apple Pay and Google Pay automatically
- Allows promotion codes

**Automatic Creation**: When a contract is signed via `/api/contracts/sign/[token]`, if a deposit is required, the system automatically:
1. Creates a Stripe Checkout Session
2. Returns the checkout URL in the response
3. Client is automatically redirected to Stripe Checkout
4. Sends "signed but unpaid" email to client with payment link

### Webhook Handler

**Route**: `/api/stripe/webhook`  
**Method**: POST

Handles Stripe webhook events, specifically `checkout.session.completed`.

**Process**:
1. Verify webhook signature (ensures request is from Stripe)
2. Check idempotency (skip if already processed - prevents duplicate finalization)
3. Verify payment status is "paid"
4. Verify contract is signed (must be "signed" status)
5. Verify payment amount matches deposit (allows 0.01 difference for rounding)
6. Update payment record status to "completed"
7. Update contract status to "paid" and set `paidAt` timestamp
8. Log audit events ("payment_completed" and "paid")
9. Finalize contract:
   - Generate final contract PDF with signatures
   - Store PDF in storage bucket
   - Email both parties with PDF attachment
   - Include payment receipt information

**Idempotency**: Webhooks can be retried. The system checks if payment is already processed to prevent duplicate processing.

### Payment Verification

**Route**: `/api/stripe/verify-session`  
**Method**: GET

Verifies payment status after checkout completion.

**Query Parameters**:
- `session_id`: Stripe checkout session ID

**Response**:
```json
{
  "verified": true,
  "paymentStatus": "paid",
  "session": {
    "id": "cs_test_...",
    "paymentStatus": "paid",
    "amountTotal": 100.00,
    "currency": "usd",
    "customerEmail": "client@example.com"
  },
  "contract": {
    "id": "contract-uuid",
    "status": "completed",
    "title": "Contract Title"
  }
}
```

## Configuration

### Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe Setup

1. **API Keys**: Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Secret key: `STRIPE_SECRET_KEY` (server-side only)
   - Publishable key: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client-side safe)

2. **Webhook Configuration**:
   - Go to [Webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select event: `checkout.session.completed`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

3. **Local Development**:
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe
   
   # Login
   stripe login
   
   # Forward webhooks to local server
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   
   The CLI will output a webhook secret (starts with `whsec_`). Use this as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

## Payment Utilities

### `lib/payments.ts`

Contains payment-related utility functions:

- `createDepositCheckoutSession()` - Creates checkout session
- `processCompletedCheckoutSession()` - Processes completed payment
- `retrieveCheckoutSession()` - Retrieves session details
- `isPaymentProcessed()` - Idempotency check

## Error Handling

### Checkout Creation Errors

- **Missing fields**: Returns 400 with error message
- **Contract not found**: Returns 404
- **Contract not signed**: Returns 400
- **Invalid amount**: Returns 400
- **Stripe API error**: Returns 500 with error message

### Webhook Errors

- **Invalid signature**: Returns 400 (Stripe will retry)
- **Missing metadata**: Logged, returns 200 (prevents retry loop)
- **Contract not found**: Logged, returns 200
- **Payment amount mismatch**: Logged, returns 200
- **Finalization error**: Logged, returns 200 (contract marked as paid)

**Important**: Webhook errors return 200 to acknowledge receipt, but errors are logged for investigation. This prevents Stripe from retrying indefinitely on non-recoverable errors.

## Security

### Webhook Verification

All webhooks are verified using Stripe's signature verification:

```typescript
stripe.webhooks.constructEvent(body, signature, webhookSecret)
```

This ensures the webhook is from Stripe and hasn't been tampered with.

### Metadata

Checkout sessions include metadata for verification:
- `contractId`: Contract identifier
- `signingToken`: Signing token for verification
- `companyId`: Company identifier (for RLS)
- `type`: Payment type ("deposit")

### Idempotency

The system checks if a payment is already processed before finalizing:
- Prevents duplicate finalization
- Safe for webhook retries
- Handles edge cases where webhook fires multiple times

## Testing

### Test Mode

Use Stripe test mode for development:
- Test cards: [Stripe Test Cards](https://stripe.com/docs/testing)
- Example: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

### Testing Flow

1. **Create a contract** with deposit amount
2. **View contract** at `/sign/[token]`
   - Verify payment notice is displayed prominently
   - Check that deposit amount and total are shown
   - Review payment information in welcome dialog
3. **Sign the contract** via `/sign/[token]`
   - System automatically creates Stripe Checkout Session
   - Client is automatically redirected to Stripe Checkout
   - "Signed but unpaid" email is sent to client
4. **Use test card** in Stripe Checkout
   - Test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
5. **Complete payment** → Redirects to completion page
6. **Webhook fires** → Contract finalized
   - Payment record updated to "completed"
   - Contract status updated to "paid"
   - Final PDF generated and stored
   - Both parties receive email with PDF
7. **Check emails** (or console logs in dev mode)
   - Verify "signed but unpaid" email was sent
   - Verify final contract email with PDF was sent

### Testing Webhooks Locally

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Terminal 3: Trigger test event
stripe trigger checkout.session.completed
```

## Monitoring

### Logs

Payment processing logs include:
- Checkout session creation
- Webhook receipt and processing
- Payment verification
- Contract finalization
- Error details with context

### Stripe Dashboard

Monitor payments in Stripe Dashboard:
- [Payments](https://dashboard.stripe.com/payments) - All payments
- [Checkout Sessions](https://dashboard.stripe.com/payments) - Session details
- [Webhooks](https://dashboard.stripe.com/webhooks) - Webhook events and logs

### Database

Payment records stored in `payments` table:
- `contract_id`: Link to contract
- `amount`: Payment amount
- `status`: pending, completed, failed
- `payment_intent_id`: Stripe session ID
- `completed_at`: Completion timestamp

## Future Enhancements

### Customer Portal (Optional)

For future implementation:

1. **Stripe Customer Portal**:
   - Allow clients to view payment history
   - Download receipts
   - Update payment methods
   - View invoices

2. **Implementation**:
   ```typescript
   // Create customer portal session
   const session = await stripe.billingPortal.sessions.create({
     customer: customerId,
     return_url: `${baseUrl}/dashboard`,
   });
   ```

### Additional Payment Methods

Current: Card payments only

Future options:
- ACH Direct Debit
- Bank transfers
- Payment plans
- Installments

### Refunds

Future feature:
- Handle refund requests
- Process refunds via Stripe API
- Update contract status
- Notify both parties

## Troubleshooting

### Payment Not Processing

1. Check webhook is configured correctly
2. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
3. Check webhook logs in Stripe dashboard
4. Verify contract is in "signed" status
5. Check payment amount matches deposit

### Webhook Not Firing

1. Check webhook endpoint URL is correct
2. Verify event `checkout.session.completed` is selected
3. Test with Stripe CLI: `stripe trigger checkout.session.completed`
4. Check server logs for webhook receipt

### Payment Already Processed

- System handles idempotency automatically
- If payment is already processed, webhook is skipped
- Check payment record in database
- Verify contract status

### Amount Mismatch

- Verify deposit amount in contract matches checkout amount
- Check for currency conversion issues
- Verify amount is in cents (not dollars) when creating session
- Check rounding issues (allows 0.01 difference)

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe API Reference](https://stripe.com/docs/api)

For application issues:
- Check application logs
- Review webhook logs in Stripe dashboard
- Verify database records
- Test with Stripe test mode

