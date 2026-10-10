import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '~/components/StatusBadge';

interface ProfileHeaderBannerProps {
  name: string;
  username: string;
  role?: string;
  mfaEnabled?: boolean;
}

export function ProfileHeaderBanner({
  name,
  username,
  role,
  mfaEnabled,
}: ProfileHeaderBannerProps) {
  return (
    <div
      className={
        'rounded-3xl border border-brand-200/80 bg-gradient-to-r ' +
        'from-brand-900 via-brand-950 to-cherry-950 p-6 sm:p-8 text-white ' +
        'shadow-xl relative overflow-hidden'
      }
    >
      <div
        className={
          'absolute -right-16 -top-16 h-64 w-64 rounded-full ' +
          'bg-cherry-500/10 blur-3xl pointer-events-none'
        }
      />
      <div
        className={
          'relative flex flex-col sm:flex-row items-start sm:items-center ' +
          'justify-between gap-6'
        }
      >
        <div className="flex items-center gap-4">
          <div
            className={
              'flex h-16 w-16 items-center justify-center rounded-2xl ' +
              'bg-gradient-to-tr from-cherry-500 to-rose-600 text-white ' +
              'font-black text-2xl shadow-lg shadow-cherry-500/30'
            }
          >
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">{name || 'User'}</h1>
              <StatusBadge value={role || 'USER'} />
            </div>
            <p className="text-xs text-brand-300 font-mono mt-0.5">
              @{username || 'user'}
            </p>
            <p className="text-[11px] text-brand-400 mt-1">
              {role === 'OWNER'
                ? 'Owner / Super Administrator'
                : `Role Member: ${role}`}
            </p>
          </div>
        </div>

        <div
          className={
            'flex items-center gap-2 bg-white/10 backdrop-blur-md ' +
            'px-3.5 py-2 rounded-2xl border border-white/10'
          }
        >
          {mfaEnabled ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck size={18} className="text-emerald-400" />
              <span>2FA MFA Aktif</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
              <ShieldAlert size={18} className="text-rose-400" />
              <span>2FA Belum Aktif</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
