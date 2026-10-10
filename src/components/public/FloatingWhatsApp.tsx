import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export function FloatingWhatsApp() {
  const [openTooltip, setOpenTooltip] = useState(true);

  const waNumber = '6281234567890';
  const defaultMessage = encodeURIComponent(
    'Halo Admin Worthtobuy! Saya ingin bertanya mengenai jasa titip pameran / order ready stock.'
  );
  const waUrl = `https://wa.me/${waNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
      {openTooltip && (
        <div className="relative flex items-center gap-2 rounded-2xl border border-rose-100 bg-white/95 px-4 py-2.5 shadow-xl shadow-rose-950/10 backdrop-blur-md transition-all animate-rise">
          <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <p className="text-xs font-bold text-slate-800">
            Ada pertanyaan jastip? <span className="text-rose-600 font-extrabold">Chat Admin WA</span>
          </p>
          <button
            onClick={() => setOpenTooltip(false)}
            className="ml-1 text-slate-400 hover:text-slate-600"
            title="Tutup"
          >
            <X size={14} />
          </button>
          <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-rose-100 bg-white" />
        </div>
      )}

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-600/30 transition-transform duration-200 hover:scale-110 active:scale-95"
        title="Chat WhatsApp Admin"
      >
        <MessageCircle size={30} className="fill-white/20" />
      </a>
    </div>
  );
}
