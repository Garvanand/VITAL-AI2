'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FiUpload, FiFile, FiCheck, FiX } from 'react-icons/fi';
import CryptoJS from 'crypto-js';

interface DocumentUploadProps {
  onUploadComplete: () => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size exceeds 50MB limit');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  // Create a hash for the document
  const createDocumentHash = async (file: File): Promise<string> => {
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

  // Create a block for the document
  const createBlock = (hash: string, previousHash: string, document: File) => {
    const timestamp = new Date().getTime();
    const blockData = {
      hash,
      previousHash,
      timestamp,
      document: {
        name: document.name,
        size: document.size,
        type: document.type,
      },
    };

    // Create block hash
    const blockHash = CryptoJS.SHA256(JSON.stringify(blockData)).toString();
    return { ...blockData, blockHash };
  };

  const uploadDocument = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Sanitize filename - replace spaces and special characters
      const sanitizedFileName = file.name
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '')
        .toLowerCase();

      // Generate document hash
      const documentHash = await createDocumentHash(file);

      // Get previous block hash (if any)
      const { data: lastBlock, error: blockError } = await supabase
        .from('document_verifications')
        .select('block_hash')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (blockError) {
        console.error('Error fetching last block:', blockError);
        throw new Error('Failed to fetch previous document data');
      }

      // Create new block
      const block = createBlock(documentHash, lastBlock?.block_hash || '0', file);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      // Upload document to Supabase storage with metadata
      const { error: uploadError } = await supabase.storage.from('documents').upload(sanitizedFileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
        duplex: 'half',
        metadata: {
          userId: user.id,
          documentHash,
          blockHash: block.blockHash,
        },
      });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      // Store verification data
      const { error: verificationError } = await supabase.from('document_verifications').insert([
        {
          document_name: sanitizedFileName,
          document_hash: documentHash,
          block_hash: block.blockHash,
          previous_hash: block.previousHash,
          verification_data: block,
          user_id: user.id,
        },
      ]);

      if (verificationError) {
        console.error('Verification error:', verificationError);
        throw new Error('Failed to store document verification data');
      }

      setSuccess(true);
      setFile(null);
      onUploadComplete();
    } catch (error) {
      console.error('Document upload error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-background/50 hover:bg-background/70 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FiUpload className="w-8 h-8 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">Any file type (MAX. 50MB)</p>
          </div>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>

      {file && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-muted rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <FiFile className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setFile(null)} disabled={uploading}>
            <FiX className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-primary/10 text-primary rounded-lg text-sm flex items-center space-x-2"
        >
          <FiCheck className="w-4 h-4" />
          <span>Document uploaded successfully!</span>
        </motion.div>
      )}

      <Button onClick={uploadDocument} disabled={!file || uploading} className="w-full">
        {uploading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Uploading...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <FiUpload className="w-4 h-4" />
            <span>Upload Document</span>
          </div>
        )}
      </Button>
    </div>
  );
}
