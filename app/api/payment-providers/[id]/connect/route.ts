import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

// POST - Connect a payment provider (async connection flow)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const provider = await db.paymentProviders.findById(params.id);
    
    if (!provider) {
      return NextResponse.json(
        { error: "Not found", message: "Payment provider not found" },
        { status: 404 }
      );
    }

    // Verify the provider belongs to the contractor's company
    if (provider.companyId !== contractor.companyId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { connectionData, authCode, redirectUri } = body;

    // Handle different provider types with their specific connection flows
    switch (provider.providerType) {
      case "stripe": {
        // For Stripe, we can create a customer or connect account
        try {
          // If we have a customer ID, verify it exists
          if (connectionData?.customerId) {
            const customer = await stripe.customers.retrieve(connectionData.customerId);
            if (customer && !("deleted" in customer)) {
              await db.paymentProviders.update(params.id, {
                status: "connected",
                connectionData: {
                  ...provider.connectionData,
                  ...connectionData,
                  customerId: customer.id,
                },
                stripeCustomerId: customer.id,
              });
            } else {
              throw new Error("Invalid Stripe customer ID");
            }
          } else {
            // Create a new Stripe customer
            const customer = await stripe.customers.create({
              email: contractor.email,
              name: contractor.name,
              metadata: {
                companyId: contractor.companyId,
                contractorId: contractor.id,
              },
            });

            await db.paymentProviders.update(params.id, {
              status: "connected",
              connectionData: {
                ...provider.connectionData,
                customerId: customer.id,
              },
              stripeCustomerId: customer.id,
            });
          }
        } catch (error: any) {
          await db.paymentProviders.update(params.id, {
            status: "error",
            errorMessage: error.message || "Failed to connect to Stripe",
          });
          throw error;
        }
        break;
      }

      case "venmo": {
        // Venmo connection - In production, you'd use Venmo's OAuth flow
        // For now, we'll accept account details and mark as connected
        if (!connectionData || !connectionData.accountId) {
          return NextResponse.json(
            { error: "Missing connection data", message: "Venmo account ID is required" },
            { status: 400 }
          );
        }

        // In production, you would:
        // 1. Exchange authCode for access token via Venmo OAuth
        // 2. Store the access token securely
        // 3. Verify the account
        
        await db.paymentProviders.update(params.id, {
          status: "connected",
          connectionData: {
            ...provider.connectionData,
            accountId: connectionData.accountId,
            accountName: connectionData.accountName || "",
            connectedAt: new Date().toISOString(),
          },
        });
        break;
      }

      case "cashapp": {
        // Cash App connection - Similar to Venmo
        if (!connectionData || !connectionData.cashtag) {
          return NextResponse.json(
            { error: "Missing connection data", message: "Cash App cashtag is required" },
            { status: 400 }
          );
        }

        await db.paymentProviders.update(params.id, {
          status: "connected",
          connectionData: {
            ...provider.connectionData,
            cashtag: connectionData.cashtag,
            accountName: connectionData.accountName || "",
            connectedAt: new Date().toISOString(),
          },
        });
        break;
      }

      case "paypal": {
        // PayPal connection - Use PayPal OAuth
        if (!connectionData || !connectionData.accountEmail) {
          return NextResponse.json(
            { error: "Missing connection data", message: "PayPal email address is required" },
            { status: 400 }
          );
        }

        // In production, you would:
        // 1. Exchange authCode for access token via PayPal OAuth
        // 2. Store the access token securely
        // 3. Verify the account
        
        await db.paymentProviders.update(params.id, {
          status: "connected",
          connectionData: {
            ...provider.connectionData,
            accountId: connectionData.accountId || connectionData.accountEmail,
            accountEmail: connectionData.accountEmail,
            connectedAt: new Date().toISOString(),
          },
        });
        break;
      }

      case "zelle": {
        // Zelle connection - Requires bank account details
        if (!connectionData || !connectionData.email || !connectionData.phone) {
          return NextResponse.json(
            { error: "Missing connection data", message: "Zelle requires email and phone number" },
            { status: 400 }
          );
        }

        await db.paymentProviders.update(params.id, {
          status: "connected",
          connectionData: {
            ...provider.connectionData,
            email: connectionData.email,
            phone: connectionData.phone,
            bankName: connectionData.bankName || "",
            connectedAt: new Date().toISOString(),
          },
        });
        break;
      }

      case "bank_transfer": {
        // Bank transfer connection - Requires bank account details
        if (!connectionData || !connectionData.accountNumber || !connectionData.routingNumber) {
          return NextResponse.json(
            { error: "Missing connection data", message: "Bank account number and routing number are required" },
            { status: 400 }
          );
        }

        await db.paymentProviders.update(params.id, {
          status: "connected",
          connectionData: {
            ...provider.connectionData,
            accountNumber: connectionData.accountNumber,
            routingNumber: connectionData.routingNumber,
            accountType: connectionData.accountType || "checking",
            bankName: connectionData.bankName || "",
            accountHolderName: connectionData.accountHolderName || contractor.name,
            connectedAt: new Date().toISOString(),
          },
        });
        break;
      }

      case "other": {
        // Other payment provider - Generic connection
        if (!connectionData || !connectionData.accountId) {
          return NextResponse.json(
            { error: "Missing connection data", message: "Account ID is required" },
            { status: 400 }
          );
        }

        await db.paymentProviders.update(params.id, {
          status: "connected",
          connectionData: {
            ...provider.connectionData,
            ...connectionData,
            connectedAt: new Date().toISOString(),
          },
        });
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid provider type", message: `Unknown provider type: ${provider.providerType}` },
          { status: 400 }
        );
    }

    const updated = await db.paymentProviders.findById(params.id);
    return NextResponse.json({ provider: updated, success: true });
  } catch (error: any) {
    console.error("Error connecting payment provider:", error);
    return NextResponse.json(
      { error: error.message || "Failed to connect payment provider" },
      { status: 500 }
    );
  }
}
