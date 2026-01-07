import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { Contract } from "@/lib/types";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1a1a1a",
  },
  heading: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
    color: "#2563eb",
  },
  subheading: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 1.5,
    color: "#333333",
  },
  contractContent: {
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  },
  signatureSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: "1pt solid #e5e7eb",
  },
  signatureBlock: {
    marginBottom: 25,
  },
  signatureLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
  },
  signatureLine: {
    borderBottom: "1pt solid #000000",
    width: "60%",
    marginBottom: 8,
    height: 20,
  },
  signatureImage: {
    width: 150,
    height: 60,
    marginBottom: 8,
    maxWidth: "150pt",
    maxHeight: "60pt",
  },
  signatureName: {
    fontSize: 10,
    marginBottom: 3,
  },
  signatureDate: {
    fontSize: 9,
    color: "#666666",
  },
  signatureTime: {
    fontSize: 8,
    color: "#888888",
    marginTop: 2,
  },
  signatureMetadata: {
    fontSize: 7,
    color: "#888888",
    marginTop: 3,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#888888",
    textAlign: "center",
    borderTop: "0.5pt solid #e5e7eb",
    paddingTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: "bold",
    width: "40%",
  },
  infoValue: {
    width: "60%",
  },
  financialBox: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
    border: "1pt solid #bfdbfe",
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  financialTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1pt solid #bfdbfe",
    fontWeight: "bold",
  },
});

interface ContractPDFProps {
  contract: Contract;
  client: {
    name: string;
    email: string;
    phone?: string;
  };
  contractor: {
    name: string;
    email: string;
    companyName?: string;
    companyLogo?: string | null;
    companyAddress?: string | null;
  };
  signature?: {
    full_name: string;
    signature_url?: string | null;
    ip_address?: string | null;
    contract_hash?: string | null;
    signed_at?: string;
  } | null;
  payment?: {
    receiptId?: string | null;
    receiptUrl?: string | null;
  } | null;
}

export function ContractPDF({
  contract,
  client,
  contractor,
  signature,
  payment,
}: ContractPDFProps) {
  const signedName = signature?.full_name || client.name;
  const signedDate = signature?.signed_at
    ? new Date(signature.signed_at).toLocaleDateString()
    : contract.signedAt
    ? new Date(contract.signedAt).toLocaleDateString()
    : "Not signed";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Header */}
        {(contractor.companyLogo || contractor.companyName || contractor.companyAddress) && (
          <View style={{ marginBottom: 20 }}>
            {contractor.companyLogo && (
              <Image
                src={contractor.companyLogo}
                style={{ width: 150, height: 50, marginBottom: 10 }}
              />
            )}
            {contractor.companyName && (
              <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 5 }}>
                {contractor.companyName}
              </Text>
            )}
            {contractor.companyAddress && (
              <Text style={{ fontSize: 10, color: "#666666", marginBottom: 10 }}>
                {contractor.companyAddress}
              </Text>
            )}
          </View>
        )}

        {/* Header */}
        <Text style={styles.title}>{contract.title}</Text>

        {/* Contract Agreement Header */}
        <Text style={styles.heading}>CONTRACT AGREEMENT</Text>
        <Text style={styles.paragraph}>
          This contract is entered into on{" "}
          {new Date(contract.createdAt).toLocaleDateString()}
        </Text>

        {/* Parties */}
        <Text style={styles.subheading}>Between:</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Contractor:</Text>
          <Text style={styles.infoValue}>
            {contractor.name}
            {contractor.companyName ? ` (${contractor.companyName})` : ""}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{contractor.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Client:</Text>
          <Text style={styles.infoValue}>{client.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{client.email}</Text>
        </View>
        {client.phone && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{client.phone}</Text>
          </View>
        )}

        {/* Financial Terms / Scope & Pricing */}
        <Text style={styles.heading}>SCOPE & PRICING</Text>
        <View style={styles.financialBox}>
          <View style={styles.financialRow}>
            <Text>Total Contract Amount:</Text>
            <Text>${contract.totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.financialRow}>
            <Text>Deposit Amount:</Text>
            <Text>${contract.depositAmount.toFixed(2)}</Text>
          </View>
          {contract.depositAmount > 0 && (
            <View style={styles.financialTotal}>
              <Text>Remaining Balance:</Text>
              <Text>
                ${(contract.totalAmount - contract.depositAmount).toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Field Values / Scope Details */}
        {contract.fieldValues && Object.keys(contract.fieldValues).length > 0 && (
          <View style={{ marginTop: 15, marginBottom: 15 }}>
            {Object.entries(contract.fieldValues).map(([key, value]) => (
              <View key={key} style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 3 }}>
                  {key}:
                </Text>
                <Text style={{ fontSize: 10, color: "#333333" }}>{String(value)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Contract Content */}
        <Text style={styles.heading}>CONTRACT TERMS AND CONDITIONS</Text>
        <View style={styles.contractContent}>
          <Text>{contract.content}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Contract ID: {contract.id.slice(0, 8)}... | Generated on{" "}
          {new Date().toLocaleDateString()}
        </Text>
      </Page>

      {/* Signatures Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>SIGNATURES</Text>
        <Text style={styles.paragraph}>
          By signing below, both parties agree to the terms and conditions set
          forth in this contract.
        </Text>

        {/* Client Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Client Signature:</Text>
            {signature?.signature_url && (
              <Image
                src={signature.signature_url}
                style={styles.signatureImage}
              />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{signedName}</Text>
            <Text style={styles.signatureDate}>Date: {signedDate}</Text>
            {signature?.signed_at && (
              <Text style={styles.signatureTime}>
                Time: {new Date(signature.signed_at).toLocaleTimeString()}
              </Text>
            )}
            {signature && (
              <Text style={styles.signatureMetadata}>
                IP: {signature.ip_address || "N/A"} | Contract Hash:{" "}
                {signature.contract_hash?.slice(0, 16)}...
              </Text>
            )}
          </View>

          {/* Contractor Signature */}
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Contractor Signature:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{contractor.name}</Text>
            <Text style={styles.signatureDate}>
              Date: {signedDate}
            </Text>
          </View>
        </View>

        {/* Payment Confirmation */}
        {contract.paidAt && contract.depositAmount > 0 && (
          <View style={styles.signatureSection}>
            <View style={[styles.financialBox, { marginTop: 20, marginBottom: 10 }]}>
              <Text style={[styles.subheading, { marginTop: 0, marginBottom: 10, color: "#16a34a" }]}>
                DEPOSIT RECEIVED
              </Text>
              <View style={styles.financialRow}>
                <Text style={{ fontWeight: "bold" }}>Deposit Amount:</Text>
                <Text style={{ fontWeight: "bold", fontSize: 13 }}>
                  ${contract.depositAmount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.financialRow}>
                <Text>Payment Date:</Text>
                <Text>
                  {new Date(contract.paidAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
              <View style={styles.financialRow}>
                <Text>Payment Time:</Text>
                <Text>
                  {new Date(contract.paidAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short",
                  })}
                </Text>
              </View>
              <View style={styles.financialRow}>
                <Text>Payment Status:</Text>
                <Text style={{ fontWeight: "bold", color: "#16a34a" }}>✓ Completed</Text>
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Contract ID: {contract.id.slice(0, 8)}... | Finalized on{" "}
          {contract.completedAt
            ? new Date(contract.completedAt).toLocaleDateString()
            : new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
}

