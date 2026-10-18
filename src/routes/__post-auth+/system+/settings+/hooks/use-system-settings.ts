import { useState, useEffect, useMemo } from 'react';
import { api, errorMessage } from '~/lib/api';
import { number } from '~/lib/format';
import type { BrandSettings, FeeRule, InvoiceSettings, SettingsData, DatabaseBackupLog } from '../types';

export const defaultCustomerRules: FeeRule[] = [
  { id: 'fee-01', label: '≤ Rp10.000', min: 0, max: 10000, type: 'FIXED', value: 3000, active: true },
  { id: 'fee-02', label: 'Rp10.001 – Rp49.000', min: 10001, max: 49000, type: 'FIXED', value: 6000, active: true },
  { id: 'fee-03', label: 'Rp49.001 – Rp99.000', min: 49001, max: 99000, type: 'FIXED', value: 10000, active: true },
  { id: 'fee-04', label: 'Rp99.001 – Rp199.000', min: 99001, max: 199000, type: 'FIXED', value: 15000, active: true },
  { id: 'fee-05', label: 'Rp199.001 – Rp299.000', min: 199001, max: 299000, type: 'FIXED', value: 20000, active: true },
  { id: 'fee-06', label: 'Rp299.001 – Rp399.000', min: 299001, max: 399000, type: 'FIXED', value: 25000, active: true },
  { id: 'fee-07', label: 'Rp399.001 – Rp499.000', min: 399001, max: 499000, type: 'FIXED', value: 30000, active: true },
  { id: 'fee-08', label: 'Rp499.001 – Rp599.000', min: 499001, max: 599000, type: 'FIXED', value: 35000, active: true },
  { id: 'fee-09', label: 'Rp599.001 – Rp699.000', min: 599001, max: 699000, type: 'FIXED', value: 40000, active: true },
  { id: 'fee-10', label: '> Rp699.000', min: 699001, max: null, type: 'PERCENT', value: 7, active: true },
];

export const defaultResellerRules: FeeRule[] = [
  { id: 'fee-res-01', label: '≤ Rp10.000', min: 0, max: 10000, type: 'FIXED', value: 2000, active: true },
  { id: 'fee-res-02', label: 'Rp10.001 – Rp49.000', min: 10001, max: 49000, type: 'FIXED', value: 4000, active: true },
  { id: 'fee-res-03', label: 'Rp49.001 – Rp99.000', min: 49001, max: 99000, type: 'FIXED', value: 7000, active: true },
  { id: 'fee-res-04', label: 'Rp99.001 – Rp199.000', min: 99001, max: 199000, type: 'FIXED', value: 10000, active: true },
  { id: 'fee-res-05', label: 'Rp199.001 – Rp299.000', min: 199001, max: 299000, type: 'FIXED', value: 15000, active: true },
  { id: 'fee-res-06', label: 'Rp299.001 – Rp399.000', min: 299001, max: 399000, type: 'FIXED', value: 18000, active: true },
  { id: 'fee-res-07', label: 'Rp399.001 – Rp499.000', min: 399001, max: 499000, type: 'FIXED', value: 22000, active: true },
  { id: 'fee-res-08', label: 'Rp499.001 – Rp599.000', min: 499001, max: 599000, type: 'FIXED', value: 25000, active: true },
  { id: 'fee-res-09', label: 'Rp599.001 – Rp699.000', min: 599001, max: 699000, type: 'FIXED', value: 30000, active: true },
  { id: 'fee-res-10', label: '> Rp699.000', min: 699001, max: null, type: 'PERCENT', value: 5, active: true },
];

export const brandDefaults: BrandSettings = {
  name: 'WORTHTOBUY',
  tagline: 'Your Trusted Jastip Bestie & Personal Shopper Nasional',
  whatsapp: '6285186852535',
  instagram: '@worthtobuy_sub',
  instagramUrl: 'https://www.instagram.com/worthtobuy_sub',
  primaryColor: '#b7332b',
  logoUrl: '/worthtobuy-logo.png',
};

