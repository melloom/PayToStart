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

// Professional PDF Styles - Enhanced for better quality and appearance
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: "Times-Roman", // More professional serif font for legal documents
    backgroundColor: "#ffffff",
    lineHeight: 1.6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
    color: "#1a1a1a",
    fontFamily: "Times-Bold",
    textAlign: "center",
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
    color: "#1e40af", // Professional blue
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
    color: "#1f2937",
    fontFamily: "Times-Bold",
  },
  paragraph: {
    marginBottom: 10,
    lineHeight: 1.7,
    color: "#374151",
    textAlign: "justify",
  },
  contractContent: {
    marginTop: 15,
    marginBottom: 25,
    padding: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    lineHeight: 1.8,
    border: "1pt solid #e5e7eb",
    textAlign: "justify",
  },
  signatureSection: {
    marginTop: 40,
    paddingTop: 25,
    borderTop: "2pt solid #d1d5db",
  },
  signatureBlock: {
    marginBottom: 35,
    marginTop: 20,
  },
  signatureLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1f2937",
    fontFamily: "Times-Bold",
  },
  signatureLine: {
    borderBottom: "2pt solid #000000",
    width: "70%",
    marginBottom: 10,
    height: 25,
    marginTop: 5,
  },
  signatureImage: {
    width: 180,
    height: 70,
    marginBottom: 10,
    marginTop: 5,
    maxWidth: "180pt",
    maxHeight: "70pt",
    objectFit: "contain",
  },
  signatureName: {
    fontSize: 11,
    marginBottom: 4,
    fontWeight: "bold",
    color: "#1f2937",
  },
  signatureDate: {
    fontSize: 10,
    color: "#4b5563",
    marginTop: 2,
  },
  signatureTime: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 3,
  },
  signatureMetadata: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 5,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 35,
    left: 50,
    right: 50,
    fontSize: 9,
    color: "#6b7280",
    textAlign: "center",
    borderTop: "1pt solid #e5e7eb",
    paddingTop: 10,
    fontFamily: "Helvetica",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 3,
  },
  infoLabel: {
    fontWeight: "bold",
    width: "35%",
    color: "#374151",
    fontFamily: "Times-Bold",
  },
  infoValue: {
    width: "65%",
    color: "#1f2937",
    textAlign: "left",
  },
  financialBox: {
    backgroundColor: "#eff6ff",
    padding: 18,
    borderRadius: 6,
    marginBottom: 20,
    marginTop: 10,
    border: "2pt solid #3b82f6",
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 4,
  },
  financialTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTop: "2pt solid #3b82f6",
    fontWeight: "bold",
    fontSize: 12,
    fontFamily: "Times-Bold",
  },
  companyHeader: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottom: "2pt solid #e5e7eb",
  },
  companyLogo: {
    width: 180,
    height: 60,
    marginBottom: 12,
    maxWidth: "180pt",
    maxHeight: "60pt",
    objectFit: "contain",
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1f2937",
    fontFamily: "Times-Bold",
  },
  companyAddress: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 1.5,
  },
});

interface BrandingSettings {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  fontSize?: "small" | "normal" | "large";
  headerStyle?: "centered" | "left" | "right";
  borderStyle?: "solid" | "double" | "dashed" | "none";
  showBorder?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderWidth?: "thin" | "medium" | "thick";
  lineSpacing?: "tight" | "normal" | "loose";
  marginSize?: "small" | "medium" | "large";
  paperStyle?: "clean" | "lined" | "subtle";
  textAlign?: "left" | "center" | "justify";
  // Pro+ features
  logoUrl?: string;
  watermarkText?: string;
  watermarkOpacity?: number;
  footerText?: string;
  pageNumberStyle?: "none" | "bottom-center" | "bottom-right" | "top-right";
  sectionDividerStyle?: "none" | "line" | "double-line" | "ornamental";
  headerBackgroundColor?: string;
  footerBackgroundColor?: string;
  customPageSize?: "letter" | "legal" | "a4" | "custom";
  exportQuality?: "standard" | "high" | "print";
  // Premium only features
  customWatermarkImage?: string;
  advancedTypography?: boolean;
  customCSS?: string;
}

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
  clientSignature?: {
    full_name: string;
    signature_url?: string | null;
    ip_address?: string | null;
    contract_hash?: string | null;
    signed_at?: string;
  } | null;
  contractorSignature?: {
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
  branding?: BrandingSettings;
}

