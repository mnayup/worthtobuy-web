import React, { useState, useEffect } from 'react';
import { FileImage, Loader2 } from 'lucide-react';

interface SafeProofImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}

export function SafeProofImage({
  src,
  alt = 'Image receipt',
  className = 'h-12 w-12 rounded-xl object-cover ring-1 ring-brand-200',
  fallbackClassName,
  ...props
}: SafeProofImageProps) {
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(false);

  const isHeic = Boolean(src && /\.hei[cf](\?.*)?$/i.test(src));

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    setError(false);
    setConvertedUrl(null);

    if (src && isHeic) {
      setConverting(true);
      fetch(src)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch image');
          return res.blob();
        })
        .then(async (blob) => {
          const heic2any = (await import('heic2any')).default;
          const converted = await heic2any({
            blob,
            toType: 'image/jpeg',
            quality: 0.85,
          });
          const resultBlob = Array.isArray(converted) ? converted[0] : converted;
          if (active) {
            createdUrl = URL.createObjectURL(resultBlob);
            setConvertedUrl(createdUrl);
            setConverting(false);
          }
        })
        .catch((err) => {
          console.warn('HEIC decode error in SafeProofImage:', err);
          if (active) {
            setError(true);
            setConverting(false);
          }
        });
    }

    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [src, isHeic]);

  if (!src) {
    return (
      <div className={fallbackClassName || `${className} bg-brand-100 grid place-items-center text-brand-400`}>
        <FileImage size={18} />
      </div>
    );
  }

  if (converting) {
    return (
      <div className={fallbackClassName || `${className} bg-brand-50 grid place-items-center text-honey-600 animate-pulse`}>
        <Loader2 size={16} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={fallbackClassName || `${className} bg-amber-50 border border-amber-200 grid place-items-center text-amber-700`}
        title="Apple HEIC receipt (Click to open/download)"
      >
        <span className="text-[9px] font-black uppercase tracking-tight">HEIC</span>
      </div>
    );
  }

  return (
    <img
      src={convertedUrl || src}
      alt={alt}
      className={className}
      onError={() => {
        if (!isHeic) {
          setError(true);
        }
      }}
      {...props}
    />
  );
}