export const invoiceDefaults: InvoiceSettings = {
  businessName: 'WORTHTOBUY',
  prefix: 'WTB-INV',
  bankName: 'BCA (Bank Central Asia)',
  accountNumber: '1234567890',
  accountHolder: 'WORTHTOBUY',
  whatsapp: '6285186852535',
  email: '',
  address: '',
  footer: 'Thank you for shopping with WORTHTOBUY. Your items are handled with utmost care.',
  qrisImageUrl: '',
};

export async function saveSettingsAction(data: {
  brand: BrandSettings;
  invoice: InvoiceSettings;
  feeRulesCustomer: FeeRule[];
  feeRulesReseller: FeeRule[];
}) {
  const normalize = (rules: FeeRule[]) =>
    rules
      .map((rule) => ({
        ...rule,
        min: Math.max(0, Number(rule.min || 0)),
        max:
          rule.max === null || rule.max === undefined || String(rule.max) === ''
            ? null
            : Math.max(0, Number(rule.max)),
        value: Math.max(0, Number(rule.value || 0)),
      }))
      .sort((a, b) => a.min - b.min);

  const normalizedCustomer = normalize(data.feeRulesCustomer);
  const normalizedReseller = normalize(data.feeRulesReseller);

  await Promise.all([
    api.put('/settings/brand', { value: data.brand }),
    api.put('/settings/invoice', { value: data.invoice }),
    api.put('/settings/feeRules', { value: normalizedCustomer }),
    api.put('/settings/feeRulesReseller', { value: normalizedReseller }),
  ]);
  return {
    success: true,
    feeRulesCustomer: normalizedCustomer,
    feeRulesReseller: normalizedReseller,
  };
}

