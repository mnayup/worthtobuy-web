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
    try {
      await api.patch(`/notifications/${item.id}/read`);
    } catch {
      // ignore
    }
    if (item.link) navigate(item.link);
    setOpen(false);
    setNotifications((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, is_read: true, isRead: true } : row
      )
    );
  };

  const handleReadAll = async () => {
    try {
      await api.patch('/notifications/read-all');
    } catch {
      // ignore
    }
    setNotifications((prev) =>
      prev.map((row) => ({ ...row, is_read: true, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(
    (item) => !(item.is_read ?? item.isRead)
  ).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((val) => !val)}
        className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
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
              <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-brand-900">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleReadAll}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto scrollbar-thin divide-y divide-brand-50">
                {notifications.length ? (
                  notifications.map((item) => {
                    const isRead = Boolean(item.is_read ?? item.isRead);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleRead(item)}
                        className={clsx(
                          'block w-full px-4 py-3 text-left transition hover:bg-brand-50/80',
                          !isRead && 'bg-rose-50/60'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-extrabold text-brand-900">
                            {item.title}
                          </p>
                          {!isRead && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-brand-600">
                          {item.message}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-brand-400">
                          {dateTime(item.created_at ?? item.createdAt)}
                        </p>
                      </button>
                    );
                  })
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
