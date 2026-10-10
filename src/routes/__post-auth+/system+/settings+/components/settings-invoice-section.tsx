import React, { type Dispatch, type SetStateAction, type ReactNode } from 'react';
import { FileText } from 'lucide-react';
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
  return (
    <section className="card p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-cherry-50 p-3 text-cherry-600">
          <FileText size={21} />
        </div>
        <div>
          <h2 className="section-title">Invoice Settings</h2>
          <p className="text-sm font-medium text-brand-500">
            Payment methods and business contact info printed on customer invoices.
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
