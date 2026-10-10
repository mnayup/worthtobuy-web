import React, { type FormEvent, type Dispatch, type SetStateAction } from 'react';
import { Lock, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';

interface ProfilePasswordCardProps {
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showCurrentPass: boolean;
  setShowCurrentPass: Dispatch<SetStateAction<boolean>>;
  showNewPass: boolean;
  setShowNewPass: Dispatch<SetStateAction<boolean>>;
  savingPassword: boolean;
  onSubmit: (e: FormEvent) => void;
}

export function ProfilePasswordCard({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showCurrentPass,
  setShowCurrentPass,
  showNewPass,
  setShowNewPass,
  savingPassword,
  onSubmit,
}: ProfilePasswordCardProps) {
  return (
    <div className="rounded-3xl border border-brand-200/80 bg-white p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-brand-100">
        <Lock size={18} className="text-cherry-600" />
        <h2 className="text-sm font-black text-brand-900 uppercase tracking-wider">
          Ubah Password
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Password Saat Ini</label>
          <div className="relative">
            <input
              type={showCurrentPass ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="input !pr-10 text-xs"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPass((p) => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-700"
            >
              {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Password Baru (Min. 6 Karakter)</label>
          <div className="relative">
            <input
              type={showNewPass ? 'text' : 'password'}
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="input !pr-10 text-xs"
            />
            <button
              type="button"
              onClick={() => setShowNewPass((p) => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-700"
            >
              {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Konfirmasi Password Baru</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="input text-xs"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={savingPassword || !currentPassword || !newPassword}
            className={
              'btn-secondary w-full py-2.5 text-xs font-black border-brand-300 ' +
              'hover:bg-brand-50 flex items-center justify-center gap-2 cursor-pointer'
            }
          >
            {savingPassword ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <KeyRound size={15} />
            )}
            <span>{savingPassword ? 'Mengubah...' : 'Perbarui Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