export function useSystemSettings() {
  const [brand, setBrand] = useState(brandDefaults);
  const [invoice, setInvoice] = useState(invoiceDefaults);
  const [feeTab, setFeeTab] = useState<'customer' | 'reseller'>('customer');
  const [feeRulesCustomer, setFeeRulesCustomer] = useState<FeeRule[]>(defaultCustomerRules);
  const [feeRulesReseller, setFeeRulesReseller] = useState<FeeRule[]>(defaultResellerRules);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
  } | null>(null);

  const [sortKey, setSortKey] = useState<keyof FeeRule | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const toggleSort = (key: keyof FeeRule) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortKey(null);
      setSortDirection(null);
    }
  };

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        const data: SettingsData = res.data;
        setBrand({ ...brandDefaults, ...(data.brand || {}) });
        setInvoice({ ...invoiceDefaults, ...(data.invoice || {}) });
        if (Array.isArray(data.feeRules) && data.feeRules.length) {
          setFeeRulesCustomer(
            data.feeRules.map((rule: any, index: number) => ({
              id: String(rule.id || `fee-cust-${Date.now()}-${index}`),
              label: String(rule.label || ''),
              min: Number(rule.min || 0),
              max:
                rule.max === null || rule.max === '' || rule.max === undefined
                  ? null
                  : Number(rule.max),
              type: rule.type === 'PERCENT' ? 'PERCENT' : 'FIXED',
              value: Number(rule.value || 0),
              active: rule.active !== false,
            }))
          );
        }
        if (Array.isArray(data.feeRulesReseller) && data.feeRulesReseller.length) {
          setFeeRulesReseller(
            data.feeRulesReseller.map((rule: any, index: number) => ({
              id: String(rule.id || `fee-res-${Date.now()}-${index}`),
              label: String(rule.label || ''),
              min: Number(rule.min || 0),
              max:
                rule.max === null || rule.max === '' || rule.max === undefined
                  ? null
                  : Number(rule.max),
              type: rule.type === 'PERCENT' ? 'PERCENT' : 'FIXED',
              value: Number(rule.value || 0),
              active: rule.active !== false,
            }))
          );
        }
      })
      .catch((caught) => setToast({ message: errorMessage(caught), type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  const currentRules = feeTab === 'customer' ? feeRulesCustomer : feeRulesReseller;
  const setCurrentRules = feeTab === 'customer' ? setFeeRulesCustomer : setFeeRulesReseller;

  const sortedFeeRules = useMemo(() => {
    if (!sortKey || !sortDirection) return currentRules;
    return [...currentRules].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let comp = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comp = valA - valB;
      } else if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        comp = valA === valB ? 0 : valA ? -1 : 1;
      } else {
        comp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
      }
      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [currentRules, sortKey, sortDirection]);

  const updateRule = (id: string, patch: Partial<FeeRule>) => {
    setCurrentRules((current) =>
      current.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule))
    );
  };

  const addRule = () => {
    const last = currentRules[currentRules.length - 1];
    const min =
      last?.max !== null && last?.max !== undefined
        ? Number(last.max) + 1
        : Number(last?.min || 0) + 1;
    setCurrentRules((current) => [
      ...current,
      {
        id: `fee-${feeTab}-${Date.now()}`,
        label: `From Rp${number(min)}`,
        min,
        max: null,
        type: 'FIXED',
        value: 0,
        active: true,
      },
    ]);
  };

  const deleteRule = (id: string) => {
    setCurrentRules((current) => current.filter((rule) => rule.id !== id));
  };

  const [backupLogs, setBackupLogs] = useState<DatabaseBackupLog[]>([]);
  const [backupLogsTotal, setBackupLogsTotal] = useState(0);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [downloadingBackup, setDownloadingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);

  const fetchBackupLogs = () => {
    setLoadingLogs(true);
    api
      .get('/settings/backup/logs', { params: { limit: 15 } })
      .then((res) => {
        setBackupLogs(res.data?.logs || []);
        setBackupLogsTotal(res.data?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoadingLogs(false));
  };

  useEffect(() => {
    fetchBackupLogs();
  }, []);

  const downloadDatabaseBackup = async () => {
    setDownloadingBackup(true);
    try {
      const response = await api.get('/settings/backup/download', {
        responseType: 'blob',
      });

      // Extract filename from Content-Disposition header if available
      const disposition = response.headers['content-disposition'];
      let filename = `worthtobuy_backup_${new Date().toISOString().slice(0, 10)}.sql.gz`;
      if (disposition && disposition.includes('filename=')) {
        const matches = disposition.match(/filename="?([^"]+)"?/);
        if (matches?.[1]) filename = matches[1];
      }

      // Trigger browser download
      const blob = new Blob([response.data], { type: 'application/gzip' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setToast({ message: `Database backup downloaded successfully: ${filename}`, type: 'success' });
      fetchBackupLogs();
    } catch (caught) {
      setToast({ message: errorMessage(caught) || 'Failed to download backup.', type: 'error' });
    } finally {
      setDownloadingBackup(false);
    }
  };

  const restoreDatabaseBackup = async (file: File) => {
    if (!file) return;
    setRestoringBackup(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/settings/backup/restore', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setToast({ message: res.data?.message || 'Database restored successfully!', type: 'success' });
      fetchBackupLogs();
      return res.data;
    } catch (caught) {
      setToast({ message: errorMessage(caught) || 'Failed to restore database.', type: 'error' });
      fetchBackupLogs();
      throw caught;
    } finally {
      setRestoringBackup(false);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const result = await saveSettingsAction({
        brand,
        invoice,
        feeRulesCustomer,
        feeRulesReseller,
      });
      setFeeRulesCustomer(result.feeRulesCustomer);
      setFeeRulesReseller(result.feeRulesReseller);
      setToast({ message: 'All WORTHTOBUY settings saved successfully.', type: 'success' });
    } catch (caught) {
      setToast({ message: errorMessage(caught), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return {
    brand,
    setBrand,
    invoice,
    setInvoice,
    backupLogs,
    backupLogsTotal,
    loadingLogs,
    downloadingBackup,
    restoringBackup,
    downloadDatabaseBackup,
    restoreDatabaseBackup,
    fetchBackupLogs,
    feeTab,
    setFeeTab,
    feeRulesCustomer,
    feeRulesReseller,
    currentRules,
    sortedFeeRules,
    loading,
    saving,
    toast,
    setToast,
    sortKey,
    sortDirection,
    toggleSort,
    updateRule,
    addRule,
    deleteRule,
    saveAll,
  };
}
