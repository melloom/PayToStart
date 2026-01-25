import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateContractPDF } from "@/lib/pdf";

export const runtime = "nodejs"; // JSZip requires Node.js runtime

// Dynamic import for JSZip
let JSZip: any;
async function getJSZip() {
  if (!JSZip) {
    JSZip = (await import("jszip")).default;
  }
  return JSZip;
}

export async function GET(request: Request) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Get all contracts for this contractor
    const contracts = await db.contracts.findByContractorId(contractor.id);

    if (contracts.length === 0) {
      return NextResponse.json(
        { error: "No contracts", message: "You have no contracts to export" },
        { status: 404 }
      );
    }

    // Create ZIP file
    const JSZipClass = await getJSZip();
    const zip = new JSZipClass();

    // Add contracts as JSON
    const contractsData = contracts.map((contract) => ({
      id: contract.id,
      title: contract.title,
      status: contract.status,
      content: contract.content,
      fieldValues: contract.fieldValues,
      depositAmount: contract.depositAmount,
      totalAmount: contract.totalAmount,
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
      signedAt: contract.signedAt?.toISOString(),
      paidAt: contract.paidAt?.toISOString(),
      completedAt: contract.completedAt?.toISOString(),
    }));

    zip.file("contracts.json", JSON.stringify(contractsData, null, 2));

    // Generate PDFs for each contract and add to ZIP
    for (const contract of contracts) {
      try {
        const client = await db.clients.findById(contract.clientId);
        if (!client) continue;

        const pdfBuffer = await generateContractPDF(
          contract,
          {
            name: client.name,
            email: client.email,
            phone: client.phone,
          },
          {
            name: contractor.name,
            email: contractor.email,
            companyName: contractor.companyName,
          },
          null
        );

        const fileName = `contract-${contract.id}-${contract.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;
        zip.file(fileName, pdfBuffer);
      } catch (error: any) {
        console.error(`Error generating PDF for contract ${contract.id}:`, error);
        // Continue with other contracts even if one fails
      }
    }

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="pay2start-contracts-export-${new Date().toISOString().split("T")[0]}.zip"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting contracts:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || "Failed to export contracts" },
      { status: 500 }
    );
  }
}

