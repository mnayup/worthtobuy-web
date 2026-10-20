import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, Boxes, Calculator, ChevronRight, CircleDollarSign, ClipboardList, FileBarChart2,
  FileText, Landmark, LayoutDashboard, LogOut, Menu, PackageCheck, PanelLeftClose,
  ReceiptText, RotateCcw, Search, Settings, ShoppingBag, Sparkles, Truck, UserCog, PackageSearch,
  Users, WalletCards, X, Trash2, ScrollText, Archive, MessageCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '~/context/AuthContext';
import { api } from '~/lib/api';
import { dateTime } from '~/lib/format';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['OWNER','ADMIN','SHOPPER','FINANCE'] },
  { to: '/summary', label: 'Summary & Fees', icon: Calculator, roles: ['OWNER','ADMIN','FINANCE'] },
  { to: '/invoices', label: 'Invoices', icon: FileText, roles: ['OWNER','ADMIN','FINANCE'] },
  { to: '/periods', label: 'Events', icon: ClipboardList, roles: ['OWNER','ADMIN','SHOPPER','FINANCE'] },
  { to: '/orders', label: 'Orders', icon: ReceiptText, roles: ['OWNER','ADMIN','FINANCE'] },
  { to: '/customers', label: 'Customers', icon: Users, roles: ['OWNER','ADMIN','FINANCE'] },
  { to: '/whatsapp-groups', label: 'WhatsApp Groups', icon: MessageCircle, roles: ['OWNER','ADMIN','FINANCE'] },
  { to: '/products', label: 'Products', icon: Boxes, roles: ['OWNER','ADMIN','SHOPPER'] },
  { to: '/item-tracking', label: 'Item Tracking', icon: PackageSearch, roles: ['OWNER','ADMIN','SHOPPER','FINANCE'] },
  { to: '/shopping-list', label: 'Shopping List', icon: ShoppingBag, roles: ['OWNER','ADMIN','SHOPPER'] },
  { to: '/purchases', label: 'Purchases', icon: PackageCheck, roles: ['OWNER','ADMIN','SHOPPER'] },
  { to: '/payments', label: 'Payments', icon: WalletCards, roles: ['OWNER','ADMIN','FINANCE'] },
  { to: '/shipments', label: 'Shipments', icon: Truck, roles: ['OWNER','ADMIN'] },
  { to: '/keep-items', label: 'Keep Items', icon: Archive, roles: ['OWNER','ADMIN'] },
  { to: '/expenses', label: 'Expenses', icon: CircleDollarSign, roles: ['OWNER','FINANCE'] },
  { to: '/refunds', label: 'Refunds', icon: RotateCcw, roles: ['OWNER','FINANCE'] },
  { to: '/finance', label: 'Financial Overview', icon: Landmark, roles: ['OWNER','FINANCE'] },
  { to: '/reports', label: 'Reports', icon: FileBarChart2, roles: ['OWNER','FINANCE'] },
  { to: '/ai-assistant', label: 'WORTHTOBUY AI', icon: Sparkles, roles: ['OWNER','FINANCE','ADMIN'] },
  { to: '/users', label: 'Users', icon: UserCog, roles: ['OWNER'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['OWNER'] },
  { to: '/trash', label: 'Trash', icon: Trash2, roles: ['OWNER'] },
];

