import { Search } from 'lucide-react';

interface ReadyStockFilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function ReadyStockFilterBar({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: ReadyStockFilterBarProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
      <div
        className={
          'flex flex-col md:flex-row items-stretch md:items-center ' +
          'justify-between gap-4 rounded-2xl border border-slate-200 ' +
          'bg-white p-3 shadow-xs'
        }
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari produk, merk (Mothercare, Pigeon, Stanley, Smiggle)..."
            className={
              'w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 ' +
              'pl-9 pr-4 text-xs text-slate-900 outline-none transition ' +
              'focus:border-amber-400 focus:bg-white focus:ring-2 ' +
              'focus:ring-amber-500/10 placeholder:text-slate-400 font-medium'
            }
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-400 hidden sm:inline">
            Urutkan:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className={
              'rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs ' +
              'font-bold text-slate-700 outline-none cursor-pointer hover:border-slate-300'
            }
          >
            <option value="newest">Terbaru</option>
            <option value="price_asc">Harga: Terendah ke Tertinggi</option>
            <option value="price_desc">Harga: Tertinggi ke Terendah</option>
            <option value="name_asc">Nama A-Z</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => onCategoryChange('ALL')}
          className={
            'rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer shrink-0 ' +
            (selectedCategory === 'ALL'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50')
          }
        >
          Semua Kategori
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={
              'rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer shrink-0 ' +
              (selectedCategory === cat
                ? 'bg-amber-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50')
            }
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
