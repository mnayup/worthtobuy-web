import React from 'react';
import { Lock, Users } from 'lucide-react';
import type { RoleItem } from '../types';

interface PermissionRoleSelectorProps {
  roles: RoleItem[];
  selectedRoleId: number | null;
  onSelectRole: (role: RoleItem) => void;
}

export function PermissionRoleSelector({
  roles,
  selectedRoleId,
  onSelectRole,
}: PermissionRoleSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
      {roles.map((role) => {
        const isSelected = role.id === selectedRoleId;
        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onSelectRole(role)}
            className={
              'flex flex-col p-3.5 rounded-2xl border text-left transition ' +
              'relative cursor-pointer ' +
              (isSelected
                ? 'bg-cherry-50/70 border-cherry-400 shadow-md shadow-cherry-500/10'
                : 'bg-white border-brand-200 hover:border-brand-300 hover:bg-brand-50/50')
            }
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <span
                className={
                  'font-black text-sm tracking-wide ' +
                  (isSelected ? 'text-cherry-800' : 'text-brand-900')
                }
              >
                {role.name}
              </span>
              {role.name === 'OWNER' ? (
                <span
                  className={
                    'flex items-center gap-1 text-[10px] font-extrabold uppercase ' +
                    'px-2 py-0.5 rounded-full bg-honey-100 text-honey-800 border border-honey-300'
                  }
                >
                  <Lock size={10} /> Full
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-500">
                  <Users size={12} /> {role.userCount} user
                </span>
              )}
            </div>
            <p className="text-[11px] text-brand-500 line-clamp-2 leading-relaxed">
              {role.description ||
                (role.name === 'OWNER' ? 'Super Administrator penuh' : 'Tidak ada deskripsi')}
            </p>
          </button>
        );
      })}
    </div>
  );
}
