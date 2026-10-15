import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { api } from '~/lib/api';

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
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          finalFile = await imageCompression(file, options);
        } catch (compressionErr) {
          console.warn('Image compression skipped, using original file:', compressionErr);
        }
      }

      // 3. Primary: Request presigned URL and upload directly to MinIO/S3 domain
      try {
        const presignedRes = await api.post('/uploads/presigned-url', {
          filename: finalFile.name,
          contentType: finalFile.type || 'application/octet-stream',
          entityType,
        });

        const { presignedUrl, publicUrl } = presignedRes.data || {};

        if (presignedUrl) {
          const uploadRes = await fetch(presignedUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': finalFile.type || 'application/octet-stream',
            },
            body: finalFile,
          });

          if (uploadRes.ok) {
            setProgress(100);
            return publicUrl;
          }
          console.warn('Presigned PUT upload failed with status:', uploadRes.status, 'Falling back to backend API upload...');
        }
      } catch (presignedErr) {
        console.warn('Presigned URL flow failed, falling back to backend API upload:', presignedErr);
      }

      // 4. Fallback: Upload directly to backend API (/uploads)
      const formData = new FormData();
      formData.append('file', finalFile);
      formData.append('entityType', entityType);

      const res = await api.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent?.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
      });

      setProgress(100);
      return res.data?.publicUrl || res.data?.url || null;
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || err.message || 'An error occurred during upload';
      const msg = Array.isArray(rawMsg) ? rawMsg.join(', ') : rawMsg;
      setError(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, progress, error, clearError: () => setError(null) };
}
