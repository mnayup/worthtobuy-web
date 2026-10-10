import { Boxes } from 'lucide-react';
import { ReadyStockBanner } from './components/ready-stock-banner';
import { ReadyStockCard } from './components/ready-stock-card';
import { ReadyStockDetailModal } from './components/ready-stock-detail-modal';
import { ReadyStockFilterBar } from './components/ready-stock-filter-bar';
import { usePublicReadyStock } from './hooks/use-public-ready-stock';

export default function PublicReadyStockRoute() {
  const {
    categories,
    loading,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    selectedProduct,
    setSelectedProduct,
    filteredProducts,
  } = usePublicReadyStock();

  return (
    <div className="space-y-12 py-10">
      <ReadyStockBanner />

      <ReadyStockFilterBar
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-96 rounded-3xl bg-slate-100 animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            className={
              'rounded-3xl border border-dashed border-slate-300 ' +
              'p-12 text-center bg-white'
            }
          >
            <Boxes size={40} className="mx-auto text-slate-400" />
            <p className="mt-3 text-base font-bold text-slate-800">
              Tidak ada produk ready stock yang cocok
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Coba cari dengan kata kunci lain atau pilih kategori berbeda.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('ALL');
              }}
              className={
                'mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 ' +
                'px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer'
              }
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => (
              <ReadyStockCard
                key={prod.id}
                prod={prod}
                onSelectProduct={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ReadyStockDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
