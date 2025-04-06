'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { FiFile, FiDownload, FiEye, FiTrash2, FiLock, FiCheck, FiX } from 'react-icons/fi';
import CryptoJS from 'crypto-js';

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

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  error: string | null;
  onDocumentChange: () => void;
}

export function DocumentList({ documents, loading, error, onDocumentChange }: DocumentListProps) {
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{ [key: string]: boolean }>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = createClient();

  const createDocumentHash = async (file: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wordArray = CryptoJS.lib.WordArray.create(e.target?.result as ArrayBuffer);
        const hash = CryptoJS.SHA256(wordArray).toString();
        resolve(hash);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const verifyDocument = async (doc: Document) => {
    setVerifying(doc.name);
    setVerificationResult((prev) => ({ ...prev, [doc.name]: false }));

    try {
      const response = await fetch(doc.url);
      if (!response.ok) throw new Error('Failed to fetch document');

      const blob = await response.blob();
      const hash = await createDocumentHash(blob);

      const { data: verificationData, error: verificationError } = await supabase
        .from('document_verifications')
        .select('*')
        .eq('document_name', doc.name)
        .maybeSingle();

      if (verificationError) {
        console.error('Verification error:', verificationError);
        throw new Error('Failed to verify document');
      }

      const isValid = verificationData && verificationData.document_hash === hash;
      setVerificationResult((prev) => ({ ...prev, [doc.name]: isValid }));
    } catch (error) {
      console.error('Error verifying document:', error);
      setVerificationResult((prev) => ({ ...prev, [doc.name]: false }));
    } finally {
      setVerifying(null);
    }
  };

  const deleteDocument = async (fileName: string) => {
    setDeleting(fileName);

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      // Delete from storage
      const { error: storageError } = await supabase.storage.from('documents').remove([fileName]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        throw new Error('Failed to delete document from storage');
      }

      // Delete verification data
      const { error: verificationError } = await supabase
        .from('document_verifications')
        .delete()
        .eq('document_name', fileName)
        .eq('user_id', user.id);

      if (verificationError) {
        console.error('Verification deletion error:', verificationError);
        throw new Error('Failed to delete document verification data');
      }

      onDocumentChange();
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeleting(null);
    }
  };

  const downloadDocument = async (fileName: string) => {
    try {
      const { data, error } = await supabase.storage.from('documents').download(fileName);

      if (error) {
        console.error('Download error:', error);
        throw new Error('Failed to download document');
      }

      // Create a download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const viewDocument = (url: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/50 rounded-lg">
        <FiFile className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {documents.map((doc) => (
          <motion.div
            key={doc.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border"
          >
            <div className="flex items-center space-x-4">
              <FiFile className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-sm text-muted-foreground">{(doc.metadata.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => verifyDocument(doc)} disabled={verifying === doc.name}>
                {verifying === doc.name ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : verificationResult[doc.name] ? (
                  <FiCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <FiLock className="w-4 h-4" />
                )}
              </Button>

              <Button variant="ghost" size="sm" onClick={() => viewDocument(doc.url)}>
                <FiEye className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="sm" onClick={() => downloadDocument(doc.name)}>
                <FiDownload className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteDocument(doc.name)}
                disabled={deleting === doc.name}
              >
                {deleting === doc.name ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiTrash2 className="w-4 h-4 text-destructive" />
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
