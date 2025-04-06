-- Create document_verifications table
CREATE TABLE public.document_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_name TEXT NOT NULL,
  document_hash TEXT NOT NULL,
  block_hash TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  verification_data JSONB,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.document_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own document verifications"
ON public.document_verifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own document verifications"
ON public.document_verifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document verifications"
ON public.document_verifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own document verifications"
ON public.document_verifications FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Set up storage policies
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update their documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete their documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
); 