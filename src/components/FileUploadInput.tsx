import React, { useRef } from 'react';
import { 
  UploadCloud, 
  Loader2, 
  Image as ImageIcon, 
  FileText, 
  ExternalLink, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { useS3Upload, type AllowedFileType, type EntityType } from '~/hooks/useS3Upload';

interface FileUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  entityType?: EntityType;
  allowedType?: AllowedFileType;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function FileUploadInput({
  value,
  onChange,
  entityType = 'misc',
  allowedType = 'all',
  placeholder,
  className = '',
  disabled = false,
}: FileUploadInputProps) {
  const { uploadFile, isUploading, progress, error, clearError } = useS3Upload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive accept attribute based on strict allowed type
  const acceptPattern = 
    allowedType === 'image'
      ? 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'
      : allowedType === 'document'
      ? '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain'
      : 'image/png,image/jpeg,image/webp,image/gif,.pdf,.doc,.docx,.xls,.xlsx,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';



  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearError();
    const url = await uploadFile(file, entityType, allowedType);
    if (url) {
      onChange(url);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImageFile = 
    allowedType === 'image' || 
    (value && /\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i.test(value));

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Upload Zone (Visible if no value and not uploading) */}
      {!value && !isUploading && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition ${
            disabled
              ? 'border-brand-200 bg-brand-50 text-brand-400 cursor-not-allowed'
              : 'border-brand-200 bg-brand-50/50 text-brand-600 hover:border-brand-400 hover:bg-brand-50 cursor-pointer'
          }`}
        >
          <UploadCloud size={20} className="text-brand-400 mb-1" />
          <span className="text-xs font-bold text-brand-700">
            Click to upload {allowedType === 'image' ? 'image' : allowedType === 'document' ? 'document' : 'file'}
          </span>
          <span className="text-[10px] text-brand-500 font-medium px-4">
            {allowedType === 'image' && 'PNG, JPG, WEBP, GIF, SVG'}
            {allowedType === 'document' && 'PDF, Word (DOC/DOCX), Excel, CSV'}
            {allowedType === 'all' && 'Images or Documents up to 15MB'}
          </span>
        </button>
      )}

      {/* Hidden File Picker with Strict Accept Attribute */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={acceptPattern}
        disabled={disabled || isUploading}
      />

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="space-y-1">
          <div className="w-full bg-brand-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cherry-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(progress, 15)}%` }}
            />
          </div>
          <p className="text-[10px] text-brand-500 font-medium">Uploading to MinIO folder: <span className="font-semibold text-brand-700">{entityType}/</span></p>
        </div>
      )}

      {/* Validation or Upload Error Banner */}
      {error && (
        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* File Preview Card when uploaded or filled */}
      {value && !isUploading && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-brand-50 border border-brand-200 text-xs text-brand-700">
          {isImageFile ? (
            <div className="w-8 h-8 rounded border border-brand-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
              <img 
                src={value} 
                alt="Preview" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }} 
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded border border-brand-200 bg-white shrink-0 flex items-center justify-center text-brand-600">
              <FileText size={16} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium truncate max-w-[220px]" title={value}>
                {value.split('/').pop() || value}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-200 text-brand-700 font-semibold uppercase">
                {entityType}
              </span>
            </div>
          </div>

          <a 
            href={value} 
            target="_blank" 
            rel="noreferrer" 
            className="p-1 rounded hover:bg-brand-200 text-brand-600 hover:text-brand-900 transition shrink-0"
            title="Open in new tab"
          >
            <ExternalLink size={14} />
          </a>

          <button 
            type="button" 
            onClick={() => onChange('')}
            className="p-1 rounded hover:bg-cherry-100 text-cherry-600 hover:text-cherry-800 transition shrink-0"
            title="Remove file"
          >
            <X size={14} />
          </button>
        </div>
      )}

    </div>
  );
}
