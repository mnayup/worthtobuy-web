import React, { type FormEvent } from 'react';

interface PermissionNewRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  newRoleName: string;
  setNewRoleName: (name: string) => void;
  newRoleDesc: string;
  setNewRoleDesc: (desc: string) => void;
  creatingRole: boolean;
}

export function PermissionNewRoleModal({
  isOpen,
  onClose,
  onSubmit,
  newRoleName,
  setNewRoleName,
  newRoleDesc,
  setNewRoleDesc,
  creatingRole,
}: PermissionNewRoleModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={
        'fixed inset-0 z-50 flex items-center justify-center p-4 ' +
        'bg-black/40 backdrop-blur-xs animate-fade-in'
      }
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-brand-200">
        <h3 className="text-lg font-black text-brand-900 mb-1">Tambah Custom Role Baru</h3>
        <p className="text-xs text-brand-500 mb-4">
          Buat role baru dan atur izin hak aksesnya secara mandiri.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Nama Role (Huruf Besar)</label>
            <input
              type="text"
              required
              placeholder="Contoh: OPERATOR_GUDANG"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
              className="input font-mono font-bold"
            />
          </div>

          <div>
            <label className="label">Deskripsi Role</label>
            <input
              type="text"
              placeholder="Contoh: Petugas pencatatan fisik gudang dan packing"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="input"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary !h-10 px-4 text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={creatingRole || !newRoleName.trim()}
              className={
                'btn-primary !h-10 px-5 text-xs font-black ' +
                'shadow-md shadow-cherry-500/25 cursor-pointer'
              }
            >
              {creatingRole ? 'Menyimpan...' : 'Buat Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
