import React, { type Dispatch, type SetStateAction, type ReactNode } from 'react';
import { FileText, QrCode, UploadCloud, Loader2, Trash2, ImageIcon } from 'lucide-react';
import { useS3Upload } from '~/hooks/useS3Upload';
import type { InvoiceSettings } from '../types';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

interface SettingsInvoiceSectionProps {
  invoice: InvoiceSettings;
  setInvoice: Dispatch<SetStateAction<InvoiceSettings>>;
}

export function SettingsInvoiceSection({
  invoice,
  setInvoice,
}: SettingsInvoiceSectionProps) {
  const { uploadFile, deleteFile, isUploading, error: uploadError } = useS3Upload();

  const handleQrisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const oldUrl = invoice.qrisImageUrl;
      const uploadedUrl = await uploadFile(file, 'qris', 'image');
      if (uploadedUrl) {
        setInvoice((curr) => ({ ...curr, qrisImageUrl: uploadedUrl }));
        if (oldUrl && oldUrl.startsWith('http')) {
          await deleteFile(oldUrl).catch(() => {});
        }
      }
    } catch {
      // Handled by hook error state
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveQris = async () => {
    const oldUrl = invoice.qrisImageUrl;
    setInvoice((curr) => ({ ...curr, qrisImageUrl: '' }));
    if (oldUrl && oldUrl.startsWith('http')) {
      await deleteFile(oldUrl).catch(() => {});
    }
  };

  return (
    <section className="card p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-cherry-50 p-3 text-cherry-600">
          <FileText size={21} />
        </div>
        <div>
          <h2 className="section-title">Invoice Settings</h2>
          <p className="text-sm font-medium text-brand-500">
            Payment methods, QRIS barcode, and business contact info printed on customer invoices.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Business Name on Invoice">
          <input
            className="input"
            value={invoice.businessName}
            onChange={(e) =>
              setInvoice((curr) => ({ ...curr, businessName: e.target.value }))
            }
          />
        </Field>
        <Field label="Invoice Prefix">
          <input
            className="input uppercase font-bold"
            value={invoice.prefix}
            onChange={(e) =>
              setInvoice((curr) => ({
                ...curr,
                prefix: e.target.value.toUpperCase(),
              }))
            }
            placeholder="WTB-INV"
          />
        </Field>
        <Field label="Bank Name">
          <input
            className="input"
            value={invoice.bankName}
            onChange={(e) =>
              setInvoice((curr) => ({ ...curr, bankName: e.target.value }))
            }
            placeholder="BCA"
          />
        </Field>
        <Field label="Account Number">
          <input
            className="input font-mono"
            value={invoice.accountNumber}
            onChange={(e) =>
              setInvoice((curr) => ({ ...curr, accountNumber: e.target.value }))
            }
          />
        </Field>
        <Field label="Account Holder Name">
          <input
            className="input"
            value={invoice.accountHolder}
            onChange={(e) =>
              setInvoice((curr) => ({ ...curr, accountHolder: e.target.value }))
            }
          />
        </Field>
        <Field label="WhatsApp Contact">
          <input
            className="input"
            value={invoice.whatsapp}
            onChange={(e) =>
              setInvoice((curr) => ({ ...curr, whatsapp: e.target.value }))
            }
          />
        </Field>
        <Field label="Email Address">
          <input
            className="input"
            type="email"
            value={invoice.email}
            onChange={(e) =>
              setInvoice((curr) => ({ ...curr, email: e.target.value }))
            }
          />
        </Field>
        <Field label="Business Address">
          <input
            className="input"
            value={invoice.address}
            onChange={(e) =>
              setInvoice((curr) => ({ ...curr, address: e.target.value }))
            }
          />
        </Field>

        {/* QRIS Image Upload Section */}
        <div className="md:col-span-2 xl:col-span-4 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <QrCode size={18} className="text-cherry-600" />
            <label className="text-xs font-bold text-brand-900 uppercase tracking-wider">
              QRIS Barcode Image (Foto / Barcode QRIS Resmi)
            </label>
            <span className="rounded bg-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-800">
              Optional
            </span>
          </div>
          <p className="text-xs text-brand-500 mb-3 leading-relaxed">
            Unggah gambar barcode QRIS toko Anda. Jika barcode QRIS diunggah, pilihan tab &quot;QRIS Pay&quot; akan otomatis aktif di invoice publik customer.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {invoice.qrisImageUrl ? (
              <div className="relative group shrink-0">
                <div className="w-28 h-28 rounded-2xl border-2 border-brand-800 bg-white p-2 shadow-xs flex items-center justify-center overflow-hidden">
                  <img
                    src={invoice.qrisImageUrl}
                    alt="QRIS Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveQris}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-cherry-600 text-white shadow-md hover:bg-cherry-700 transition"
                  title="Hapus gambar QRIS"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ) : (
              <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-brand-300 bg-white/70 flex flex-col items-center justify-center text-brand-400 shrink-0">
                <ImageIcon size={28} />
                <span className="text-[10px] font-bold mt-1">Belum Ada QRIS</span>
              </div>
            )}

            <div className="space-y-2 flex-1">
              <label
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                  isUploading
                    ? 'bg-brand-200 text-brand-500 cursor-not-allowed'
                    : 'bg-brand-900 text-white hover:bg-brand-800'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Mengunggah QRIS...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={14} />
                    <span>{invoice.qrisImageUrl ? 'Ganti Gambar QRIS' : 'Pilih File Gambar QRIS'}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  disabled={isUploading}
                  className="hidden"
                  onChange={handleQrisUpload}
                />
              </label>

              {invoice.qrisImageUrl && (
                <button
                  type="button"
                  onClick={handleRemoveQris}
                  className="ml-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-cherry-600 hover:bg-cherry-50 transition border border-cherry-200 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Hapus QRIS</span>
                </button>
              )}

              {uploadError && (
                <p className="text-xs font-bold text-cherry-600 mt-1">{uploadError}</p>
              )}

              <p className="text-[11px] text-brand-400">
                Format: PNG, JPG, JPEG, atau WebP (Disarankan resolusi tajam minimal 500x500 px).
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 xl:col-span-4">
          <label className="label">Invoice Footer Notes</label>
          <textarea
            className="input min-h-24 leading-relaxed"
            value={invoice.footer}
            onChange={(e) =>
              setInvoice((curr) => ({ ...curr, footer: e.target.value }))
            }
          />
        </div>
      </div>
    </section>
  );
}
