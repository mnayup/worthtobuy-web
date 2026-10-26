import { ChevronDown, ChevronRight, PanelLeftClose, Sparkles, X } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '~/context/AuthContext';
import { api } from '~/lib/api';
import { navGroups as fallbackNavGroups, resolveIcon, type NavGroupConfig, type NavItemConfig } from './nav-config';

interface SidebarProps {
  collapsed: boolean;
  mobile?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

export function Sidebar({ collapsed, mobile, onClose, onToggle }: SidebarProps) {
  const { user, hasPermission } = useAuth();
  const location = useLocation();
  const compact = collapsed && !mobile;
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [dbNavGroups, setDbNavGroups] = useState<NavGroupConfig[] | null>(null);

  useEffect(() => {
    let mounted = true;
    if (user) {
      api
        .get('/navigation/user-menu')
        .then((res) => {
          if (!mounted || !Array.isArray(res.data) || res.data.length === 0) return;
          const mapped: NavGroupConfig[] = res.data.map((group: any) => ({
            title: group.title,
            items: (group.items || []).map((item: any) => ({
              to: item.path,
              label: item.label,
              icon: resolveIcon(item.icon),
              subItems: (item.sub_items || []).map((sub: any) => ({
                to: sub.path,
                label: sub.label,
                icon: resolveIcon(sub.icon),
              })),
            })),
          }));
          setDbNavGroups(mapped);
        })
        .catch(() => {
          // fallback to client-defined navGroups on network failure
        });
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  const toggleSubmenu = (to: string) => {
    setOpenSubmenus((curr) => ({ ...curr, [to]: !curr[to] }));
  };

  const isItemActive = (item: NavItemConfig) => {
    if (item.to === '/' || item.to === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    if (location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)) {
      return true;
    }
    if (
      item.to === '/purchases' &&
      (location.pathname === '/shopping-list' ||
        location.pathname.startsWith('/shopping-list/'))
    ) {
      return true;
    }
    if (
      item.subItems?.some(
        (sub) =>
          location.pathname === sub.to || location.pathname.startsWith(`${sub.to}/`)
      )
    ) {
      return true;
    }
    return false;
  };

  const activeGroups = dbNavGroups || fallbackNavGroups;

  const filteredGroups = activeGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!user) return false;
        // If loaded from backend API, items are already pre-filtered, but still double-check
        const modKey = item.to.replace(/^\//, '') || 'dashboard';
        const hasParentPerm = hasPermission(modKey, 'view');
        const hasAnySubPerm =
          item.subItems &&
          item.subItems.some((sub) => {
            const subKey = sub.to.replace(/^\//, '') || 'dashboard';
            return hasPermission(subKey, 'view');
          });
        return hasParentPerm || Boolean(hasAnySubPerm);
      }),
    }))
    .filter((group) => group.items.length > 0);


  return (
    <aside
      className={clsx(
        'flex h-full flex-col border-r border-slate-200/80 bg-white transition-all duration-300 shadow-xs',
        compact ? 'w-[84px]' : 'w-[280px]'
      )}
    >
      <div
        className={clsx(
          'flex h-[80px] items-center border-b border-slate-100 px-4',
          compact ? 'justify-center' : 'justify-between'
        )}
      >
        <div className={clsx('flex min-w-0 items-center', compact ? '' : 'gap-3')}>
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-tr from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/25">
            <img
              src="/worthtobuy-mark.png"
              alt="WORTHTOBUY"
              className="h-full w-full object-contain p-1"
            />
          </div>
          {!compact && (
            <div className="min-w-0">
              <p className="truncate text-[16px] font-black tracking-tight text-slate-900">
                WORTHTOBUY
              </p>
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <span>Personal Shopper HQ</span>
              </p>
            </div>
          )}
        </div>
        {mobile ? (
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>
        ) : !compact ? (
          <button
            onClick={onToggle}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            title="Collapse sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        ) : null}
      </div>

      {!compact && (
        <div className="mx-3 mt-3 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/80 via-white to-indigo-50/50 p-3 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-rose-500 text-white shadow-xs">
              <Sparkles size={11} />
            </div>
            <p className="text-xs font-extrabold text-slate-900">Jastip Concierge</p>
          </div>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-500">
            Events, orders, deposits, and delivery in one place.
          </p>
        </div>
      )}

      <nav className="flex-1 space-y-3 overflow-y-auto p-3 scrollbar-thin">
        {filteredGroups.map((group, groupIdx) => (
          <div key={group.title}>
            {!compact ? (
              <p className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </p>
            ) : groupIdx > 0 ? (
              <div className="my-2 border-t border-slate-100" />
            ) : null}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isItemActive(item);
                const hasSub = item.subItems && item.subItems.length > 0;
                const isSubOpen = openSubmenus[item.to] ?? active;
                const Icon = item.icon;

                return (
                  <div key={item.to} className="space-y-0.5">
                    {hasSub ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!compact) toggleSubmenu(item.to);
                        }}
                        title={compact ? item.label : undefined}
                        className={clsx(
                          'group flex w-full items-center rounded-xl py-2 text-sm font-bold transition-all duration-150',
                          compact ? 'justify-center px-2' : 'gap-3 px-3',
                          active
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        )}
                      >
                        <Icon size={18} className="shrink-0" />
                        {!compact && (
                          <>
                            <span className="flex-1 truncate text-left">{item.label}</span>
                            <div className="rounded-lg p-0.5 text-current/60 group-hover:text-current">
                              <ChevronDown
                                size={14}
                                className={clsx(
                                  'transition-transform duration-200',
                                  isSubOpen ? 'rotate-180' : ''
                                )}
                              />
                            </div>
                          </>
                        )}
                      </button>
                    ) : (
                      <NavLink
                        to={item.to}
                        end={item.to === '/'}
                        onClick={onClose}
                        title={compact ? item.label : undefined}
                        className={({ isActive }) =>
                          clsx(
                            'group flex items-center rounded-xl py-2 text-sm font-bold transition-all duration-150',
                            compact ? 'justify-center px-2' : 'gap-3 px-3',
                            isActive
                              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          )
                        }
                      >
                        <Icon size={18} className="shrink-0" />
                        {!compact && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            <ChevronRight
                              size={14}
                              className="opacity-0 transition group-hover:opacity-40"
                            />
                          </>
                        )}
                      </NavLink>
                    )}

                    {!compact && hasSub && isSubOpen && (
                      <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-slate-200 pl-3">
                        {item.subItems
                          ?.filter((sub) => {
                            if (!user) return false;
                            const modKey = sub.to.replace(/^\//, '') || 'dashboard';
                            return hasPermission(modKey, 'view');
                          })
                          .map((sub) => (
                            <NavLink
                              key={sub.to}
                              to={sub.to}
                              end={
                                sub.to === '/orders' ||
                                sub.to === '/invoices' ||
                                sub.to === '/finance' ||
                                sub.to === '/shopping-list'
                              }
                              onClick={onClose}
                              className={({ isActive }) =>
                                clsx(
                                  'block rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all',
                                  isActive
                                    ? 'bg-rose-50 font-extrabold text-rose-700'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                )
                              }
                            >
                              {sub.label}
                            </NavLink>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
