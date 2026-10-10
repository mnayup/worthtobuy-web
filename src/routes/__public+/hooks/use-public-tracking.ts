import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '~/lib/api';

export function usePublicTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { trackingId } = useParams();
  const queryParam = searchParams.get('q') || trackingId || '';

  const [inputCode, setInputCode] = useState(queryParam);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedResi, setCopiedResi] = useState(false);

  async function handleSearch(codeToTrack: string) {
    const clean = codeToTrack.trim();
    if (!clean) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await api.get(`/public/track/${encodeURIComponent(clean)}`);
      setData(res.data);
      setSearchParams({ q: clean });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          `Pesanan dengan kode "${clean}" tidak ditemukan. Pastikan nomor Invoice ` +
            '(INV-...), nomor Order (ORD-...), atau nomor resi kurir sudah sesuai.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (queryParam) {
      handleSearch(queryParam);
    }
  }, [queryParam]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inputCode.trim()) {
      handleSearch(inputCode.trim());
    }
  }

  function handleCopyResi(resi: string) {
    navigator.clipboard.writeText(resi);
    setCopiedResi(true);
    setTimeout(() => setCopiedResi(false), 2000);
  }

  return {
    inputCode,
    setInputCode,
    data,
    loading,
    error,
    copiedResi,
    handleSearch,
    handleSubmit,
    handleCopyResi,
  };
}
