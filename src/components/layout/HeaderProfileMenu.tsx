import { LogOut, UserCog } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '~/context/AuthContext';

export function HeaderProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((val) => !val)}
        className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-rose-500 to-rose-600 text-sm font-black text-white shadow-xs hover:shadow-md transition focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
        title="Profile & Settings"
      >
        {user?.name?.slice(0, 1).toUpperCase()}
      </button>

      {open &&
        createPortal(
          <>
            <button
              aria-label="Close profile menu"
              className="fixed inset-0 z-[80] cursor-default bg-transparent"
              onClick={() => setOpen(false)}
            />
            <div className="fixed right-4 top-[72px] z-[90] w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-6 animate-rise">
              <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                <p className="truncate text-sm font-extrabold text-slate-900">
                  {user?.name}
                </p>
                <p className="truncate text-[10px] font-mono text-slate-500">
                  @{user?.username || 'user'}
                </p>
              </div>
              <div className="p-1">
                <NavLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  <UserCog size={16} />
                  Profile Settings
                </NavLink>
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
