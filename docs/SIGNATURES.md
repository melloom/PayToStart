# Signature System Documentation

The signature system implements **Option A (MVP)**: Built-in "click-to-sign" functionality with typed name, optional canvas signature, and legal metadata.

## Features

### Signature Collection

1. **Typed Full Name** (Required)
   - Client must type their full name
   - Stored as their signature identifier

2. **Optional Canvas Signature** (Optional)
   - Draw signature using HTML5 canvas
   - Supports mouse and touch input
   - Saved as PNG image
   - Uploaded to Supabase Storage

3. **Agreement Checkbox** (Required)
   - "I agree" checkbox must be checked
   - Confirms consent to contract terms

### Metadata Storage

For each signature, the system stores:

- **signature_url**: URL to signature image (if drawn)
- **full_name**: Typed full name
- **ip_address**: Client's IP address
- **user_agent**: Browser/device information
- **contract_hash**: SHA256 hash of contract content at time of signing
- **signed_at**: Timestamp of signature

## Implementation

### Signature Capture

**Component**: `components/signature/signature-canvas.tsx`

Features:
- HTML5 canvas for drawing
- Mouse and touch support
- Clear signature button
- Data URL export

### Signing Page

**Route**: `/sign/[token]`

Flow:
1. Display contract content
2. Client types full name
3. Optionally draws signature
4. Checks "I agree" checkbox
5. Submits signature

### API Endpoint

**Route**: `/api/contracts/sign/[token]`  
**Method**: POST

Process:
1. Validates signature data
2. Generates contract hash
3. Uploads signature image (if provided)
4. Saves signature record
5. Updates contract status to "signed"

### Database Schema

**Table**: `signatures`

```sql
CREATE TABLE signatures (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  contract_id UUID NOT NULL,
  client_id UUID NOT NULL,
  signature_url TEXT, -- Nullable (typed name only)
  full_name TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  contract_hash TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL
);
```

### Storage

Signatures are stored in Supabase Storage:
- **Bucket**: `signatures`
- **Path**: `{companyId}/{contractId}/{clientId}/signature-{timestamp}.png`
- **Format**: PNG image

## Legal Considerations

### Contract Integrity

The `contract_hash` field stores a SHA256 hash of the contract content at the time of signing. This provides:

- **Integrity Verification**: Verify contract hasn't been altered
- **Audit Trail**: Proof of what was signed
- **Legal Evidence**: Cryptographic proof of agreement

### Signature Metadata

Additional metadata collected:

- **IP Address**: Identifies signing location (via proxy headers)
- **User Agent**: Browser/device information
- **Timestamp**: Exact time of signature
- **Full Name**: Signed name identifier

### Agreement Confirmation

The "I agree" checkbox provides:

- **Explicit Consent**: Clear confirmation of agreement
- **Legal Requirement**: Meets e-signature requirements
- **Audit Trail**: Record of consent

## Usage

### Signing a Contract

1. **Client receives signing link**: `/sign/{token}`
2. **Reviews contract content**
3. **Types full name**: Required field
4. **Optionally draws signature**: Using canvas
5. **Checks "I agree"**: Required checkbox
6. **Submits signature**

### Signature Storage

```typescript
// Signature is saved automatically when contract is signed
const signature = await saveSignature(
  contractId,
  companyId,
  clientId,
  {
    fullName: "John Doe",
    signatureDataUrl: "data:image/png;base64,...", // or null
    ip: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
    contractHash: "sha256-hash-of-contract-content",
  }
);
```

### Retrieving Signatures

```typescript
// Get signature for a contract
const signature = await getSignature(contractId);

// Signature object includes:
// - full_name
// - signature_url (if drawn)
// - ip_address
// - user_agent
// - contract_hash
// - signed_at
```

## PDF Generation

Signatures are included in the final PDF:

1. **Signature Image**: If drawn, embedded in PDF
2. **Typed Name**: Always included
3. **Signature Metadata**: IP, hash, timestamp
4. **Verification**: Contract hash included

### PDF Signature Section

The generated PDF includes:

```
SIGNATURES

By signing below, both parties agree to the terms...

Client Signature:
[Signature Image if available]
________________________
John Doe
Date: 01/15/2024
IP: 192.168.1.1 | Contract Hash: a1b2c3d4...

Contractor Signature:
________________________
Jane Contractor
Date: 01/15/2024
```

## Security

### IP Address Collection

The system collects IP addresses via:
1. `x-forwarded-for` header (proxies)
2. `x-real-ip` header
3. `cf-connecting-ip` header (Cloudflare)
4. Fallback to "unknown" if unavailable

### Contract Hash

The contract hash is generated using SHA256:

```typescript
const hash = crypto.createHash("sha256")
  .update(contractContent)
  .digest("hex");
```

This provides cryptographic proof of what was signed.

### Storage Security

- Signatures stored in private Supabase Storage bucket
- Access controlled via RLS policies
- Organized by company_id for tenant isolation

## Testing

### Manual Testing

1. **Create a contract** with deposit
2. **Get signing link** from contract details
3. **Open signing page** in browser
4. **Type full name**
5. **Draw signature** (optional)
6. **Check "I agree"**
7. **Submit signature**
8. **Verify signature saved** in database
9. **Check signature image** in storage (if drawn)
10. **Verify PDF** includes signature

### Signature Validation

Test cases:
- ✅ Typed name only (no drawing)
- ✅ Typed name + drawn signature
- ✅ Missing full name (should fail)
- ✅ Missing "I agree" (should fail)
- ✅ Already signed contract (should fail)

## Future Enhancements

### Option B (Advanced)

Future enhancements could include:

1. **Electronic Signature Certificates**
   - Digital certificates
   - PKI-based signatures
   - Certificate authority integration

2. **Advanced Verification**
   - SMS/Email OTP verification
   - Identity verification
   - Government ID verification

3. **Signature Templates**
   - Pre-approved signature styles
   - Branded signature templates
   - Custom signature fields

4. **Multi-Party Signing**
   - Sequential signing
   - Parallel signing
   - Signature order enforcement

5. **Legal Compliance**
   - eIDAS compliance (EU)
   - ESIGN Act compliance (US)
   - Other regional requirements

## Migration

If you've already run the initial schema migration, run:

```sql
-- Migration 005: Add signature metadata fields
-- See: supabase/migrations/005_add_signature_fields.sql
```

This adds the new fields to the existing `signatures` table.

## Troubleshooting

### Signature Not Saving

1. Check signature data is being sent
2. Verify contract is in correct status
3. Check database constraints
4. Verify storage bucket permissions

### Image Not Uploading

1. Check signature data URL is valid
2. Verify storage bucket exists
3. Check RLS policies on storage
4. Verify file size limits

### Contract Hash Mismatch

1. Verify contract content hasn't changed
2. Check hash generation logic
3. Compare stored hash with computed hash
4. Check for whitespace/encoding issues

## Legal Disclaimer

This signature system provides basic e-signature functionality. For legal compliance in your jurisdiction, consult with legal counsel regarding:

- E-signature laws and regulations
- Contract enforceability
- Record-keeping requirements
- Audit trail requirements
- Signature verification standards

