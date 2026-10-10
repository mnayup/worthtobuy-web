import { MessageCircle, X } from 'lucide-react';
import { money } from '~/lib/format';

interface ReadyStockDetailModalProps {
  product: any;
  onClose: () => void;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

export function ReadyStockDetailModal({ product, onClose }: ReadyStockDetailModalProps) {
  const sellingPrice = product.selling_price ?? product.sellingPrice;
  const imageUrl = product.image_url ?? product.imageUrl;
  const brandName = product.brand_name ?? product.brandName;
  const stockQuantity = product.stock_quantity ?? product.stockQuantity;

  const waUrl =
    'https://wa.me/6281234567890?text=' +
    encodeURIComponent(
      `Halo Admin Worthtobuy, saya mau beli Ready Stock: *${product.name}* ` +
        `(SKU: ${product.sku}) seharga ${money(sellingPrice)}.`
    );

  return (
    <div
      className={
        'fixed inset-0 z-50 flex items-center justify-center p-4 ' +
        'bg-slate-950/60 backdrop-blur-sm animate-fade-in'
      }
    >
      <div
        className={
          'relative w-full max-w-2xl overflow-hidden rounded-3xl ' +
          'bg-white shadow-2xl animate-rise'
        }
      >
        <button
          onClick={onClose}
          className={
            'absolute top-4 right-4 z-10 flex h-9 w-9 items-center ' +
            'justify-center rounded-full bg-white/80 text-slate-600 ' +
            'backdrop-blur shadow-sm hover:bg-white hover:text-slate-900'
          }
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="relative aspect-square sm:aspect-auto w-full bg-slate-100">
            <img
              src={imageUrl || FALLBACK_IMAGE}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    'rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] ' +
                    'font-black uppercase text-amber-700 border border-amber-200'
                  }
                >
                  {product.category || 'General'}
                </span>
                <span
                  className={
                    'rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] ' +
                    'font-bold text-slate-700'
                  }
                >
                  {brandName || 'Brand'}
                </span>
              </div>

              <h3 className="mt-3 text-xl font-black text-slate-900 leading-snug">
                {product.name}
              </h3>

              <p className="mt-3 text-2xl font-black text-rose-600">
                {money(sellingPrice)}
              </p>

              <div
                className={
                  'mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-xs ' +
                  'text-slate-600 border border-slate-100'
                }
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status Stok:</span>
                  <span className="font-bold text-emerald-600">
                    Ready {stockQuantity} pcs
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">SKU Code:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {product.sku}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Lokasi Dispatch:</span>
                  <span className="font-bold text-slate-800">
                    Central HQ Warehouse
                  </span>
                </div>
              </div>

              {product.notes && (
                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Deskripsi / Spesifikasi:
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {product.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  'flex w-full items-center justify-center gap-2 rounded-xl ' +
                  'bg-emerald-600 py-3 text-xs font-black text-white ' +
                  'shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition'
                }
              >
                <MessageCircle size={16} />
                <span>Pesan Langsung via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
