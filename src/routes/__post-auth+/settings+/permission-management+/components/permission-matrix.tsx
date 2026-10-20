import React from 'react';
import {
  TrendingUp,
  Sparkles,
  ClipboardList,
  Boxes,
  Users,
  ReceiptText,
  ShoppingBag,
  Truck,
  Layers,
  FileText,
  CircleDollarSign,
  RotateCcw,
  Landmark,
  UserCog,
  ShieldCheck,
  Settings,
  Trash2,
  Search,
  CheckSquare,
  Square,
  Archive,
  MessageCircle,
} from 'lucide-react';
import type { ModuleDef } from '../types';

const MODULE_ICONS: Record<string, any> = {
  dashboard: TrendingUp,
  'ai-assistant': Sparkles,
  periods: ClipboardList,
  products: Boxes,
  customers: Users,
  'whatsapp-groups': MessageCircle,
  orders: ReceiptText,
  purchases: ShoppingBag,
  shipments: Truck,
  'keep-items': Archive,
  'item-tracking': Layers,
  'shopping-list': ShoppingBag,
  invoices: FileText,
  payments: CircleDollarSign,
  refunds: RotateCcw,
  expenses: CircleDollarSign,
  finance: Landmark,
  summary: Landmark,
  reports: FileText,
  users: UserCog,
  roles: ShieldCheck,
  settings: Settings,
  trash: Trash2,
};

interface PermissionMatrixProps {
  groupedModules: Record<string, ModuleDef[]>;
  isOwnerRole: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isPermissionChecked: (permKey: string) => boolean;
  togglePermission: (permKey: string) => void;
  toggleModulePermissions: (mod: ModuleDef) => void;
  toggleGroupPermissions: (mods: ModuleDef[]) => void;
}

export function PermissionMatrix({
  groupedModules,
  isOwnerRole,
  searchQuery,
  setSearchQuery,
  isPermissionChecked,
  togglePermission,
  toggleModulePermissions,
  toggleGroupPermissions,
}: PermissionMatrixProps) {
  return (
    <>
      {/* Search bar within permission list */}
      <div className="p-4 border-b border-brand-200/60 bg-brand-50/30 flex items-center gap-3">
        <Search size={16} className="text-brand-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama modul menu atau aksi tombol (orders, create, export)..."
          className={
            'bg-transparent border-none text-xs text-brand-900 ' +
            'placeholder-brand-400 focus:outline-none w-full font-medium'
          }
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-brand-400 hover:text-brand-700 font-bold px-2 py-0.5"
          >
            Clear
          </button>
        )}
      </div>

      {/* Matrix of Groups and Menus */}
      <div className="divide-y divide-brand-100">
        {Object.entries(groupedModules).map(([groupName, modules]) => {
          if (modules.length === 0) return null;

          return (
            <div key={groupName} className="p-5 sm:p-6 space-y-4">
              {/* Group Header */}
              <div className="flex items-center justify-between pb-2 border-b border-brand-200/50">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cherry-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-900">
                    {groupName} Group
                  </h3>
                  <span className="text-[11px] font-semibold text-brand-400">
                    ({modules.length} menu)
                  </span>
                </div>

                {!isOwnerRole && (
                  <button
                    type="button"
                    onClick={() => toggleGroupPermissions(modules)}
                    className={
                      'text-[11px] font-bold text-cherry-700 hover:text-cherry-900 ' +
                      'hover:underline cursor-pointer'
                    }
                  >
                    Toggle Group
                  </button>
                )}
              </div>

              {/* Modules list in this group */}
              <div className="space-y-3">
                {modules.map((mod) => {
                  const IconComponent = MODULE_ICONS[mod.key] || Boxes;
                  const moduleKeys = mod.actions.map((act) => `${mod.key}:${act.key}`);
                  const allChecked = moduleKeys.every((k) => isPermissionChecked(k));

                  return (
                    <div
                      key={mod.key}
                      className={
                        'rounded-2xl border border-brand-200/70 bg-white p-4 ' +
                        'transition hover:border-brand-300 hover:shadow-xs'
                      }
                    >
                      <div
                        className={
                          'flex flex-col sm:flex-row sm:items-center justify-between ' +
                          'gap-3 mb-3 pb-3 border-b border-brand-100'
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={
                              'flex h-8 w-8 items-center justify-center ' +
                              'rounded-xl bg-brand-100 text-brand-700 shrink-0'
                            }
                          >
                            <IconComponent size={16} />
                          </div>
                          <div>
                            <span className="text-xs font-black text-brand-900">
                              {mod.label}
                            </span>
                            <span className="ml-2 font-mono text-[10px] text-brand-400">
                              [{mod.key}]
                            </span>
                          </div>
                        </div>

                        {!isOwnerRole && (
                          <button
                            type="button"
                            onClick={() => toggleModulePermissions(mod)}
                            className={
                              'inline-flex items-center gap-1.5 text-[11px] font-bold ' +
                              'text-brand-600 hover:text-brand-900 px-2.5 py-1 rounded-lg ' +
                              'bg-brand-50 border border-brand-200/80 transition cursor-pointer'
                            }
                          >
                            {allChecked ? (
                              <>
                                <CheckSquare size={13} className="text-cherry-600" />
                                <span>Uncheck Menu</span>
                              </>
                            ) : (
                              <>
                                <Square size={13} className="text-brand-400" />
                                <span>Check All ({mod.actions.length})</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Action Checkboxes */}
                      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {mod.actions.map((act) => {
                          const permKey = `${mod.key}:${act.key}`;
                          const checked = isPermissionChecked(permKey);
                          const isDeleteAction = act.key === 'delete';

                          return (
                            <label
                              key={act.key}
                              className={
                                'flex items-start gap-2 p-2 rounded-xl border text-xs ' +
                                'transition select-none ' +
                                (isOwnerRole ? 'cursor-default ' : 'cursor-pointer ') +
                                (checked
                                  ? isDeleteAction
                                    ? 'bg-rose-50/60 border-rose-300 text-rose-900'
                                    : 'bg-cherry-50/50 border-cherry-300 text-brand-900 font-bold'
                                  : 'bg-white border-brand-200/80 text-brand-500 hover:bg-brand-50/50')
                              }
                            >
                              <input
                                type="checkbox"
                                disabled={isOwnerRole}
                                checked={checked}
                                onChange={() => togglePermission(permKey)}
                                className={
                                  'mt-0.5 rounded border-brand-300 text-cherry-600 ' +
                                  'focus:ring-cherry-500 h-3.5 w-3.5 shrink-0'
                                }
                              />
                              <div className="min-w-0">
                                <span className="block truncate text-[11px] leading-tight">
                                  {act.label}
                                </span>
                                <span className="font-mono text-[9px] text-brand-400 block truncate">
                                  {act.key}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
