import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createDepositCheckoutSession, createRemainingBalanceCheckoutSession, createFullPaymentCheckoutSession, createIncrementalPaymentCheckoutSession, createSplitPaymentCheckoutSession } from "@/lib/payments";
import { hashToken, verifyToken, isTokenExpired } from "@/lib/security/tokens";
import { log } from "@/lib/logger";

// Route segment config
export const dynamic = "force-dynamic";

// Helper to verify token for contract access (allows access if signed even if token was used)
async function verifyContractToken(token: string): Promise<{ contract: any; error?: string }> {
  // Try to find contract by raw token first (for contracts created before SIGNING_TOKEN_SECRET was set)
  // This ensures backwards compatibility
  let contract: any = null;
  try {
    contract = await db.contracts.findBySigningToken(token);
  } catch (error: any) {
    log.warn({ error: error.message }, "Error in findBySigningToken");
  }
  
  // If not found by raw token, try hash lookup (for newer contracts with secure tokens)
  if (!contract) {
    try {
      const tokenHash = hashToken(token);
      contract = await db.contracts.findBySigningTokenHash(tokenHash);
      
      // If found by hash, verify it matches
      if (contract && contract.signingTokenHash && !verifyToken(token, contract.signingTokenHash)) {
        log.warn({
          contractId: contract.id,
        }, "Token hash verification failed");
        return {
          contract: null,
          error: "Invalid token",
        };
      }
    } catch (error: any) {
      log.warn({ error: error.message }, "Error in findBySigningTokenHash");
    }
  }

  // Contract not found - try URL-decoded token in case it was double-encoded
  if (!contract) {
    let decodedToken = token;
    try {
      decodedToken = decodeURIComponent(token);
      if (decodedToken !== token) {
        log.info({}, "Trying URL-decoded token");
        contract = await db.contracts.findBySigningToken(decodedToken);
        if (!contract) {
          const decodedHash = hashToken(decodedToken);
          contract = await db.contracts.findBySigningTokenHash(decodedHash);
        }
      }
    } catch (e) {
      // Already decoded or invalid, ignore
    }
    
    if (!contract) {
      log.warn({
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 16),
      }, "Contract not found for token after all lookup attempts");
      return {
        contract: null,
        error: "Invalid token",
      };
    }
  }

  // If we found by raw token, skip hash verification (backwards compatibility)
  // This allows contracts created before SIGNING_TOKEN_SECRET was set to still work

  // Check if token has expired
  if (isTokenExpired(contract.signingTokenExpiresAt)) {
    return {
      contract: null,
      error: "This link has expired",
    };
  }

  // Check if contract status is void/cancelled
  if (contract.status === "cancelled") {
    return {
      contract: null,
      error: "This contract has been cancelled",
    };
  }

  return { contract };
}

