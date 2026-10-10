import { Bell } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '~/context/AuthContext';
import { api } from '~/lib/api';
import { dateTime } from '~/lib/format';

export function HeaderNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api
        .get('/notifications')
        .then((r) => setNotifications(r.data))
        .catch(() => {});
    }
  }, [user]);

  const handleRead = async (item: any) => {
    await api.patch(`/notifications/${item.id}/read`);
    if (item.link) navigate(item.link);
    setOpen(false);
    setNotifications((prev) =>
      prev.map((row) => (row.id === item.id ? { ...row, isRead: true } : row))
    );
  };

  const hasUnread = notifications.some((item) => !item.isRead);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((val) => !val)}
        className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition"
        title="Notifications"
      >
        <Bell size={18} />
        {hasUnread && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        )}
      </button>

      {open &&
        createPortal(
          <>
            <button
              aria-label="Close notifications"
              className="fixed inset-0 z-[80] cursor-default bg-transparent"
              onClick={() => setOpen(false)}
            />
            <div className="fixed right-4 top-[72px] z-[90] w-[min(calc(100vw-2rem),390px)] overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-2xl sm:right-6 animate-rise">
              <div className="border-b border-brand-100 bg-brand-50/60 px-4 py-3">
                <p className="font-extrabold text-brand-900">Notifications</p>
              </div>
              <div className="max-h-96 overflow-y-auto scrollbar-thin">
                {notifications.length ? (
                  notifications.slice(0, 8).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleRead(item)}
                      className={clsx(
                        'block w-full border-b border-brand-50 px-4 py-3 text-left transition hover:bg-brand-50',
                        !item.isRead && 'bg-rose-50/50'
                      )}
                    >
                      <p className="text-sm font-extrabold text-brand-900">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-brand-600">
                        {item.message}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-brand-400">
                        {dateTime(item.createdAt)}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="p-6 text-center text-sm text-brand-400">
                    No notifications available.
                  </p>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
