import React, { useMemo, useState } from 'react';
import {
  Layers,
  X,
  Filter,
  Download,
} from 'lucide-react';
import { exportToExcel } from '~/lib/excel';
import type { Purchase } from '../types';

interface PurchaseSummaryModalProps {
  open: boolean;
  purchase: Purchase | null;
  onClose: () => void;
}

interface SummaryRow {
  key: string;
  productId?: number | null;
  productName: string;
  variant: string;
  size: string;
  qty: number;
}

export function PurchaseSummaryModal({
  open,
  purchase,
  onClose,
}: PurchaseSummaryModalProps) {
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('ALL');

  // Consolidated rows grouped by Product, Variant, Size
  const allSummaryRows = useMemo<SummaryRow[]>(() => {
    if (!purchase || !purchase.items || purchase.items.length === 0) return [];

    const map = new Map<string, SummaryRow>();

    for (const it of purchase.items) {
      const prodName = (it.product_name || 'Unnamed Product').trim();
      // If variation is present use it, otherwise fall back to color or 'Default'
      const variantLabel = (it.variation?.trim() || it.color?.trim() || 'Default');
      const sizeLabel = (it.size?.trim() || '-');

      // Group key using normalized (lowercase trimmed) product name/id, variant, and size
      // Matching by normalized product name ensures that whether product_id is set or null,
      // identical products with matching variant and size merge together across customers & orders
      const normProd = prodName.toLowerCase();
      const normVariant = variantLabel.toLowerCase();
      const normSize = sizeLabel.toLowerCase();
      const rowKey = `${normProd}__${normVariant}__${normSize}`;

      const existing = map.get(rowKey);
      const qty = Number(it.quantity || 1);

      if (existing) {
        existing.qty += qty;
      } else {
        map.set(rowKey, {
          key: rowKey,
          productId: it.product_id,
          productName: prodName,
          variant: variantLabel,
          size: sizeLabel,
          qty,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const cmpProd = a.productName.localeCompare(b.productName);
      if (cmpProd !== 0) return cmpProd;
      const cmpVar = a.variant.localeCompare(b.variant);
      if (cmpVar !== 0) return cmpVar;
      return a.size.localeCompare(b.size);
    });
  }, [purchase]);

  // Unique product options for the filter dropdown
  const productFilterOptions = useMemo(() => {
    const prodMap = new Map<string, { key: string; name: string; count: number }>();
    for (const row of allSummaryRows) {
      const pKey = String(row.productId || row.productName);
      const existing = prodMap.get(pKey);
      if (existing) {
        existing.count += row.qty;
      } else {
        prodMap.set(pKey, {
          key: pKey,
          name: row.productName,
          count: row.qty,
        });
      }
    }
    return Array.from(prodMap.values());
  }, [allSummaryRows]);

  // Filtered rows based on selected product
  const displayedRows = useMemo(() => {
    if (selectedProductFilter === 'ALL') return allSummaryRows;
    return allSummaryRows.filter(
      (r) => String(r.productId || r.productName) === selectedProductFilter
    );
  }, [allSummaryRows, selectedProductFilter]);

  const totalQty = useMemo(() => {
    return displayedRows.reduce((sum, r) => sum + r.qty, 0);
  }, [displayedRows]);

  // Export to Excel strictly matching Product, Variant, Size, Qty
  const handleExportExcel = () => {
    if (!purchase || displayedRows.length === 0) return;

    const purchaseNum = purchase.purchase_number || purchase.purchaseNumber || 'purchase';
    const filename = `purchase-summary-${purchaseNum}-${new Date().toISOString().slice(0, 10)}`;

    const headers = ['Product', 'Variant', 'Size', 'Qty'];
    const rows: (string | number)[][] = displayedRows.map((r) => [
      r.productName,
      r.variant,
      r.size,
      r.qty,
    ]);

    // Grand total row
    rows.push(['Total', '', '', totalQty]);

    exportToExcel(filename, 'Summary List', headers, rows);
  };

  if (!open || !purchase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-brand-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-brand-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
              <Layers size={20} className="text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-brand-900 text-lg leading-tight">
                  Purchase Summary List
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-brand-100 text-brand-700">
                  {purchase.purchase_number || purchase.purchaseNumber}
                </span>
              </div>
              <p className="text-xs text-brand-400 mt-0.5">
                Summary of items grouped by product, variant, and size.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-brand-400 hover:text-brand-700 hover:bg-brand-100/70 rounded-xl transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter & Action Toolbar */}
        <div className="px-6 py-3.5 border-b border-brand-100 bg-brand-50/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Filter size={15} className="text-brand-500 shrink-0" />
            <span className="text-xs font-bold text-brand-700 shrink-0">Filter Product:</span>
            <select
              value={selectedProductFilter}
              onChange={(e) => setSelectedProductFilter(e.target.value)}
              className="text-xs font-semibold bg-white border border-brand-200 rounded-xl px-3 py-1.5 text-brand-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 flex-1 max-w-sm shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Products ({productFilterOptions.length})</option>
              {productFilterOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.name} ({opt.count} pcs)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              Total: <strong className="font-black">{totalQty}</strong> pcs
            </span>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
              title="Export to Excel (.xlsx)"
            >
              <Download size={14} />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Content Body: Clean Table */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
          <div className="rounded-2xl border border-brand-200/80 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-brand-600 font-bold border-b border-brand-100 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Variant</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100/60 font-medium text-brand-800">
                  {displayedRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-brand-400">
                        No items found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map((row) => (
                      <tr key={row.key} className="hover:bg-brand-50/40 transition">
                        <td className="py-3 px-4">
                          <span className="font-bold text-brand-900">{row.productName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-brand-700">{row.variant}</span>
                        </td>
                        <td className="py-3 px-4">
                          {row.size !== '-' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[11px]">
                              {row.size}
                            </span>
                          ) : (
                            <span className="text-brand-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-black text-sm text-brand-900">
                            {row.qty}{' '}
                            <span className="text-[11px] font-semibold text-brand-400">pcs</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {displayedRows.length > 0 && (
                  <tfoot className="bg-slate-50/80 border-t border-brand-200 font-bold text-xs">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-brand-700 font-bold text-right">
                        Total
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-black text-sm text-indigo-700">
                          {totalQty}{' '}
                          <span className="text-[11px] font-semibold text-indigo-500">pcs</span>
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs text-brand-400 font-medium">
            Total {totalQty} pcs across {displayedRows.length} item line(s)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

