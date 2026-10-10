import React, { type FormEvent } from 'react';
import { User as UserIcon, Mail, Phone, Loader2, Save } from 'lucide-react';

interface ProfileInfoCardProps {
  name: string;
  setName: (val: string) => void;
  username: string;
  setUsername: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  savingProfile: boolean;
  onSubmit: (e: FormEvent) => void;
}

export function ProfileInfoCard({
  name,
  setName,
  username,
  setUsername,
  email,
  setEmail,
  phone,
  setPhone,
  savingProfile,
  onSubmit,
}: ProfileInfoCardProps) {
  return (
    <div className="rounded-3xl border border-brand-200/80 bg-white p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-brand-100">
        <UserIcon size={18} className="text-cherry-600" />
        <h2 className="text-sm font-black text-brand-900 uppercase tracking-wider">
          Data Profil Akun
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Nama Lengkap</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama lengkap Anda"
            className="input"
          />
        </div>

        <div>
          <label className="label">Username (ID Login)</label>
          <div className="relative">
            <span
              className={
                'absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 ' +
                'font-mono font-bold text-xs'
              }
            >
              @
            </span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))
              }
              placeholder="username_anda"
              className="input !pl-8 font-mono text-xs font-bold"
            />
          </div>
          <p className="mt-1 text-[11px] text-brand-400">
            Dapat digunakan untuk masuk ke sistem tanpa memerlukan email.
          </p>
        </div>

        <div>
          <label className="label">Alamat Email (Opsional)</label>
          <div className="relative">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400"
              size={16}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com (Opsional)"
              className="input !pl-10 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="label">Nomor WhatsApp / Telepon</label>
          <div className="relative">
            <Phone
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400"
              size={16}
            />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
              className="input !pl-10 text-xs font-mono"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={savingProfile}
            className={
              'btn-primary w-full py-2.5 text-xs font-black shadow-md ' +
              'shadow-cherry-500/20 flex items-center justify-center gap-2 cursor-pointer'
            }
          >
            {savingProfile ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            <span>{savingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
