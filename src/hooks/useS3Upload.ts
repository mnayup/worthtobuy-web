import { useState } from 'react';
import imageCompression from 'browser-image-compression';

export type AllowedFileType = 'image' | 'document' | 'all';
export type EntityType = 
  | 'invoices' 
  | 'products' 
  | 'shipments' 
  | 'expenses' 
  | 'payments' 
  | 'purchases' 
  | 'brand' 
  | 'orders' 
  | 'misc' 
  | string;

export function validateFileType(file: File, allowedType: AllowedFileType = 'all'): { valid: boolean; error?: string } {
  const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|svg|bmp)$/i.test(file.name);
  
  const docMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
  ];
  const isDoc = docMimeTypes.includes(file.type) || /\.(pdf|docx?|xlsx?|csv|txt)$/i.test(file.name);

  if (allowedType === 'image') {
    if (!isImage) {
      return {
        valid: false,
        error: 'Invalid file format: Only image files (JPG, PNG, WEBP, GIF, SVG) are allowed for this form.',
      };
    }
  } else if (allowedType === 'document') {
    if (!isDoc) {
      return {
        valid: false,
        error: 'Invalid file format: Only document files (PDF, Word DOC/DOCX, Excel, CSV) are allowed for this form.',
      };
    }
  } else if (allowedType === 'all') {
    if (!isImage && !isDoc) {
      return {
        valid: false,
        error: 'Invalid file format: Only images (JPG, PNG, WEBP) or documents (PDF, Word, Excel, CSV) are allowed.',
      };
    }
  }

  // 15MB file size limit
  const maxBytes = 15 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: 'File size exceeds 15MB limit. Please upload a smaller file.',
    };
  }

  return { valid: true };
}

export function useS3Upload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File, 
    entityType: EntityType = 'misc', 
    allowedType: AllowedFileType = 'all'
  ): Promise<string | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Strict File Type Validation
      const validation = validateFileType(file, allowedType);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      let finalFile = file;

      // 2. Compress image if applicable (skip SVG and documents)
      if (file.type.startsWith('image/') && !file.type.includes('svg')) {
        try {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          finalFile = await imageCompression(file, options);
        } catch (compressionErr) {
          console.warn('Image compression skipped, using original file:', compressionErr);
        }
      }

      // 3. Resolve API URL cleanly (handles cases where VITE_API_URL includes or omits /api)
      const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:3100/api';
      const uploadApiEndpoint = rawBase.endsWith('/api')
        ? `${rawBase}/uploads/presigned-url`
        : `${rawBase}/api/uploads/presigned-url`;

      const token = localStorage.getItem('jastipflow_token'); 
      
      const presignedRes = await fetch(uploadApiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          filename: finalFile.name,
          contentType: finalFile.type || 'application/octet-stream',
          entityType,
        })
      });

      if (!presignedRes.ok) {
        const errData = await presignedRes.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to generate upload URL (${presignedRes.status})`);
      }

      const { presignedUrl, publicUrl } = await presignedRes.json();

      // 4. Upload directly to MinIO using presigned URL
      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': finalFile.type || 'application/octet-stream',
        },
        body: finalFile
      });

      if (!uploadRes.ok) {
        throw new Error(`Failed to upload to MinIO (${uploadRes.status})`);
      }

      setProgress(100);
      return publicUrl;
    } catch (err: any) {
      const msg = err.message || 'An error occurred during upload';
      setError(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, progress, error, clearError: () => setError(null) };
}