function Sidebar({ collapsed, mobile, onClose, onToggle }: { collapsed: boolean; mobile?: boolean; onClose?: () => void; onToggle?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const compact = collapsed && !mobile;
  return (
    <aside className={clsx('flex h-full flex-col border-r border-brand-100 bg-[#fffdf9] transition-all duration-300', compact ? 'w-[86px]' : 'w-[286px]')}>
      <div className={clsx('flex h-[92px] items-center border-b border-brand-100 px-4', compact ? 'justify-center' : 'justify-between')}>
        <div className={clsx('flex min-w-0 items-center', compact ? '' : 'gap-3')}>
          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand-50 ring-1 ring-brand-100">
            <img src="/worthtobuy-mark.png" alt="WORTHTOBUY" className="h-full w-full object-contain p-1" />
          </div>
          {!compact && <div className="min-w-0">
            <p className="truncate text-[17px] font-black tracking-[-.04em] text-brand-900">WORTHTOBUY</p>
            <p className="text-[11px] font-semibold text-brand-400">Jastip control center</p>
          </div>}
        </div>
        {mobile ? (
          <button onClick={onClose} className="rounded-xl p-2 text-brand-500 hover:bg-brand-50"><X size={20}/></button>
        ) : !compact ? (
          <button onClick={onToggle} className="rounded-xl p-2 text-brand-400 hover:bg-brand-50 hover:text-brand-700"><PanelLeftClose size={18}/></button>
        ) : null}
      </div>

      {!compact && <div className="mx-3 mt-3 rounded-2xl border border-honey-100 bg-honey-50 p-3.5">
        <div className="flex items-center gap-2 text-brand-900"><Sparkles size={16} className="text-honey-500"/><p className="text-xs font-extrabold">WORTHTOBUY Concierge</p></div>
        <p className="mt-1 text-[11px] leading-relaxed text-brand-500">Orders, fee schedules, payments, and invoices in one unified workspace.</p>
      </div>}

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {nav.filter(item => user && item.roles.includes(user.role)).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            title={compact ? label : undefined}
            className={({ isActive }) => clsx(
              'group flex items-center rounded-xl py-2.5 text-sm font-bold transition-all',
              compact ? 'justify-center px-2' : 'gap-3 px-3',
              isActive
                ? 'bg-brand-900 text-white shadow-lg shadow-brand-900/15'
                : 'text-brand-600 hover:bg-brand-50 hover:text-brand-900',
            )}
          >
            <Icon size={18}/>
            {!compact && <><span className="flex-1">{label}</span><ChevronRight size={14} className="opacity-0 transition group-hover:opacity-50"/></>}
          </NavLink>
        ))}
      </nav>


    </aside>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [globalSearch, setGlobalSearch] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => { if (location.pathname === '/search') setGlobalSearch(new URLSearchParams(location.search).get('q') || ''); }, [location.pathname, location.search]);
  useEffect(() => { api.get('/notifications').then(r => setNotifications(r.data)).catch(() => {}); }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#fbf7f2]">
      <div className="no-print hidden lg:block"><Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)}/></div>
      {mobileOpen && <div className="no-print fixed inset-0 z-50 flex bg-brand-900/45 backdrop-blur-sm lg:hidden"><Sidebar collapsed={false} mobile onClose={() => setMobileOpen(false)}/><button className="flex-1" onClick={() => setMobileOpen(false)}/></div>}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="no-print relative z-30 flex h-[76px] items-center justify-between overflow-visible border-b border-brand-100 bg-white/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-xl p-2 text-brand-600 hover:bg-brand-50 lg:hidden"><Menu size={21}/></button>
            {collapsed && <button onClick={() => setCollapsed(false)} className="hidden rounded-xl p-2 text-brand-500 hover:bg-brand-50 lg:block"><Menu size={20}/></button>}
            <form onSubmit={event => { event.preventDefault(); if (globalSearch.trim()) navigate(`/search?q=${encodeURIComponent(globalSearch.trim())}`); }} className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-300" size={18}/>
              <input value={globalSearch} onChange={event => setGlobalSearch(event.target.value)} className="w-[360px] rounded-xl border border-brand-100 bg-brand-50/70 py-2.5 pl-10 pr-4 text-sm text-brand-900 outline-none transition focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-50" placeholder="Search across all records..."/>
            </form>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setNotificationOpen(value => !value)} className="relative rounded-xl border border-brand-100 bg-white p-2.5 text-brand-600 hover:bg-brand-50">
                <Bell size={19}/>{notifications.some(item => !item.isRead) && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cherry-500 ring-2 ring-white"/>}
              </button>
              {notificationOpen && createPortal(<>
                <button aria-label="Close notifications" className="fixed inset-0 z-[80] cursor-default bg-transparent" onClick={() => setNotificationOpen(false)} />
                <div className="fixed right-4 top-[72px] z-[90] w-[min(calc(100vw-2rem),390px)] overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-2xl sm:right-6">
                  <div className="border-b border-brand-100 px-4 py-3"><p className="font-extrabold text-brand-900">Notifications</p></div>
                  <div className="max-h-96 overflow-y-auto scrollbar-thin">
                    {notifications.length ? notifications.slice(0,8).map(item => <button key={item.id} onClick={async () => {
                      await api.patch(`/notifications/${item.id}/read`);
                      if (item.link) navigate(item.link);
                      setNotificationOpen(false);
                      setNotifications(value => value.map(row => row.id === item.id ? { ...row, isRead: true } : row));
                    }} className={clsx('block w-full border-b border-brand-50 px-4 py-3 text-left hover:bg-brand-50', !item.isRead && 'bg-honey-50/60')}>
                      <p className="text-sm font-extrabold text-brand-900">{item.title}</p>
                      <p className="mt-0.5 text-xs text-brand-500">{item.message}</p>
                      <p className="mt-1 text-[11px] text-brand-300">{dateTime(item.createdAt)}</p>
                    </button>) : <p className="p-6 text-center text-sm text-brand-400">No notifications.</p>}
                  </div>
                </div>
              </>, document.body)}
            </div>
            
            <div className="relative">
              <button onClick={() => setProfileOpen(value => !value)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cherry-500 text-sm font-black text-white transition hover:ring-4 hover:ring-cherry-100">
                {user?.name?.slice(0,1)}
              </button>
              {profileOpen && createPortal(<>
                <button aria-label="Close profile" className="fixed inset-0 z-[80] cursor-default bg-transparent" onClick={() => setProfileOpen(false)} />
                <div className="fixed right-4 top-[72px] z-[90] w-64 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-2xl sm:right-6">
                  <div className="border-b border-brand-100 px-4 py-3 bg-brand-50">
                    <p className="truncate text-sm font-extrabold text-brand-900">{user?.name}</p>
                    <p className="text-[11px] font-bold text-brand-400">{user?.role}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { setProfileOpen(false); navigate('/settings'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-brand-600 hover:bg-brand-50 hover:text-brand-900">
                      <Settings size={18} /> Settings
                    </button>
                    <button onClick={() => { setProfileOpen(false); logout(); navigate('/login'); }} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-cherry-600 hover:bg-cherry-50">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                </div>
              </>, document.body)}
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 scrollbar-thin sm:p-6 lg:p-8"><Outlet/></main>
      </div>
    </div>
  );
}
