'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { SharedPageBackground } from '@/components/gradients/shared-page-background';
import { DocumentList } from '@/components/documents/document-list';
import { DocumentUpload } from '@/components/documents/document-upload';
import { Card } from '@/components/ui/card';
import { FiFile } from 'react-icons/fi';

interface Document {
  name: string;
  url: string;
  verified: boolean;
  verificationData: any;
  metadata: {
    size: number;
    mimetype: string;
  };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data: storageData, error: storageError } = await supabase.storage.from('documents').list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

      if (storageError) throw storageError;

      // Get URLs and verification data for all documents
      const documentsWithData = await Promise.all(
        (storageData || []).map(async (doc) => {
          const {
            data: { publicUrl },
          } = supabase.storage.from('documents').getPublicUrl(doc.name);

          try {
            // Get verification data from metadata
            const { data: metadata, error: verificationError } = await supabase
              .from('document_verifications')
              .select('*')
              .eq('document_name', doc.name)
              .maybeSingle();

            if (verificationError) throw verificationError;

            return {
              name: doc.name,
              url: publicUrl,
              verified: !!metadata,
              verificationData: metadata,
              metadata: {
                size: doc.metadata?.size || 0,
                mimetype: doc.metadata?.mimetype || '',
              },
            };
          } catch (error) {
            console.error('Error fetching verification data:', error);
            return {
              name: doc.name,
              url: publicUrl,
              verified: false,
              verificationData: null,
              metadata: {
                size: doc.metadata?.size || 0,
                mimetype: doc.metadata?.mimetype || '',
              },
            };
          }
        }),
      );

      setDocuments(documentsWithData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while fetching documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <SharedPageBackground intensity="medium" primaryColor="primary" secondaryColor="secondary" animated={true} />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <FiFile className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Document Management</h1>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
            <DocumentUpload onUploadComplete={fetchDocuments} />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
            <DocumentList documents={documents} loading={loading} error={error} onDocumentChange={fetchDocuments} />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