export async function POST(request: Request) {
  // Log that the route was hit
  console.log("[CREATE-CHECKOUT] Route called");
  log.info({}, "Create-checkout route called");
  
  try {
    // Parse body once and reuse
    const body = await request.json();
    const { contractId, signingToken, amount, currency, clientEmail: requestClientEmail, paymentType, paymentNumber, paymentIndex } = body;

    console.log("[CREATE-CHECKOUT] Request body:", {
      hasContractId: !!contractId,
      hasToken: !!signingToken,
      hasClientEmail: !!requestClientEmail,
    });

    if (!contractId || !signingToken) {
      log.warn({ contractId: !!contractId, hasToken: !!signingToken }, "Missing required fields in create-checkout");
      return NextResponse.json(
        { message: "Missing required fields: contractId and signingToken are required" },
        { status: 400 }
      );
    }

    log.info({
      contractId,
      tokenLength: signingToken?.length,
      tokenPrefix: signingToken?.substring(0, 16),
    }, "Creating checkout session");

    // Verify contract exists with secure token verification
    const { contract, error } = await verifyContractToken(signingToken);
    if (!contract || error) {
      log.warn({
        contractId,
        tokenPrefix: signingToken?.substring(0, 16),
        error,
        hasContract: !!contract,
      }, "Token verification failed in create-checkout - returning 404");
      return NextResponse.json(
        { message: error || "Contract not found" },
        { status: 404 }
      );
    }

    log.info({
      contractId: contract.id,
      contractStatus: contract.status,
      clientId: contract.clientId,
    }, "Contract verified successfully");

    // Verify contract ID matches
    if (contract.id !== contractId) {
      return NextResponse.json(
        { message: "Contract ID mismatch" },
        { status: 400 }
      );
    }

    // Get client information - try database first
    let client = await db.clients.findById(contract.clientId).catch(() => null);
    
    // If client not found in database, get email from fieldValues (always stored there)
    let clientEmail: string | null = null;
    if (!client) {
      log.warn({ contractId: contract.id, clientId: contract.clientId }, "Client not found in database, getting email from fieldValues");
      
      // PRIORITY 1: Get email from contract events (the email the contract was actually sent to)
      // Use the MOST RECENT "sent" event in case contract was resent to a different email
      try {
        const events = await db.contractEvents.findByContractId(contract.id);
        // Find ALL "sent" events with clientEmail, then get the most recent one
        const sentEvents = events
          .filter(e => e.eventType === "sent" && e.metadata?.clientEmail)
          .sort((a, b) => {
            // Sort by createdAt descending (most recent first)
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
        
        if (sentEvents.length > 0) {
          const mostRecentSentEvent = sentEvents[0];
          if (mostRecentSentEvent.metadata?.clientEmail && typeof mostRecentSentEvent.metadata.clientEmail === "string") {
            clientEmail = mostRecentSentEvent.metadata.clientEmail.trim();
            log.info({ 
              contractId: contract.id, 
              clientEmail,
              eventCount: sentEvents.length,
              usingMostRecent: true
            }, "Using client email from most recent contract 'sent' event (recipient email)");
          }
        }
      } catch (error: any) {
        log.warn({ contractId: contract.id, error: error.message }, "Failed to fetch contract events for email lookup");
      }
      
      // PRIORITY 2: Try to get email from request body (payment page might pass it)
      if (!clientEmail && requestClientEmail && typeof requestClientEmail === "string" && requestClientEmail.trim()) {
        clientEmail = requestClientEmail.trim();
        log.info({ contractId: contract.id, clientEmail }, "Using client email from request body");
      }
      
      // PRIORITY 3: Try to extract from contract fieldValues
      if (!clientEmail && contract.fieldValues && typeof contract.fieldValues === "object") {
        const fieldValues = contract.fieldValues as Record<string, any>;
        
        // First, try common field names that might contain email
        const emailFields = [
          "clientEmail", 
          "email", 
          "client_email", 
          "clientEmailAddress",
          "emailAddress",
          "email_address",
          "contactEmail",
          "contact_email",
          "recipientEmail",
          "recipient_email"
        ];
        
        for (const field of emailFields) {
          const value = fieldValues[field];
          if (value && typeof value === "string" && value.trim()) {
            // Basic email validation
            if (value.includes("@") && value.includes(".")) {
              clientEmail = value.trim();
              log.info({ contractId: contract.id, clientEmail, field }, "Extracted client email from contract fieldValues");
              break;
            }
          }
        }
        
        // If still no email, search all field values for email-like patterns
        if (!clientEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          for (const [key, value] of Object.entries(fieldValues)) {
            if (value && typeof value === "string" && value.trim()) {
              const trimmedValue = value.trim();
              // Check if the value looks like an email
              if (emailRegex.test(trimmedValue)) {
                clientEmail = trimmedValue;
                log.info({ contractId: contract.id, clientEmail, field: key }, "Extracted client email from contract fieldValues (pattern match)");
                break;
              }
            }
          }
        }
      }
      
      // PRIORITY 4: As a last resort, try to extract email from contract content (less reliable)
      if (!clientEmail && contract.content && typeof contract.content === "string") {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const matches = contract.content.match(emailRegex);
        if (matches && matches.length > 0) {
          // Use the first email found (could be contractor email, but better than nothing)
          clientEmail = matches[0];
          log.info({ contractId: contract.id, clientEmail }, "Extracted email from contract content (fallback)");
        }
      }
      
      if (!clientEmail) {
        // Log detailed information for debugging
        const debugInfo = {
          contractId: contract.id,
          clientId: contract.clientId,
          hasRequestEmail: !!requestClientEmail,
          requestEmailValue: requestClientEmail ? String(requestClientEmail).substring(0, 20) + "..." : null,
          hasFieldValues: !!contract.fieldValues,
          fieldValueKeys: contract.fieldValues && typeof contract.fieldValues === "object" 
            ? Object.keys(contract.fieldValues) 
            : [],
          fieldValueSample: contract.fieldValues && typeof contract.fieldValues === "object"
            ? Object.entries(contract.fieldValues)
                .slice(0, 5)
                .reduce((acc, [key, value]) => {
                  acc[key] = typeof value === "string" ? value.substring(0, 50) : String(value).substring(0, 50);
                  return acc;
                }, {} as Record<string, string>)
            : null,
          hasContent: !!contract.content,
          contentLength: contract.content ? contract.content.length : 0,
        };
        
        log.error(debugInfo, "Could not determine client email for checkout");
        
        return NextResponse.json(
          { 
            message: "Client information not found. Please contact the contractor.",
            debug: process.env.NODE_ENV === "development" ? debugInfo : undefined
          },
          { status: 404 }
        );
      }
      
      // If we found an email but no client record, create the client record
      try {
        log.info({ contractId: contract.id, clientEmail, companyId: contract.companyId }, "Creating missing client record");
        client = await db.clients.create({
          companyId: contract.companyId,
          email: clientEmail,
          name: contract.fieldValues && typeof contract.fieldValues === "object" 
            ? (contract.fieldValues.clientName || contract.fieldValues.name || "Client")
            : "Client",
        });
        log.info({ contractId: contract.id, clientId: client.id }, "Client record created successfully");
      } catch (createError: any) {
        // If create fails (e.g., duplicate email), try to find by email
        log.warn({ contractId: contract.id, error: createError.message }, "Failed to create client, trying to find by email");
        try {
          client = await db.clients.findByEmail(clientEmail, contract.companyId);
          if (client) {
            log.info({ contractId: contract.id, clientId: client.id }, "Found existing client by email");
          }
        } catch (findError: any) {
          log.warn({ contractId: contract.id, error: findError.message }, "Failed to find or create client, continuing with email only");
          // Continue anyway - we have the email to use for checkout
        }
      }
    } else {
      clientEmail = client.email;
    }

    // Check contract status before creating checkout
    log.info({
      contractId: contract.id,
      contractStatus: contract.status,
      depositAmount: contract.depositAmount,
    }, "Contract details before checkout creation");

    // Create checkout session using appropriate payment utility based on payment type
    try {
      const paymentSchedule = contract.fieldValues ? (contract.fieldValues as any)?.paymentSchedule : null;
      const isPayInFull = paymentSchedule === "full" && contract.depositAmount === 0 && contract.totalAmount > 0;
      const isPayUpfront = paymentSchedule === "upfront" && contract.depositAmount === 0 && contract.totalAmount > 0;
      
      // Determine which checkout session to create
      let session;
      const isIncremental = paymentSchedule === "incremental";
      const isSplit = paymentSchedule === "split";
      
      if (paymentType === "split_payment" || isSplit) {
        // Split payment (multiple installments)
        const paymentScheduleConfig = contract.fieldValues ? (contract.fieldValues as any)?.paymentScheduleConfig : null;
        const paymentDates = paymentScheduleConfig?.paymentDates || [];
        
        // Determine which payment to process
        let targetPaymentIndex = 0;
        let targetPaymentNumber = 1;
        let splitAmount = 0;
        
        if (paymentIndex !== undefined && paymentIndex !== null) {
          // Use provided payment index
          targetPaymentIndex = parseInt(paymentIndex);
          targetPaymentNumber = targetPaymentIndex + 1;
          const targetPayment = paymentDates[targetPaymentIndex];
          splitAmount = targetPayment?.amount ? parseFloat(targetPayment.amount) : (amount ? parseFloat(amount) : 0);
        } else if (amount) {
          // Find payment by amount
          splitAmount = parseFloat(amount);
          const foundIndex = paymentDates.findIndex((p: any) => Math.abs(parseFloat(p.amount || "0") - splitAmount) < 0.01);
          if (foundIndex >= 0) {
            targetPaymentIndex = foundIndex;
            targetPaymentNumber = foundIndex + 1;
          }
        } else {
          // Use first unpaid payment
          const payments = await db.payments.findByContractId(contract.id);
          const paidAmounts = payments
            .filter((p) => p.status === "completed")
            .map((p) => Number(p.amount));
          
          // Find first payment that hasn't been fully paid
          for (let i = 0; i < paymentDates.length; i++) {
            const payment = paymentDates[i];
            const paymentAmount = parseFloat(payment.amount || "0");
            if (!paidAmounts.some(paid => Math.abs(paid - paymentAmount) < 0.01)) {
              targetPaymentIndex = i;
              targetPaymentNumber = i + 1;
              splitAmount = paymentAmount;
              break;
            }
          }
        }
        
        if (splitAmount <= 0) {
          return NextResponse.json(
            { message: "Invalid split payment amount or no payment found" },
            { status: 400 }
          );
        }
        
        log.info({
          contractId: contract.id,
          paymentType: "split_payment",
          paymentSchedule,
          paymentNumber: targetPaymentNumber,
          paymentIndex: targetPaymentIndex,
          amount: splitAmount,
        }, "Creating split payment checkout session");
        session = await createSplitPaymentCheckoutSession(
          contract,
          clientEmail!,
          signingToken,
          splitAmount,
          targetPaymentNumber,
          targetPaymentIndex
        );
      } else if (paymentType === "incremental_payment" || isIncremental) {
        // Incremental payment (pay as you go)
        const paymentScheduleConfig = contract.fieldValues ? (contract.fieldValues as any)?.paymentScheduleConfig : null;
        const incrementalAmount = amount 
          ? parseFloat(amount) 
          : (paymentScheduleConfig?.paymentDates?.[0]?.amount 
              ? parseFloat(paymentScheduleConfig.paymentDates[0].amount) 
              : 0);
        const paymentNum = paymentNumber ? parseInt(paymentNumber) : 1;
        
        if (incrementalAmount <= 0) {
          return NextResponse.json(
            { message: "Invalid incremental payment amount" },
            { status: 400 }
          );
        }
        
        log.info({
          contractId: contract.id,
          paymentType: "incremental_payment",
          paymentSchedule,
          paymentNumber: paymentNum,
          amount: incrementalAmount,
        }, "Creating incremental payment checkout session");
        session = await createIncrementalPaymentCheckoutSession(
          contract,
          clientEmail!,
          signingToken,
          incrementalAmount,
          paymentNum
        );
      } else if (paymentType === "full_payment" || isPayInFull || isPayUpfront) {
        // Full payment (pay in full or pay upfront)
        log.info({
          contractId: contract.id,
          paymentType: "full_payment",
          paymentSchedule,
        }, "Creating full payment checkout session");
        session = await createFullPaymentCheckoutSession(
          contract,
          clientEmail!,
          signingToken
        );
      } else if (paymentType === "remaining_balance" || (contract.status === "paid" && contract.depositAmount > 0)) {
        // Remaining balance payment
        log.info({
          contractId: contract.id,
          paymentType: "remaining_balance",
        }, "Creating remaining balance checkout session");
        session = await createRemainingBalanceCheckoutSession(
          contract,
          clientEmail!,
          signingToken
        );
      } else {
        // Deposit payment (default)
        log.info({
          contractId: contract.id,
          paymentType: "deposit",
        }, "Creating deposit checkout session");
        session = await createDepositCheckoutSession(
          contract,
          clientEmail!,
          signingToken
        );
      }

      log.info({
        contractId: contract.id,
        sessionId: session.id,
        paymentType: paymentType || "deposit",
      }, "Checkout session created successfully");

      return NextResponse.json({
        sessionId: session.id,
        url: session.url, // Include session URL for debugging
      });
    } catch (checkoutError: any) {
      log.error({
        contractId: contract.id,
        contractStatus: contract.status,
        error: checkoutError.message,
        paymentType: paymentType || "deposit",
      }, "Error creating checkout session");
      
      // Return appropriate error based on the issue
      if (checkoutError.message.includes("must be signed")) {
        return NextResponse.json(
          { message: "Contract must be signed before payment can be processed" },
          { status: 400 }
        );
      }
      
      throw checkoutError; // Re-throw to be caught by outer catch
    }

  } catch (error: any) {
    log.error({
      error: error.message,
      stack: error.stack,
    }, "Error creating checkout session");
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


// Add a simple GET handler to test if route is accessible
export async function GET() {
  return NextResponse.json({ 
    message: "Create checkout route is accessible",
    method: "POST required"
  });
}