export function ContractPDF({
  contract,
  client,
  contractor,
  clientSignature,
  contractorSignature,
  payment,
  branding,
}: ContractPDFProps) {
  const clientSignedName = clientSignature?.full_name || client.name;
  const clientSignedDate = clientSignature?.signed_at
    ? new Date(clientSignature.signed_at).toLocaleDateString()
    : contract.signedAt
    ? new Date(contract.signedAt).toLocaleDateString()
    : "Not signed";

  const contractorSignedName = contractorSignature?.full_name || contractor.name;
  const contractorSignedDate = contractorSignature?.signed_at
    ? new Date(contractorSignature.signed_at).toLocaleDateString()
    : contract.signedAt
    ? new Date(contract.signedAt).toLocaleDateString()
    : "Not signed";

  // Extract branding from contract fieldValues if not provided directly
  const contractBranding: BrandingSettings | undefined = branding || 
    (contract.fieldValues && typeof contract.fieldValues === 'object' && '_branding' in contract.fieldValues 
      ? contract.fieldValues._branding as BrandingSettings 
      : undefined);

  // Use branding settings or fallback to defaults
  const primaryColor = contractBranding?.primaryColor || "#1e40af";
  const secondaryColor = contractBranding?.secondaryColor || "#3b82f6";
  const accentColor = contractBranding?.accentColor || "#10b981";
  const textColor = contractBranding?.textColor || "#1f2937";
  const fontFamily = contractBranding?.fontFamily || "Georgia, serif";
  const fontSize = contractBranding?.fontSize || "normal";
  const headerAlign = contractBranding?.headerStyle === "centered" ? "center" : 
                      contractBranding?.headerStyle === "right" ? "right" : "left";
  const textAlign = contractBranding?.textAlign || "left";
  const borderStyle = contractBranding?.borderStyle || "solid";
  const borderWidth = contractBranding?.borderWidth || "medium";
  const backgroundColor = contractBranding?.backgroundColor || "#ffffff";
  const lineSpacing = contractBranding?.lineSpacing || "normal";
  const marginSize = contractBranding?.marginSize || "medium";
  const logoUrl = contractBranding?.logoUrl;
  const watermarkText = contractBranding?.watermarkText;
  const watermarkOpacity = contractBranding?.watermarkOpacity || 0.2;
  const customWatermarkImage = contractBranding?.customWatermarkImage;
  const footerText = contractBranding?.footerText;
  const pageNumberStyle = contractBranding?.pageNumberStyle || "none";
  const sectionDividerStyle = contractBranding?.sectionDividerStyle || "none";
  const headerBackgroundColor = contractBranding?.headerBackgroundColor || primaryColor;
  const footerBackgroundColor = contractBranding?.footerBackgroundColor || secondaryColor;
  const customPageSize = contractBranding?.customPageSize || "a4";

  // Map web fonts to PDF fonts
  const pdfFontFamily = fontFamily.includes("Georgia") ? "Times-Roman" :
                        fontFamily.includes("Times") ? "Times-Roman" :
                        fontFamily.includes("Courier") ? "Courier" :
                        fontFamily.includes("Calibri") || fontFamily.includes("Arial") || fontFamily.includes("Helvetica") || fontFamily.includes("Verdana") || fontFamily.includes("Trebuchet") ? "Helvetica" :
                        "Times-Roman";

  const boldFontFamily = pdfFontFamily === "Times-Roman" ? "Times-Bold" : 
                        pdfFontFamily === "Courier" ? "Courier-Bold" : 
                        "Helvetica-Bold";

  // Font size mapping
  const baseFontSize = fontSize === "small" ? 10 : fontSize === "large" ? 12 : 11;
  const titleFontSize = fontSize === "small" ? 20 : fontSize === "large" ? 28 : 24;
  const headingFontSize = fontSize === "small" ? 14 : fontSize === "large" ? 18 : 16;

  // Line spacing mapping
  const lineHeight = lineSpacing === "tight" ? 1.4 : lineSpacing === "loose" ? 1.9 : 1.6;

  // Margin mapping
  const pageMargin = marginSize === "small" ? 30 : marginSize === "large" ? 70 : 50;

  // Border width mapping
  const borderWidthValue = borderWidth === "thin" ? "1pt" : borderWidth === "thick" ? "3pt" : "2pt";

  // Page size mapping
  const pageSize = customPageSize === "letter" ? "LETTER" : 
                   customPageSize === "legal" ? "LEGAL" : 
                   "A4";

  // Section divider style
  const getSectionDivider = () => {
    if (sectionDividerStyle === "none") return null;
    const dividerColor = accentColor;
    const dividerWidth = borderWidthValue;
    if (sectionDividerStyle === "line") {
      return { borderTop: `${dividerWidth} solid ${dividerColor}`, marginTop: 15, marginBottom: 15, paddingTop: 15 };
    } else if (sectionDividerStyle === "double-line") {
      return { 
        borderTop: `${dividerWidth} solid ${dividerColor}`, 
        borderBottom: `${dividerWidth} solid ${dividerColor}`,
        marginTop: 15, 
        marginBottom: 15, 
        paddingTop: 10,
        paddingBottom: 10,
      };
    }
    return { borderTop: `${dividerWidth} solid ${dividerColor}`, marginTop: 15, marginBottom: 15, paddingTop: 15 };
  };

  // Create dynamic style objects (inline styles for PDF)
  const pageStyle = {
    ...styles.page,
    fontFamily: pdfFontFamily,
    backgroundColor: backgroundColor,
    padding: pageMargin,
    fontSize: baseFontSize,
    lineHeight: lineHeight,
  };

  const titleStyle = {
    ...styles.title,
    color: primaryColor,
    fontFamily: boldFontFamily,
    textAlign: headerAlign as any,
    fontSize: titleFontSize,
  };

  const headingStyle = {
    ...styles.heading,
    color: primaryColor,
    fontFamily: boldFontFamily,
    fontSize: headingFontSize,
  };

  const paragraphStyle = {
    ...styles.paragraph,
    color: textColor,
    textAlign: textAlign as any,
    lineHeight: lineHeight,
  };

  const companyNameStyle = {
    ...styles.companyName,
    color: secondaryColor,
    fontFamily: boldFontFamily,
  };

  const companyHeaderStyle = {
    ...styles.companyHeader,
    borderBottom: borderStyle !== "none" ? `${borderWidthValue} ${borderStyle} ${primaryColor}` : "none",
    textAlign: headerAlign as any,
    backgroundColor: headerBackgroundColor !== primaryColor ? headerBackgroundColor : undefined,
    padding: headerBackgroundColor !== primaryColor ? 15 : undefined,
  };

  // Watermark component
  const Watermark = () => {
    if (customWatermarkImage) {
      return (
        <View style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: watermarkOpacity,
          zIndex: 0,
        }}>
          <Image src={customWatermarkImage} style={{ width: 400, height: 400, objectFit: "contain" }} />
        </View>
      );
    }
    if (watermarkText) {
      return (
        <View style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-45deg)",
          opacity: watermarkOpacity,
          zIndex: 0,
        }}>
          <Text style={{
            fontSize: 48,
            color: primaryColor,
            fontFamily: boldFontFamily,
          }}>
            {watermarkText}
          </Text>
        </View>
      );
    }
    return null;
  };

  // Page number component
  const PageNumber = ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => {
    if (pageNumberStyle === "none") return null;
    
    const position = pageNumberStyle === "bottom-center" ? { bottom: 30, left: "50%", transform: "translateX(-50%)" } :
                     pageNumberStyle === "bottom-right" ? { bottom: 30, right: pageMargin } :
                     { top: 30, right: pageMargin };
    
    return (
      <Text style={{
        position: "absolute",
        ...position,
        fontSize: 9,
        color: textColor,
        fontFamily: pdfFontFamily,
      }}>
        Page {pageNumber} of {totalPages}
      </Text>
    );
  };

  return (
    <Document>
      <Page size={pageSize as any} style={pageStyle}>
        {/* Watermark */}
        <Watermark />

        {/* Company Header */}
        {(logoUrl || contractor.companyLogo || contractor.companyName || contractor.companyAddress) && (
          <View style={companyHeaderStyle}>
            {(logoUrl || contractor.companyLogo) && (
              <Image
                src={logoUrl || contractor.companyLogo!}
                style={styles.companyLogo}
              />
            )}
            {contractor.companyName && (
              <Text style={companyNameStyle}>
                {contractor.companyName}
              </Text>
            )}
            {contractor.companyAddress && (
              <Text style={styles.companyAddress}>
                {contractor.companyAddress}
              </Text>
            )}
          </View>
        )}

        {/* Header */}
        <Text style={titleStyle}>{contract.title}</Text>

        {/* Contract Agreement Header */}
        <Text style={headingStyle}>CONTRACT AGREEMENT</Text>
        <Text style={styles.paragraph}>
          This contract is entered into on{" "}
          {new Date(contract.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
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

        {/* Section Divider */}
        {getSectionDivider() && <View style={getSectionDivider()!} />}

        {/* Financial Terms / Scope & Pricing */}
        <Text style={headingStyle}>SCOPE & PRICING</Text>
        <View style={{
          ...styles.financialBox,
          backgroundColor: accentColor ? `${accentColor}20` : "#eff6ff",
          border: `${borderWidthValue} ${borderStyle} ${accentColor || primaryColor}`,
        }}>
          <View style={styles.financialRow}>
            <Text style={{ fontWeight: "bold", fontSize: 11 }}>Total Contract Amount:</Text>
            <Text style={{ fontWeight: "bold", fontSize: 11, color: "#1e40af" }}>
              ${contract.totalAmount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={{ fontSize: 11 }}>Deposit Amount:</Text>
            <Text style={{ fontSize: 11, color: "#1f2937" }}>
              ${contract.depositAmount.toFixed(2)}
            </Text>
          </View>
          {contract.depositAmount > 0 && (
            <View style={styles.financialTotal}>
              <Text style={{ fontSize: 12 }}>Remaining Balance:</Text>
              <Text style={{ fontSize: 12, color: "#1e40af" }}>
                ${(contract.totalAmount - contract.depositAmount).toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Field Values / Scope Details */}
        {contract.fieldValues && Object.keys(contract.fieldValues).length > 0 && (
          <View style={{ marginTop: 15, marginBottom: 15 }}>
            {Object.entries(contract.fieldValues).map(([key, value]) => (
              <View key={key} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: "0.5pt solid #e5e7eb" }}>
                <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 4, color: "#1f2937", fontFamily: "Times-Bold" }}>
                  {key}:
                </Text>
                <Text style={{ fontSize: 10, color: "#374151", lineHeight: 1.6 }}>{String(value)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Section Divider */}
        {getSectionDivider() && <View style={getSectionDivider()!} />}

        {/* Contract Content */}
        <Text style={headingStyle}>CONTRACT TERMS AND CONDITIONS</Text>
        <View style={{
          ...styles.contractContent,
          backgroundColor: backgroundColor !== "#ffffff" ? backgroundColor : "#f9fafb",
          border: borderStyle !== "none" ? `${borderWidthValue} ${borderStyle} ${primaryColor}` : "1pt solid #e5e7eb",
        }}>
          <Text style={{ 
            lineHeight: lineHeight, 
            fontSize: baseFontSize, 
            color: textColor,
            textAlign: textAlign as any,
          }}>
            {contract.content}
          </Text>
        </View>

        {/* Page Number */}
        <PageNumber pageNumber={1} totalPages={2} />

        {/* Footer */}
        <Text style={{
          ...styles.footer,
          position: "absolute",
          bottom: 35,
          left: pageMargin,
          right: pageMargin,
          backgroundColor: footerBackgroundColor !== secondaryColor ? footerBackgroundColor : undefined,
          padding: footerBackgroundColor !== secondaryColor ? 10 : undefined,
          color: footerBackgroundColor !== secondaryColor ? "#ffffff" : "#6b7280",
        }} fixed>
          {footerText || `Contract ID: ${contract.id.slice(0, 8)}... | Generated on ${new Date().toLocaleDateString()}`}
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
            {clientSignature?.signature_url && clientSignature.signature_url.trim() !== "" && (
              <Image
                src={clientSignature.signature_url}
                style={styles.signatureImage}
              />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{clientSignedName}</Text>
            <Text style={styles.signatureDate}>Date: {clientSignedDate}</Text>
            {clientSignature?.signed_at && (
              <Text style={styles.signatureTime}>
                Time: {new Date(clientSignature.signed_at).toLocaleTimeString()}
              </Text>
            )}
            {clientSignature && (
              <Text style={styles.signatureMetadata}>
                IP: {clientSignature.ip_address || "N/A"} | Contract Hash:{" "}
                {clientSignature.contract_hash?.slice(0, 16)}...
              </Text>
            )}
          </View>

          {/* Contractor Signature */}
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Contractor Signature:</Text>
            {contractorSignature?.signature_url && contractorSignature.signature_url.trim() !== "" && (
              <Image
                src={contractorSignature.signature_url}
                style={styles.signatureImage}
              />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{contractorSignedName}</Text>
            <Text style={styles.signatureDate}>
              Date: {contractorSignedDate}
            </Text>
            {contractorSignature?.signed_at && (
              <Text style={styles.signatureTime}>
                Time: {new Date(contractorSignature.signed_at).toLocaleTimeString()}
              </Text>
            )}
            {contractorSignature && (
              <Text style={styles.signatureMetadata}>
                IP: {contractorSignature.ip_address || "N/A"} | Contract Hash:{" "}
                {contractorSignature.contract_hash?.slice(0, 16)}...
              </Text>
            )}
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

        {/* Page Number */}
        <PageNumber pageNumber={2} totalPages={2} />

        {/* Footer */}
        <Text style={{
          ...styles.footer,
          position: "absolute",
          bottom: 35,
          left: pageMargin,
          right: pageMargin,
          backgroundColor: footerBackgroundColor !== secondaryColor ? footerBackgroundColor : undefined,
          padding: footerBackgroundColor !== secondaryColor ? 10 : undefined,
          color: footerBackgroundColor !== secondaryColor ? "#ffffff" : "#6b7280",
        }} fixed>
          {footerText || `Contract ID: ${contract.id.slice(0, 8)}... | Finalized on ${
            contract.completedAt
              ? new Date(contract.completedAt).toLocaleDateString()
              : new Date().toLocaleDateString()
          }`}
        </Text>
      </Page>
    </Document>
  );
}

