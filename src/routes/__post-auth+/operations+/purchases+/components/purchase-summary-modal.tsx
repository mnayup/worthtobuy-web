import React, { useMemo, useState, useEffect } from 'react';
import {
  Layers,
  X,
  Filter,
  Download,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { exportToExcel } from '~/lib/excel';
import { api } from '~/lib/api';
import type { Purchase, BulkSortingLine } from '../types';
import { buildInitialSortingLines } from '../helpers/purchase-modal.helper';

interface PurchaseSummaryModalProps {
  open: boolean;
  purchase: Purchase | null;
  onClose: () => void;
  onProceedToAssignment?: (sortingLines: BulkSortingLine[]) => void;
}

export function PurchaseSummaryModal({
  open,
  purchase,
  onClose,
  onProceedToAssignment,
}: PurchaseSummaryModalProps) {
  const hasAssignedCustomerItems = (purchase?.items || []).some(
    (it) => it.status === 'PURCHASED' || it.status === 'UNAVAILABLE'
  );
  const isEditable =
    purchase?.status === 'WAITING_PURCHASE' ||
    (purchase?.status === 'SORTING' && !hasAssignedCustomerItems);
  const isReadOnly = !isEditable;

  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('ALL');
  const [sortingLines, setSortingLines] = useState<BulkSortingLine[]>([]);
  const [isAddingLine, setIsAddingLine] = useState(false);
  const [newSelectedProduct, setNewSelectedProduct] = useState<string>('');
  const [newVariant, setNewVariant] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newActualQty, setNewActualQty] = useState<number>(1);
  const [newUnitPrice, setNewUnitPrice] = useState<number>(0);

  // Initialize sorting lines from saved sortingLines or purchase items
  useEffect(() => {
    if (!open || !purchase) return;
    const savedLines = purchase.sortingLines || purchase.sorting_lines;
    const initial =
      Array.isArray(savedLines) && savedLines.length > 0
        ? savedLines
        : buildInitialSortingLines(purchase.items || []);
    setSortingLines(initial);
    setIsAddingLine(false);

    api
      .get(`/purchases/${purchase.id}`)
      .then((res) => {
        if (res.data) {
          const freshSaved = res.data.sortingLines || res.data.sorting_lines;
          if (Array.isArray(freshSaved) && freshSaved.length > 0) {
            setSortingLines(freshSaved);
          } else if (!Array.isArray(savedLines) || savedLines.length === 0) {
            setSortingLines(buildInitialSortingLines(res.data.items || []));
          }
        }
      })
      .catch(() => {});
  }, [open, purchase]);

  // Unique product options for the filter dropdown & adding new variant
  const productOptions = useMemo(() => {
    const prodMap = new Map<string, { id: number | null; name: string; brand?: string; basePrice: number }>();
    for (const it of purchase?.items || []) {
      const pId = it.product_id || null;
      const pName = (it.product_name || 'Unnamed Product').trim();
      const pKey = String(pId || pName);
      if (!prodMap.has(pKey)) {
        prodMap.set(pKey, {
          id: pId,
          name: pName,
          brand: it.brand_name,
          basePrice: Number(it.actual_price || it.estimated_price || 0) / (it.quantity || 1),
        });
      }
    }
    return Array.from(prodMap.values());
  }, [purchase]);

  // Filtered rows based on selected product
  const displayedLines = useMemo(() => {
    if (selectedProductFilter === 'ALL') return sortingLines;
    return sortingLines.filter(
      (r) => String(r.productId || r.productName) === selectedProductFilter
    );
  }, [sortingLines, selectedProductFilter]);

  const totalPlannedQty = useMemo(() => {
    return displayedLines.reduce((sum, r) => sum + Number(r.plannedQty || 0), 0);
  }, [displayedLines]);

  const totalActualQty = useMemo(() => {
    return displayedLines.reduce((sum, r) => sum + Number(r.actualQty || 0), 0);
  }, [displayedLines]);

  const handleUpdateLine = (key: string, patch: Partial<BulkSortingLine>) => {
    setSortingLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line))
    );
  };

  const handleRemoveLine = (key: string) => {
    setSortingLines((prev) => prev.filter((line) => line.key !== key));
  };

  const handleAddLine = () => {
    if (!newSelectedProduct) return;
    const prod = productOptions.find((p) => String(p.id || p.name) === newSelectedProduct);
    if (!prod) return;

    const vLabel = newVariant.trim() || 'Default';
    const sLabel = newSize.trim() || '-';
    const normProd = prod.name.toLowerCase();
    const normVar = vLabel.toLowerCase();
    const normSize = sLabel.toLowerCase();
    const key = `${normProd}__${normVar}__${normSize}`;

    // If already exists, increment qty
    const existingIndex = sortingLines.findIndex((l) => l.key === key);
    if (existingIndex >= 0) {
      setSortingLines((prev) =>
        prev.map((l, i) =>
          i === existingIndex
            ? { ...l, actualQty: l.actualQty + Math.max(1, newActualQty) }
            : l
        )
      );
    } else {
      setSortingLines((prev) => [
        ...prev,
        {
          key,
          productId: prod.id,
          productName: prod.name,
          brandName: prod.brand,
          variant: vLabel,
          size: sLabel,
          plannedQty: 0, // Additional variant not planned initially
          actualQty: Math.max(1, newActualQty),
          unitPrice: newUnitPrice > 0 ? newUnitPrice : prod.basePrice,
          isAdditional: true,
        },
      ]);
    }

    setNewVariant('');
    setNewSize('');
    setNewActualQty(1);
    setNewUnitPrice(0);
    setIsAddingLine(false);
  };

  // Export to Excel strictly matching Product, Variant, Size, Planned Qty, Actual Got Qty
  const handleExportExcel = () => {
    if (!purchase || displayedLines.length === 0) return;

    const purchaseNum = purchase.purchase_number || purchase.purchaseNumber || 'purchase';
    const filename = `purchase-sorting-${purchaseNum}-${new Date().toISOString().slice(0, 10)}`;

    const headers = ['Product', 'Variant', 'Size', 'Plan Qty', 'Real Got Qty', 'Diff (Got - Plan)'];
    const rows: (string | number)[][] = displayedLines.map((r) => [
      r.productName,
      r.variant,
      r.size,
      r.plannedQty,
      r.actualQty,
      r.actualQty - r.plannedQty,
    ]);

    // Grand total row
    rows.push(['Total', '', '', totalPlannedQty, totalActualQty, totalActualQty - totalPlannedQty]);

    exportToExcel(filename, 'Sorting Summary', headers, rows);
  };

  if (!open || !purchase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-brand-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-brand-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
              <Layers size={20} className="text-indigo-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black text-brand-900 text-lg leading-tight">
                  Purchase Sorting & Summary List
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-brand-100 text-brand-700">
                  {purchase.purchase_number || purchase.purchaseNumber}
                </span>
                {isReadOnly ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    View Only (Assigned to Customer)
                  </span>
                ) : purchase.status === 'SORTING' ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                    Sorting / Editable (Unassigned)
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-brand-400 mt-0.5">
                Compare initial purchase plan with real physical items brought to warehouse, and add extra variants/sizes.
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
              <option value="ALL">All Products ({productOptions.length})</option>
              {productOptions.map((opt) => (
                <option key={String(opt.id || opt.name)} value={String(opt.id || opt.name)}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-slate-100 text-brand-700 border border-brand-200/80">
              Plan: <strong className="font-black text-brand-900">{totalPlannedQty}</strong> pcs
            </span>
            <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              Real Got: <strong className="font-black text-indigo-900">{totalActualQty}</strong> pcs
            </span>

            {!isReadOnly && (
              <button
                type="button"
                onClick={() => setIsAddingLine(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer"
                title="Add another variant or size brought to warehouse"
              >
                <Plus size={14} />
                <span>Add Variant / Size</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
              title="Export to Excel (.xlsx)"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Add Additional Variant & Size Form Box */}
        {isAddingLine && (
          <div className="px-6 py-4 bg-indigo-50/60 border-b border-indigo-100 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Plus size={14} className="text-indigo-600" />
                Add Additional Variant / Size to Bulk Sorting
              </span>
              <button
                type="button"
                onClick={() => setIsAddingLine(false)}
                className="text-xs text-brand-400 hover:text-brand-700"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-brand-500 block mb-1">
                  Product *
                </label>
                <select
                  value={newSelectedProduct}
                  onChange={(e) => {
                    setNewSelectedProduct(e.target.value);
                    const prod = productOptions.find((p) => String(p.id || p.name) === e.target.value);
                    if (prod && !newUnitPrice) setNewUnitPrice(prod.basePrice);
                  }}
                  className="input !py-1 !px-2.5 text-xs w-full bg-white font-semibold"
                >
                  <option value="">Select product...</option>
                  {productOptions.map((opt) => (
                    <option key={String(opt.id || opt.name)} value={String(opt.id || opt.name)}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-brand-500 block mb-1">
                  Variant (Color / Type)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pink, Matte..."
                  value={newVariant}
                  onChange={(e) => setNewVariant(e.target.value)}
                  className="input !py-1 !px-2.5 text-xs w-full bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-brand-500 block mb-1">
                  Size
                </label>
                <input
                  type="text"
                  placeholder="e.g. M, 38, All..."
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="input !py-1 !px-2.5 text-xs w-full bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-brand-500 block mb-1">
                  Real Got Qty *
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    value={newActualQty}
                    onChange={(e) => setNewActualQty(Math.max(1, Number(e.target.value)))}
                    className="input !py-1 !px-2 text-xs w-20 text-center font-bold bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddLine}
                    disabled={!newSelectedProduct}
                    className="btn-primary !py-1 !px-3 text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-indigo-700 font-medium mt-2">
              💡 If this variant/size does not exist on the product detail, it will be automatically added to the product catalog upon saving.
            </p>
          </div>
        )}

        {/* Content Body: Clean Comparison Table */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
          <div className="rounded-2xl border border-brand-200/80 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-brand-600 font-bold border-b border-brand-100 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Variant</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4 text-center">Plan Qty</th>
                    <th className="py-3 px-4 text-center">Real Got Qty</th>
                    <th className="py-3 px-4 text-center">Status / Diff</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100/60 font-medium text-brand-800">
                  {displayedLines.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-brand-400">
                        No items found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    displayedLines.map((row) => {
                      const diff = Number(row.actualQty || 0) - Number(row.plannedQty || 0);
                      const isComplete = Number(row.actualQty || 0) >= Number(row.plannedQty || 0) && row.plannedQty > 0;
                      const isShortage = Number(row.actualQty || 0) < Number(row.plannedQty || 0);

                      return (
                        <tr
                          key={row.key}
                          className={
                            'hover:bg-brand-50/40 transition ' +
                            (row.isAdditional ? 'bg-amber-50/20' : '')
                          }
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-brand-900">{row.productName}</span>
                              {row.isAdditional && (
                                <span className="rounded-md bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[10px] font-bold">
                                  Additional
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {isReadOnly ? (
                              <span className="font-semibold text-brand-800">{row.variant}</span>
                            ) : (
                              <input
                                type="text"
                                value={row.variant}
                                onChange={(e) => handleUpdateLine(row.key, { variant: e.target.value })}
                                className="input !py-0.5 !px-2 text-xs font-semibold w-28 bg-transparent hover:bg-white focus:bg-white border-transparent hover:border-brand-200"
                              />
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isReadOnly ? (
                              <span className="font-semibold text-brand-800">{row.size}</span>
                            ) : (
                              <input
                                type="text"
                                value={row.size}
                                onChange={(e) => handleUpdateLine(row.key, { size: e.target.value })}
                                className="input !py-0.5 !px-2 text-xs font-semibold w-20 bg-transparent hover:bg-white focus:bg-white border-transparent hover:border-brand-200"
                              />
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-mono font-bold text-brand-700">
                              {row.plannedQty}{' '}
                              <span className="text-[10px] font-normal text-brand-400">pcs</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isReadOnly ? (
                              <span className="font-black text-sm text-indigo-900">
                                {row.actualQty}{' '}
                                <span className="text-[11px] font-semibold text-brand-400">pcs</span>
                              </span>
                            ) : (
                              <div className="inline-flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  value={row.actualQty}
                                  onChange={(e) =>
                                    handleUpdateLine(row.key, {
                                      actualQty: Math.max(0, Number(e.target.value)),
                                    })
                                  }
                                  className="input !py-1 !px-2 text-xs w-20 text-center font-black text-indigo-900 bg-white border-brand-200"
                                />
                                <span className="text-[11px] font-semibold text-brand-400">pcs</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {row.isAdditional ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                                +{row.actualQty} Extra
                              </span>
                            ) : isComplete ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                                <CheckCircle size={12} />
                                {diff > 0 ? `+${diff} Surplus` : 'Exact Match'}
                              </span>
                            ) : isShortage ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 font-bold text-[11px]">
                                <AlertTriangle size={12} />
                                Shortage ({diff} pcs)
                              </span>
                            ) : null}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {row.isAdditional && !isReadOnly ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveLine(row.key)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                                title="Remove added variant"
                              >
                                <Trash2 size={14} />
                              </button>
                            ) : (
                              <span className="text-brand-300 text-[11px]">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {displayedLines.length > 0 && (
                  <tfoot className="bg-slate-50/80 border-t border-brand-200 font-bold text-xs">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-brand-700 font-bold text-right">
                        Total
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-sm text-brand-800">
                          {totalPlannedQty}{' '}
                          <span className="text-[11px] font-semibold text-brand-400">pcs</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-sm text-indigo-700">
                          {totalActualQty}{' '}
                          <span className="text-[11px] font-semibold text-indigo-500">pcs</span>
                        </span>
                      </td>
                      <td colSpan={2} className="py-3 px-4 text-center">
                        <span
                          className={
                            'font-black text-xs ' +
                            (totalActualQty >= totalPlannedQty ? 'text-emerald-700' : 'text-rose-700')
                          }
                        >
                          {totalActualQty >= totalPlannedQty
                            ? `✓ Covered (+${totalActualQty - totalPlannedQty} surplus)`
                            : `⚠ Shortage (${totalActualQty - totalPlannedQty} pcs)`}
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
        <div className="px-6 py-4 border-t border-brand-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <span className="text-xs text-brand-500 font-medium">
            Plan: {totalPlannedQty} pcs | Real Got: {totalActualQty} pcs across {displayedLines.length} item line(s)
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs cursor-pointer"
            >
              Close
            </button>

            {onProceedToAssignment && !isReadOnly && (
              <button
                type="button"
                onClick={() => {
                  onProceedToAssignment(sortingLines);
                  onClose();
                }}
                className="btn-primary text-xs cursor-pointer inline-flex items-center gap-1.5 !px-4"
              >
                <span>Apply & Proceed to Customer Assignment</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


