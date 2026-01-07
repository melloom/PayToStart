-- Create storage buckets with policies

-- Contracts bucket (unified bucket for final PDFs, signatures, and attachments)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts',
  'contracts',
  false, -- Private bucket
  104857600, -- 100MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Legacy PDFs bucket (for backward compatibility during migration)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contract-pdfs',
  'contract-pdfs',
  false, -- Private bucket
  52428800, -- 50MB limit
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Signatures bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signatures',
  'signatures',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Attachments bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  false, -- Private bucket
  104857600, -- 100MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for contracts bucket (unified bucket)
CREATE POLICY "Contractors can upload to contracts bucket in their company folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'contracts' AND
    (storage.foldername(name))[1] = 'company' AND
    (storage.foldername(name))[2] = (SELECT company_id::text FROM contractors WHERE id = auth.uid())
  );

CREATE POLICY "Contractors can view contracts in their company folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contracts' AND
    (storage.foldername(name))[1] = 'company' AND
    (storage.foldername(name))[2] = (SELECT company_id::text FROM contractors WHERE id = auth.uid())
  );

-- Allow server-side uploads (for finalization process from webhook)
CREATE POLICY "Service role can upload to contracts bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'contracts'
  );

-- Storage policies for legacy contract-pdfs bucket (backward compatibility)
CREATE POLICY "Contractors can upload PDFs to their company folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'contract-pdfs' AND
    (storage.foldername(name))[1] = (SELECT company_id::text FROM contractors WHERE id = auth.uid())
  );

CREATE POLICY "Contractors can view PDFs in their company folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contract-pdfs' AND
    (storage.foldername(name))[1] = (SELECT company_id::text FROM contractors WHERE id = auth.uid())
  );

-- Storage policies for signatures bucket
CREATE POLICY "Anyone can upload signatures (validated by signing token)"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Contractors can view signatures in their company folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'signatures' AND
    (storage.foldername(name))[1] = (SELECT company_id::text FROM contractors WHERE id = auth.uid())
  );

-- Allow public read for signature verification during signing
CREATE POLICY "Public can read signatures during signing"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'signatures');

-- Storage policies for attachments bucket
CREATE POLICY "Contractors can upload attachments to their company folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] = (SELECT company_id::text FROM contractors WHERE id = auth.uid())
  );

CREATE POLICY "Contractors can view attachments in their company folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] = (SELECT company_id::text FROM contractors WHERE id = auth.uid())
  );

CREATE POLICY "Contractors can delete attachments from their company folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] = (SELECT company_id::text FROM contractors WHERE id = auth.uid())
  );

