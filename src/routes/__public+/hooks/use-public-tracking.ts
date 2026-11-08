import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '~/lib/api';

const SESSION_KEY = 'wtb_customer_track_session';

function isCustomerIdInput(code: string): boolean {
  const clean = code.trim().toUpperCase();
  return clean.startsWith('CUST') || clean.startsWith('CUS-');
}

export function usePublicTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { trackingId, customerCode: paramCustomerCode } = useParams();
  const queryParam =
    searchParams.get('q') ||
    searchParams.get('customer') ||
    trackingId ||
    paramCustomerCode ||
    '';

  const [inputCode, setInputCode] = useState(queryParam);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedResi, setCopiedResi] = useState(false);

  // Customer ID pop-up modal & invoice list state
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingCustomerCode, setPendingCustomerCode] = useState('');
  const [phoneLast5, setPhoneLast5] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [customerResult, setCustomerResult] = useState<any | null>(null);
  const [selectedCustomerInvoice, setSelectedCustomerInvoice] =
    useState<any | null>(null);

  async function verifyCustomerWithPin(codeToVerify: string, last5: string) {
    const cleanCode = codeToVerify.trim().toUpperCase();
    const cleanLast5 = last5.replace(/\D/g, '').slice(0, 5);
    if (!cleanCode || cleanLast5.length !== 5) return;

    setPinLoading(true);
    setPinError('');
    setError('');

    try {
      const res = await api.post('/public/track-customer', {
        customerCode: cleanCode,
        phoneLast5: cleanLast5,
      });
      setCustomerResult(res.data);
      setSelectedCustomerInvoice(null);
      setData(null);
      setPinModalOpen(false);
      const resolvedCode = res.data?.customer?.customer_code || cleanCode;
      setInputCode(resolvedCode);
      setSearchParams({ q: resolvedCode });

      try {
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            customerCode: resolvedCode.toUpperCase(),
            phoneLast5: cleanLast5,
            ts: Date.now(),
          })
        );
      } catch {
        // Ignore sessionStorage errors
      }
    } catch (err: any) {
      setPinError(
        err.response?.data?.message ||
          'Verifikasi gagal. Pastikan Customer ID dan 5 digit terakhir nomor WhatsApp sudah benar.'
      );
    } finally {
      setPinLoading(false);
    }
  }

  async function handleSearch(codeToTrack: string) {
    const clean = codeToTrack.trim();
    if (!clean) return;

    // If input is a Customer ID (e.g. CUST-0001), open 5-digit PIN modal (or restore verified session)
    if (isCustomerIdInput(clean)) {
      const upperCode = clean.toUpperCase();
      setError('');

      // Check if already verified in current tab session
      try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          const isFresh =
            saved?.ts && Date.now() - Number(saved.ts) < 2 * 60 * 60 * 1000;
          if (
            isFresh &&
            saved.customerCode?.toUpperCase() === upperCode &&
            String(saved.phoneLast5 || '').length === 5
          ) {
            await verifyCustomerWithPin(upperCode, saved.phoneLast5);
            return;
          }
        }
      } catch {
        // Ignore
      }

      setPendingCustomerCode(upperCode);
      setPhoneLast5('');
      setPinError('');
      setPinModalOpen(true);
      return;
    }

    setLoading(true);
    setError('');
    setData(null);
    setCustomerResult(null);
    setSelectedCustomerInvoice(null);

    try {
      const res = await api.get(`/public/track/${encodeURIComponent(clean)}`);
      setData(res.data);
      setSearchParams({ q: clean });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          `Pesanan dengan kode "${clean}" tidak ditemukan. Pastikan nomor Invoice ` +
            '(INV-...), nomor Order (ORD-...), Customer ID (CUST-...), atau nomor resi kurir sudah sesuai.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (queryParam) {
      setInputCode(queryParam);
      handleSearch(queryParam);
    }
  }, [queryParam]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inputCode.trim()) {
      handleSearch(inputCode.trim());
    }
  }

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    verifyCustomerWithPin(pendingCustomerCode, phoneLast5);
  }

  function handleResetCustomerSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore
    }
    setCustomerResult(null);
    setSelectedCustomerInvoice(null);
    setPhoneLast5('');
    setInputCode('');
    setSearchParams({});
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
    // Customer ID PIN Modal & Invoice List state
    pinModalOpen,
    setPinModalOpen,
    pendingCustomerCode,
    phoneLast5,
    setPhoneLast5,
    pinLoading,
    pinError,
    handlePinSubmit,
    customerResult,
    selectedCustomerInvoice,
    setSelectedCustomerInvoice,
    handleResetCustomerSession,
  };
}
