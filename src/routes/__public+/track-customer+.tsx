import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '~/lib/api';
import { TrackingBanner } from './components/tracking-banner';
import { CustomerTrackingSearchBox } from './components/customer-tracking-search-box';
import { CustomerTrackingInvoiceList } from './components/customer-tracking-invoice-list';

const SESSION_KEY = 'wtb_customer_track_session';

export default function PublicCustomerTrackingRoute() {
  const { customerCode: paramCode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = (
    searchParams.get('customer') ||
    searchParams.get('code') ||
    paramCode ||
    ''
  ).toUpperCase();

  const [customerCode, setCustomerCode] = useState(initialCode);
  const [phoneLast4, setPhoneLast4] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedResi, setCopiedResi] = useState(false);

  async function verifyCustomer(code: string, last4: string) {
    const cleanCode = code.trim().toUpperCase();
    const cleanLast4 = last4.replace(/\D/g, '').slice(0, 4);
    if (!cleanCode || cleanLast4.length !== 4) return;

    setLoading(true);
    setError('');
    setSelectedInvoice(null);

    try {
      const res = await api.post('/public/track-customer', {
        customerCode: cleanCode,
        phoneLast4: cleanLast4,
      });
      setResult(res.data);
      setSearchParams({ customer: res.data?.customer?.customer_code || cleanCode });
      try {
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            customerCode: res.data?.customer?.customer_code || cleanCode,
            phoneLast4: cleanLast4,
            ts: Date.now(),
          })
        );
      } catch {
        // Ignore sessionStorage errors
      }
    } catch (err: any) {
      setResult(null);
      setError(
        err.response?.data?.message ||
          'Verifikasi gagal. Pastikan Customer ID dan 4 digit terakhir nomor WhatsApp sudah benar.'
      );
    } finally {
      setLoading(false);
    }
  }

  // Restore verified session in current tab if available
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      const isFresh =
        saved?.ts && Date.now() - Number(saved.ts) < 2 * 60 * 60 * 1000; // 2 hours
      if (
        isFresh &&
        saved.customerCode &&
        saved.phoneLast4 &&
        (!initialCode ||
          saved.customerCode.toUpperCase() === initialCode.toUpperCase())
      ) {
        setCustomerCode(saved.customerCode);
        setPhoneLast4(saved.phoneLast4);
        verifyCustomer(saved.customerCode, saved.phoneLast4);
      }
    } catch {
      // Ignore invalid session data
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    verifyCustomer(customerCode, phoneLast4);
  }

  function handleResetSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore
    }
    setResult(null);
    setSelectedInvoice(null);
    setPhoneLast4('');
    setError('');
    setSearchParams({});
  }

  function handleCopyResi(resi: string) {
    navigator.clipboard.writeText(resi);
    setCopiedResi(true);
    setTimeout(() => setCopiedResi(false), 2000);
  }

  return (
    <div className="space-y-10 py-10">
      <TrackingBanner />

      {!result ? (
        <CustomerTrackingSearchBox
          customerCode={customerCode}
          setCustomerCode={setCustomerCode}
          phoneLast4={phoneLast4}
          setPhoneLast4={setPhoneLast4}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      ) : (
        <CustomerTrackingInvoiceList
          result={result}
          selectedInvoice={selectedInvoice}
          onSelectInvoice={setSelectedInvoice}
          onResetSession={handleResetSession}
          copiedResi={copiedResi}
          onCopyResi={handleCopyResi}
        />
      )}
    </div>
  );
}

