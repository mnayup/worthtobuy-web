import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';

export type StatusModalType = 'success' | 'error' | 'warning' | 'info';

export interface StatusModalProps {
  open?: boolean;
  type?: StatusModalType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void | Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export function StatusModal({
  open = true,
  type = 'success',
  title,
  message,
  confirmText,
  cancelText,
  showCancel = false,
  onConfirm,
  onClose,
  loading = false,
}: StatusModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, loading]);

  if (!open) return null;

  const config = {
    success: {
      defaultTitle: 'Success',
      defaultConfirm: 'OK, Got it',
      icon: <CheckCircle2 size={36} strokeWidth={2.4} className="text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-200/80 shadow-emerald-500/15',
      btnClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/25',
    },
    error: {
      defaultTitle: 'Something Went Wrong',
      defaultConfirm: 'Dismiss',
      icon: <AlertCircle size={36} strokeWidth={2.4} className="text-rose-600" />,
      iconBg: 'bg-rose-50 border-rose-200/80 shadow-rose-500/15',
      btnClass: 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-rose-600/25',
    },
    warning: {
      defaultTitle: 'Warning',
      defaultConfirm: 'Proceed',
      icon: <AlertTriangle size={36} strokeWidth={2.4} className="text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-200/80 shadow-amber-500/15',
      btnClass: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-amber-600/25',
    },
    info: {
      defaultTitle: 'Information',
      defaultConfirm: 'Close',
      icon: <Info size={36} strokeWidth={2.4} className="text-blue-600" />,
      iconBg: 'bg-blue-50 border-blue-200/80 shadow-blue-500/15',
      btnClass: 'bg-brand-900 hover:bg-brand-800 text-white shadow-brand-900/25',
    },
  }[type] || {
    defaultTitle: 'Notice',
    defaultConfirm: 'OK',
    icon: <Info size={36} strokeWidth={2.4} className="text-brand-600" />,
    iconBg: 'bg-brand-50 border-brand-200 shadow-brand-500/15',
    btnClass: 'bg-brand-900 hover:bg-brand-800 text-white',
  };

  const displayTitle = title || config.defaultTitle;
  const displayConfirmText = confirmText || config.defaultConfirm;

  async function handleConfirm() {
    if (loading) return;
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-brand-950/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      <div className="relative w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white p-6 sm:p-8 shadow-2xl border border-brand-100 transition-all text-center animate-rise">
        {!loading && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 rounded-xl p-2 text-brand-400 hover:bg-brand-50 hover:text-brand-700 transition"
          >
            <X size={18} />
          </button>
        )}

        <div
          className={`mx-auto flex h-18 w-18 items-center justify-center rounded-2xl border shadow-lg transition-transform duration-300 ${config.iconBg}`}
        >
          {config.icon}
        </div>

        <h3 className="mt-5 text-xl font-black tracking-tight text-brand-900 sm:text-2xl">
          {displayTitle}
        </h3>

        <div className="mt-3 max-h-56 overflow-y-auto scrollbar-thin px-1 text-sm font-medium leading-relaxed text-brand-600 whitespace-pre-wrap break-words">
          {message}
        </div>

        {showCancel || onConfirm ? (
          <div className="mt-7 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary flex-1 py-3 text-sm font-bold rounded-xl"
            >
              {cancelText || 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`btn flex-1 py-3 text-sm font-bold rounded-xl shadow-lg ${config.btnClass}`}
            >
              {loading && <Loader2 size={16} className="animate-spin mr-1" />}
              {displayConfirmText}
            </button>
          </div>
        ) : (
          <div className="mt-7">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`btn w-full py-3.5 text-sm font-bold rounded-xl shadow-lg transition-all ${config.btnClass}`}
            >
              {loading && <Loader2 size={16} className="animate-spin mr-1" />}
              {displayConfirmText}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
