import { Link } from 'react-router-dom';
import { Boxes, ChevronRight, MessageCircle } from 'lucide-react';
import { money } from '~/lib/format';
import { buildWhatsAppUrl } from '~/lib/whatsapp';

interface HomeReadyStockSectionProps {
  products: any[];
  onSelectProduct?: (prod: any) => void;
  brandWhatsApp?: string;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

export function HomeReadyStockSection({
  products,
  onSelectProduct,
  brandWhatsApp,
}: HomeReadyStockSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        className={
          'flex flex-col sm:flex-row sm:items-end justify-between gap-4 ' +
          'border-b border-slate-200/80 pb-6'
        }
      >
        <div>
          <div
            className={
              'flex items-center gap-2 text-amber-600 font-extrabold ' +
              'text-xs uppercase tracking-wider'
            }
          >
            <Boxes size={14} />
            <span>Warehouse Inventory</span>
          </div>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Ready Stock Siap Kirim Hari Ini
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Barang sudah ready di warehouse kami. Bisa instant atau kirim ekspedisi ke
            seluruh Indonesia tanpa menunggu event!
          </p>
        </div>

        <Link
          to="/ready-stock"
          className={
            'inline-flex items-center gap-1.5 text-sm font-extrabold ' +
            'text-amber-600 hover:text-amber-700 transition'
          }
        >
          <span>Lihat Semua Ready Stock</span>
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((prod) => {
          const sellingPrice = prod.selling_price ?? prod.sellingPrice ?? 0;
          const rawImgs = prod.image_urls || prod.imageUrls;
          const images =
            Array.isArray(rawImgs) && rawImgs.length > 0
              ? rawImgs
              : prod.image_url || prod.imageUrl
              ? [prod.image_url || prod.imageUrl]
              : [];
          const imageUrl = images[0] || prod.image_url || prod.imageUrl || FALLBACK_IMAGE;
          const brandName = prod.brand_name ?? prod.brandName;
          const stockQuantity = prod.stock_quantity ?? prod.stockQuantity ?? 0;
          const variant = prod.variant ?? prod.variation;
          const size = prod.size;

          const waProductUrl = buildWhatsAppUrl(
            `Halo Admin Worthtobuy, saya mau beli Ready Stock *${prod.name}* ` +
              (variant ? `(Variant: ${variant}) ` : '') +
              (size ? `(Size: ${size}) ` : '') +
              `(SKU: ${prod.sku}) seharga ${money(sellingPrice)}. Apakah masih tersedia?`,
            brandWhatsApp
          );

          return (
            <div
              key={prod.id}
              className={
                'group flex flex-col justify-between overflow-hidden rounded-3xl ' +
                'border border-slate-200 bg-white shadow-sm transition-all ' +
                'duration-200 hover:-translate-y-1 hover:border-amber-200 ' +
                'hover:shadow-xl hover:shadow-amber-950/5'
              }
            >
              <div>
                <div
                  onClick={() => onSelectProduct?.(prod)}
                  className={`relative aspect-square w-full overflow-hidden bg-slate-100 ${
                    onSelectProduct ? 'cursor-pointer' : ''
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={prod.name}
                    className={
                      'h-full w-full object-cover transition-transform ' +
                      'duration-300 group-hover:scale-105'
                    }
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                    <span
                      className={
                        'rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] ' +
                        'font-black uppercase text-white backdrop-blur-md'
                      }
                    >
                      {brandName || 'Brand'}
                    </span>
                    {variant && (
                      <span className="rounded-full bg-brand-900/75 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                        {variant}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={
                        'rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] ' +
                        'font-black uppercase text-white shadow-sm'
                      }
                    >
                      Ready {stockQuantity} pcs
                    </span>
                  </div>

                  {images.length > 1 && (
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="rounded-full bg-slate-900/70 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                        +{images.length - 1} photos
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">
                    {prod.category || 'General'}
                  </p>
                  <h3
                    onClick={() => onSelectProduct?.(prod)}
                    className={`mt-1 font-extrabold text-slate-900 line-clamp-2 text-sm leading-snug group-hover:text-amber-600 transition ${
                      onSelectProduct ? 'cursor-pointer' : ''
                    }`}
                  >
                    {prod.name}
                  </h3>
                  <p className="mt-3 text-lg font-black text-rose-600">
                    {money(sellingPrice)}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <a
                  href={waProductUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    'flex w-full items-center justify-center gap-2 rounded-xl ' +
                    'bg-slate-900 py-3 text-xs font-black text-white transition ' +
                    'hover:bg-emerald-600 active:scale-95 shadow-sm'
                  }
                >
                  <MessageCircle size={15} />
                  <span>Order via WA</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
