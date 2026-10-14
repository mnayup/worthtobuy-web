import { MessageCircle } from 'lucide-react';
import { money } from '~/lib/format';
import { buildWhatsAppUrl } from '~/lib/whatsapp';

interface ReadyStockCardProps {
  prod: any;
  onSelectProduct: (prod: any) => void;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

export function ReadyStockCard({ prod, onSelectProduct }: ReadyStockCardProps) {
  const sellingPrice = prod.selling_price ?? prod.sellingPrice;
  const rawImgs = prod.image_urls || prod.imageUrls;
  const images = Array.isArray(rawImgs) && rawImgs.length > 0
    ? rawImgs
    : prod.image_url || prod.imageUrl
    ? [prod.image_url || prod.imageUrl]
    : [];
  const imageUrl = images[0] || prod.image_url || prod.imageUrl;
  const brandName = prod.brand_name ?? prod.brandName;
  const stockQuantity = prod.stock_quantity ?? prod.stockQuantity;
  const variant = prod.variant ?? prod.variation;
  const size = prod.size;

  const waUrl = buildWhatsAppUrl(
    `Halo Admin Worthtobuy, saya mau pesan Ready Stock: *${prod.name}* ` +
      (variant ? `(Variant: ${variant}) ` : '') +
      (size ? `(Size: ${size}) ` : '') +
      `(SKU: ${prod.sku}) seharga ${money(sellingPrice)}. Apakah masih tersedia?`
  );

  return (
    <div
      className={
        'group flex flex-col justify-between overflow-hidden rounded-3xl ' +
        'border border-slate-200 bg-white shadow-sm transition-all duration-200 ' +
        'hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl ' +
        'hover:shadow-amber-950/5'
      }
    >
      <div>
        <div
          onClick={() => onSelectProduct(prod)}
          className="relative aspect-square w-full overflow-hidden bg-slate-100 cursor-pointer"
        >
          <img
            src={imageUrl || FALLBACK_IMAGE}
            alt={prod.name}
            className={
              'h-full w-full object-cover transition-transform ' +
              'duration-300 group-hover:scale-105'
            }
            loading="lazy"
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
              <span
                className={
                  'rounded-full bg-brand-900/75 px-2 py-0.5 text-[9px] ' +
                  'font-bold text-white backdrop-blur-xs'
                }
              >
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
              <span
                className={
                  'rounded-full bg-slate-900/70 px-2 py-0.5 text-[9px] ' +
                  'font-bold text-white backdrop-blur-xs'
                }
              >
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
            onClick={() => onSelectProduct(prod)}
            className={
              'mt-1 font-extrabold text-slate-900 line-clamp-2 text-sm ' +
              'leading-snug cursor-pointer group-hover:text-amber-600 transition'
            }
          >
            {prod.name}
          </h3>
          {size && (
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Size: <span className="text-slate-800 font-bold">{size}</span>
            </p>
          )}
          <p className="mt-3 text-lg font-black text-rose-600">
            {money(sellingPrice)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-medium line-clamp-1">
            SKU: {prod.sku}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0 space-y-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            'flex w-full items-center justify-center gap-2 rounded-xl ' +
            'bg-slate-900 py-3 text-xs font-black text-white transition ' +
            'hover:bg-emerald-600 active:scale-95 shadow-sm'
          }
        >
          <MessageCircle size={15} />
          <span>Pesan via WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={() => onSelectProduct(prod)}
          className={
            'w-full text-center text-[11px] font-bold text-slate-500 ' +
            'hover:text-slate-800 py-1 transition cursor-pointer'
          }
        >
          Lihat Spesifikasi
        </button>
      </div>
    </div>
  );
}
