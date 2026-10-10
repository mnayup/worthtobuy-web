import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  WalletCards,
  CalendarDays,
} from 'lucide-react';
import type { AiStatus } from '../types';

export function AiStatusCards({
  status,
  userRole,
}: {
  status: AiStatus | null;
  userRole?: string;
}) {
  return (
    <>
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            {status?.enabled ? (
              <CheckCircle2 className="text-emerald-600" />
            ) : (
              <XCircle className="text-rose-600" />
            )}
            <div>
              <p className="text-xs font-bold text-brand-400">AI Status</p>
              <p className="font-black text-brand-900">
                {status?.enabled
                  ? status.mockMode
                    ? 'Active — Mock Mode'
                    : 'Gemini Active'
                  : 'Not Configured'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="text-honey-500" />
            <div>
              <p className="text-xs font-bold text-brand-400">Model</p>
              <p className="font-black text-brand-900">{status?.model || '-'}</p>
              <p className="text-[10px] font-semibold text-brand-400">
                API {status?.apiVersion || '-'} • Chatbox {status?.assistantVersion || '3.4.0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-brand-600" />
            <div>
              <p className="text-xs font-bold text-brand-400">Active Access</p>
              <p className="font-black text-brand-900">Role {userRole}</p>
              <p className="text-[10px] font-semibold text-brand-400">
                API keys processed securely on backend
              </p>
            </div>
          </div>
        </div>
      </div>

      {!status?.enabled && (
        <div className="card mb-5 border-honey-200 bg-honey-50 p-5">
          <p className="font-black text-honey-800">Gemini is not configured</p>
          <p className="mt-2 text-sm leading-relaxed text-honey-700">
            Provide <code className="rounded bg-white px-1.5 py-0.5 font-bold">GEMINI_API_KEY</code>{' '}
            in your <code className="rounded bg-white px-1.5 py-0.5 font-bold">.env</code> file, then
            run{' '}
            <code className="rounded bg-white px-1.5 py-0.5 font-bold">
              docker compose up -d --build
            </code>
            . All other dashboard features remain fully functional.
          </p>
        </div>
      )}
    </>
  );
}

export function AiFeatureHighlights() {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <div className="card p-4">
        <WalletCards className="text-cherry-500" size={19} />
        <p className="mt-2 text-xs font-black text-brand-800">Grounded Financial Data</p>
        <p className="mt-1 text-[11px] leading-5 text-brand-500">
          Revenue, payments, outstanding, capital, expenses, refunds, and profit margins are
          clearly separated.
        </p>
      </div>
      <div className="card p-4">
        <CalendarDays className="text-honey-500" size={19} />
        <p className="mt-2 text-xs font-black text-brand-800">Asia/Jakarta Timezone</p>
        <p className="mt-1 text-[11px] leading-5 text-brand-500">
          Monthly, weekly, and daily calculations aligned with your operational business hours.
        </p>
      </div>
      <div className="card p-4">
        <ShieldCheck className="text-emerald-600" size={19} />
        <p className="mt-2 text-xs font-black text-brand-800">Role-Based Clearance</p>
        <p className="mt-1 text-[11px] leading-5 text-brand-500">
          OWNER, FINANCE, and ADMIN access separate context tiers according to permission rules.
        </p>
      </div>
    </div>
  );
}
