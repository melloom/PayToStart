# PDF Generation Documentation

The system uses **@react-pdf/renderer** for PDF generation, which allows building PDFs using React components for consistent, predictable layouts.

## Architecture

### React-Based PDF Generation

Instead of imperative PDF building (like jsPDF), we use React components that render to PDF:

```tsx
// Build PDF using React components
<Document>
  <Page>
    <Text>Contract Title</Text>
    <View>Contract Content</View>
  </Page>
</Document>
```

This approach provides:
- **Consistent Layouts**: React components ensure consistent styling
- **Easy Maintenance**: Update PDF layout by updating React components
- **Type Safety**: TypeScript support for component props
- **Reusable Components**: Build PDF components like UI components

## Implementation

### PDF Component

**Location**: `components/pdf/contract-pdf.tsx`

The main PDF component is built using `@react-pdf/renderer` primitives:

- `<Document>` - Root PDF document
- `<Page>` - Individual pages
- `<Text>` - Text content
- `<View>` - Container/view component
- `<Image>` - Image embedding
- `<StyleSheet>` - PDF styling

### PDF Generation Function

**Location**: `lib/pdf.ts`

```typescript
import { renderToBuffer } from "@react-pdf/renderer";
import { ContractPDF } from "@/components/pdf/contract-pdf";

export async function generateContractPDF(...) {
  const pdfDocument = React.createElement(ContractPDF, { ...props });
  const buffer = await renderToBuffer(pdfDocument);
  return buffer;
}
```

## Features

### Layout Components

1. **Contract Header**
   - Title
   - Agreement header
   - Creation date

2. **Parties Section**
   - Contractor information
   - Client information
   - Contact details

3. **Financial Terms**
   - Total amount
   - Deposit amount
   - Remaining balance
   - Highlighted box styling

4. **Contract Content**
   - Full contract text
   - Formatted with proper spacing
   - Scrollable content area

5. **Signatures Page**
   - Client signature (with image if available)
   - Typed name
   - Signature metadata (IP, hash)
   - Contractor signature
   - Payment confirmation (if paid)

6. **Footer**
   - Contract ID
   - Generation/finalization date
   - Appears on all pages

### Styling

Uses StyleSheet API similar to React Native:

```typescript
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  // ...
});
```

### Signature Integration

The PDF includes:
- **Signature Image**: If drawn, embedded from URL
- **Typed Name**: Always included
- **Metadata**: IP address, contract hash
- **Timestamp**: Signature date

### Multi-Page Support

Automatically handles page breaks:
- First page: Contract content
- Second page: Signatures and payment confirmation

## Usage

### Generating PDF

```typescript
import { generateContractPDF } from "@/lib/pdf";

const pdfBuffer = await generateContractPDF(
  contract,
  client,
  contractor
);
```

### Storing PDF

```typescript
import { storage } from "@/lib/storage";

const pdfUrl = await storage.uploadPDF(
  contractId,
  companyId,
  pdfBuffer,
  `contract-${contractId}-final.pdf`
);
```

## Customization

### Update PDF Layout

Edit `components/pdf/contract-pdf.tsx`:

```tsx
// Add custom sections
<View>
  <Text style={styles.heading}>Custom Section</Text>
  <Text>Custom content...</Text>
</View>
```

### Update Styles

Modify styles in `components/pdf/contract-pdf.tsx`:

```typescript
const styles = StyleSheet.create({
  // Add new styles
  customSection: {
    backgroundColor: "#f0f0f0",
    padding: 10,
  },
});
```

### Add Images

```tsx
<Image
  src="https://example.com/image.png"
  style={styles.image}
/>
```

### Add Tables

```tsx
<View style={styles.table}>
  <View style={styles.tableRow}>
    <Text style={styles.tableCell}>Label</Text>
    <Text style={styles.tableCell}>Value</Text>
  </View>
</View>
```

## Features Supported

- ✅ Text formatting (bold, italic, sizes)
- ✅ Multiple pages
- ✅ Images (from URLs)
- ✅ Custom fonts (with font registration)
- ✅ Tables and layouts
- ✅ Headers and footers
- ✅ Page breaks
- ✅ Colors and backgrounds
- ✅ Borders and padding

## Limitations

### Image Loading

- Images must be accessible via URL
- Signature images from Supabase Storage need to be public or use signed URLs
- For private images, generate signed URLs before PDF generation

### Font Support

Default fonts available:
- `Helvetica` (default)
- `Times-Roman`
- `Courier`

Custom fonts require registration:

```typescript
import { Font } from "@react-pdf/renderer";

Font.register({
  family: "CustomFont",
  src: "/path/to/font.ttf",
});
```

### Browser vs Node

- PDF generation runs on the server (Node.js)
- Some browser-only features may not work
- Image URLs must be accessible from server

## Best Practices

### Component Organization

1. **Separate PDF Components**: Create reusable PDF components
2. **Style Definitions**: Keep styles at top of component file
3. **Type Safety**: Use TypeScript for component props
4. **Error Handling**: Handle image loading failures gracefully

### Performance

- **Cache PDFs**: Store generated PDFs in storage
- **Lazy Generation**: Generate PDFs on-demand, not preemptively
- **Optimize Images**: Compress signature images before storing
- **Font Loading**: Pre-load custom fonts if needed

### Layout Tips

- **Consistent Spacing**: Use margin/padding consistently
- **Page Breaks**: Use `<View break />` for explicit breaks
- **Fixed Elements**: Use `position: "absolute"` for footers/headers
- **Responsive Widths**: Use percentage widths for flexibility

## Testing

### Local Testing

```typescript
// Test PDF generation
import { generateContractPDF } from "@/lib/pdf";

const buffer = await generateContractPDF(
  testContract,
  testClient,
  testContractor
);

// Save to file for inspection
import fs from "fs";
fs.writeFileSync("test-contract.pdf", buffer);
```

### Visual Inspection

1. Generate PDF with test data
2. Open in PDF viewer
3. Verify layout and content
4. Check signature rendering
5. Verify metadata display

## Troubleshooting

### Images Not Loading

- Verify image URLs are accessible
- Check if images need signed URLs (private storage)
- Ensure images are loaded before PDF generation

### Layout Issues

- Check StyleSheet definitions
- Verify width/height calculations
- Ensure proper margins for page size

### Font Issues

- Use built-in fonts for compatibility
- Register custom fonts properly
- Check font file paths

### Performance

- Large PDFs may take time to generate
- Consider background jobs for PDF generation
- Cache generated PDFs

## Migration from jsPDF

If migrating from jsPDF:

1. **Replace PDF Generation**: Update `lib/pdf.ts`
2. **Create React Components**: Build PDF using React components
3. **Update Styles**: Convert jsPDF styles to StyleSheet
4. **Test Output**: Verify PDF output matches expectations

## Resources

- [@react-pdf/renderer Documentation](https://react-pdf.org/)
- [StyleSheet API](https://react-pdf.org/styling)
- [Components Reference](https://react-pdf.org/components)

