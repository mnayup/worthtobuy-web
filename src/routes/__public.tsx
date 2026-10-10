import { Outlet, useLocation } from 'react-router-dom';
import { PublicNavbar } from '~/components/public/PublicNavbar';
import { PublicFooter } from '~/components/public/PublicFooter';
import { FloatingWhatsApp } from '~/components/public/FloatingWhatsApp';
import { useEffect } from 'react';

export default function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60 text-slate-900 selection:bg-rose-200 selection:text-rose-900 font-sans">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <FloatingWhatsApp />
      <PublicFooter />
    </div>
  );
}
