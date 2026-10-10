import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

export function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel, loading]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-brand-950/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => {
          if (!loading) onCancel();
        }}
      />
      <div className="relative w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white p-6 sm:p-8 shadow-2xl border border-brand-100 text-center animate-rise">
        {!loading && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="absolute top-4 right-4 rounded-xl p-2 text-brand-400 hover:bg-brand-50 hover:text-brand-700 transition"
          >
            <X size={18} />
          </button>
        )}
        <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 shadow-lg shadow-amber-500/10">
          <AlertTriangle size={34} strokeWidth={2.4} />
        </div>
        <h3 className="mt-5 text-xl font-black tracking-tight text-brand-900 sm:text-2xl">{title}</h3>
        <p className="mt-3 text-sm font-medium leading-relaxed text-brand-600 max-h-48 overflow-y-auto scrollbar-thin px-1">
          {message}
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary flex-1 py-3 text-sm font-bold rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn flex-1 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-lg shadow-rose-600/25"
          >
            {loading && <Loader2 size={16} className="animate-spin mr-1" />}
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
