import React from 'react';
import { Trash2, Save, Loader2 } from 'lucide-react';
import type { RoleItem } from '../types';

interface PermissionRoleHeaderProps {
  selectedRole: RoleItem;
  isOwnerRole: boolean;
  roleDescription: string;
  setRoleDescription: (desc: string) => void;
  canViewProfit: boolean;
  setCanViewProfit: (val: boolean) => void;
  saving: boolean;
  onSave: () => void;
  onDelete: () => void;
  grantedCount: number;
  totalPermissions: number;
  onGrantAll: () => void;
  onRevokeAll: () => void;
}

export function PermissionRoleHeader({
  selectedRole,
  isOwnerRole,
  roleDescription,
  setRoleDescription,
  canViewProfit,
  setCanViewProfit,
  saving,
  onSave,
  onDelete,
  grantedCount,
  totalPermissions,
  onGrantAll,
  onRevokeAll,
}: PermissionRoleHeaderProps) {
  const isProtectedRole = ['ADMIN', 'SHOPPER', 'FINANCE'].includes(selectedRole.name);

  return (
    <div className="border-b border-brand-200/70 bg-gradient-to-r from-brand-50/80 to-rose-50/30 p-5 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={
                'px-2.5 py-0.5 rounded-lg bg-cherry-600 text-white ' +
                'font-black text-xs uppercase tracking-wider'
              }
            >
              Role: {selectedRole.name}
            </span>
            {isOwnerRole && (
              <span
                className={
                  'text-xs font-bold text-amber-700 bg-amber-50 px-2 ' +
                  'py-0.5 rounded-md border border-amber-200'
                }
              >
                Semua hak akses aktif secara otomatis (Unrestricted Superadmin)
              </span>
            )}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 max-w-2xl">
            <div>
              <label className="text-[11px] font-extrabold text-brand-700 uppercase tracking-wider">
                Deskripsi Role
              </label>
              <input
                type="text"
                disabled={isOwnerRole}
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Masukkan deskripsi tugas role..."
                className="input !h-9 text-xs mt-1 bg-white"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-bold text-brand-800 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isOwnerRole}
                  checked={isOwnerRole ? true : canViewProfit}
                  onChange={(e) => setCanViewProfit(e.target.checked)}
                  className="rounded border-brand-300 text-cherry-600 focus:ring-cherry-500 h-4 w-4"
                />
                <span>Izinkan Akses Laba Bersih & Profit (P&L)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {!isOwnerRole && !isProtectedRole && (
            <button
              type="button"
              onClick={onDelete}
              className={
                'btn-secondary !h-9 px-3 text-xs font-bold text-red-600 ' +
                'border-red-200 hover:bg-red-50 hover:border-red-300 cursor-pointer'
              }
            >
              <Trash2 size={14} className="mr-1" />
              Hapus Role
            </button>
          )}

          <button
            type="button"
            onClick={onSave}
            disabled={saving || isOwnerRole}
            className={
              'btn-primary !h-9 px-4 text-xs font-black shadow-md ' +
              'shadow-cherry-500/20 flex items-center gap-1.5 cursor-pointer'
            }
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{saving ? 'Menyimpan...' : 'Simpan Hak Akses'}</span>
          </button>
        </div>
      </div>

      {/* Quick stats and bulk toggles */}
      <div
        className={
          'mt-5 flex flex-col sm:flex-row sm:items-center justify-between ' +
          'gap-3 pt-4 border-t border-brand-200/60'
        }
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-brand-700">Total Akses Diberikan:</span>
          <span
            className={
              'font-mono text-xs font-black px-2.5 py-0.5 rounded-full ' +
              'bg-cherry-100 text-cherry-800 border border-cherry-200'
            }
          >
            {grantedCount} / {totalPermissions} Permissions
          </span>
        </div>

        {!isOwnerRole && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onGrantAll}
              className={
                'text-xs font-bold text-brand-600 hover:text-brand-900 ' +
                'bg-white border border-brand-200 px-2.5 py-1 rounded-lg ' +
                'hover:bg-brand-50 transition'
              }
            >
              Centang Semua
            </button>
            <button
              type="button"
              onClick={onRevokeAll}
              className={
                'text-xs font-bold text-brand-600 hover:text-brand-900 ' +
                'bg-white border border-brand-200 px-2.5 py-1 rounded-lg ' +
                'hover:bg-brand-50 transition'
              }
            >
              Hapus Semua
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
