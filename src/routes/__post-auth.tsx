import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { HeaderNotifications } from '~/components/layout/HeaderNotifications';
import { HeaderProfileMenu } from '~/components/layout/HeaderProfileMenu';
import { HeaderSearch } from '~/components/layout/HeaderSearch';
import { Sidebar } from '~/components/layout/Sidebar';
import { useAuth } from '~/context/AuthContext';

export {
  navGroups,
  navItems,
  type NavGroupConfig,
  type NavItemConfig,
  type NavSubItem,
} from '~/components/layout/nav-config';

export default function PostAuthLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <div className="no-print hidden lg:block">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
        />
      </div>

      {mobileOpen && (
        <div className="no-print fixed inset-0 z-50 flex bg-brand-950/40 backdrop-blur-sm lg:hidden">
          <Sidebar
            collapsed={false}
            mobile
            onClose={() => setMobileOpen(false)}
          />
          <button className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="no-print relative z-30 flex h-[72px] items-center justify-between overflow-visible border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:block"
                title="Expand sidebar"
              >
                <Menu size={20} />
              </button>
            )}
            <HeaderSearch />
          </div>

          <div className="flex items-center gap-2.5">
            <HeaderNotifications />
            <HeaderProfileMenu />
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 scrollbar-thin sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
