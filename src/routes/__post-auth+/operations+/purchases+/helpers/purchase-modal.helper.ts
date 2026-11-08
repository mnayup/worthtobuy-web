import type { Purchase, PurchaseItem, BulkSortingLine } from '../types';
import type { ItemChecklistState } from '../components/purchase-items-checklist';

export function buildInitialSortingLines(items: PurchaseItem[] = []): BulkSortingLine[] {
  const map = new Map<string, BulkSortingLine>();

  for (const it of items) {
    const prodName = (it.product_name || 'Unnamed Product').trim();
    const variantLabel = (it.variation?.trim() || it.color?.trim() || 'Default');
    const sizeLabel = (it.size?.trim() || '-');

    const normProd = prodName.toLowerCase();
    const normVariant = variantLabel.toLowerCase();
    const normSize = sizeLabel.toLowerCase();
    const rowKey = `${normProd}__${normVariant}__${normSize}`;

    const existing = map.get(rowKey);
    const qty = Number(it.quantity || 1);
    const unitPrice = Number(it.actual_price || it.estimated_price || 0) / (qty || 1);
    const boughtQty = it.status === 'UNAVAILABLE' ? 0 : qty;

    if (existing) {
      existing.plannedQty += qty;
      existing.actualQty += boughtQty;
    } else {
      map.set(rowKey, {
        key: rowKey,
        productId: it.product_id,
        productName: prodName,
        brandName: it.brand_name,
        variant: variantLabel,
        size: sizeLabel,
        plannedQty: qty,
        actualQty: boughtQty,
        unitPrice,
        isAdditional: false,
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
}

export function buildInitialItemsState(
  items: PurchaseItem[] = []
): Record<number, ItemChecklistState> {
  const initial: Record<number, ItemChecklistState> = {};
  items.forEach((item) => {
    const qty = item.quantity || 1;
    const act = Number(item.actual_price ?? item.estimated_price ?? 0);
    const est = Number(item.estimated_price ?? 0);
    initial[item.id] = {
      id: item.id,
      order_item_id: item.order_item_id || item.id,
      status: (item.status as any) || 'WAITING_PURCHASE',
      allocated_qty: item.status === 'UNAVAILABLE' ? 0 : item.quantity,
      max_qty: item.quantity,
      actual_unit_price: act / qty,
      estimated_unit_price: est / qty,
      kept_until: item.kept_until || null,
      variation: item.variation || null,
      size: item.size || null,
    };
  });
  return initial;
}

export function computePurchaseMetrics(
  items: PurchaseItem[] = [],
  itemsState: Record<number, ItemChecklistState>
) {
  let actualBought = 0;
  let rejectedCount = 0;
  let refundedCount = 0;
  let computedActualPrice = 0;
  let computedEstimatedPrice = 0;

  items.forEach((it) => {
    const st = itemsState[it.id];
    const unitEst = Number(it.estimated_price || 0) / (it.quantity || 1);
    const hasDp = Boolean(it.has_paid_dp);

    if (st) {
      if (st.status === 'PURCHASED') {
        actualBought += st.allocated_qty;
        computedActualPrice += st.actual_unit_price * st.allocated_qty;
        computedEstimatedPrice += unitEst * st.allocated_qty;
        if (st.allocated_qty < it.quantity) {
          const shortQty = it.quantity - st.allocated_qty;
          rejectedCount += shortQty;
          if (hasDp) refundedCount += shortQty;
        }
      } else if (st.status === 'UNAVAILABLE') {
        rejectedCount += it.quantity;
        if (hasDp) refundedCount += it.quantity;
      }
    } else {
      if (it.status === 'PURCHASED') {
        actualBought += it.quantity;
        computedActualPrice += Number(it.actual_price || 0);
        computedEstimatedPrice += Number(it.estimated_price || 0);
      } else if (it.status === 'UNAVAILABLE') {
        rejectedCount += it.quantity;
        if (hasDp) refundedCount += it.quantity;
      }
    }
  });

  return { actualBought, rejectedCount, refundedCount, computedActualPrice, computedEstimatedPrice };
}

export function applySortingToCustomerItems(
  items: PurchaseItem[] = [],
  sortingLines: BulkSortingLine[] = [],
  prevState: Record<number, ItemChecklistState> = {}
): Record<number, ItemChecklistState> {
  const nextState: Record<number, ItemChecklistState> = { ...prevState };

  // Build available pool per (normProd, normVariant, normSize)
  const poolMap = new Map<string, { remaining: number; unitPrice: number }>();
  for (const line of sortingLines) {
    const normProd = (line.productName || 'Unnamed Product').trim().toLowerCase();
    const normVar = (line.variant || 'Default').trim().toLowerCase();
    const normSize = (line.size || '-').trim().toLowerCase();
    const key = `${normProd}__${normVar}__${normSize}`;
    const existing = poolMap.get(key);
    if (existing) {
      existing.remaining += Math.max(0, Number(line.actualQty || 0));
      if (line.unitPrice > 0) existing.unitPrice = line.unitPrice;
    } else {
      poolMap.set(key, {
        remaining: Math.max(0, Number(line.actualQty || 0)),
        unitPrice: Math.max(0, Number(line.unitPrice || 0)),
      });
    }
  }

  // Sort customer items by priority: VIP first, then DP paid, then by id
  const sortedItems = [...items].sort((a, b) => {
    const aScore = (a.is_priority_customer ? 2 : 0) + (a.has_paid_dp ? 1 : 0);
    const bScore = (b.is_priority_customer ? 2 : 0) + (b.has_paid_dp ? 1 : 0);
    if (bScore !== aScore) return bScore - aScore;
    return a.id - b.id;
  });

  for (const item of sortedItems) {
    const current = nextState[item.id] || {
      id: item.id,
      order_item_id: item.order_item_id || item.id,
      status: (item.status as any) || 'WAITING_PURCHASE',
      allocated_qty: item.quantity,
      max_qty: item.quantity,
      actual_unit_price: Number(item.actual_price ?? item.estimated_price ?? 0) / (item.quantity || 1),
      estimated_unit_price: Number(item.estimated_price ?? 0) / (item.quantity || 1),
      kept_until: item.kept_until || null,
      variation: item.variation || null,
      size: item.size || null,
    };

    const prodName = (item.product_name || 'Unnamed Product').trim().toLowerCase();
    const activeVar = (current.variation?.trim() || item.variation?.trim() || item.color?.trim() || 'Default').toLowerCase();
    const activeSize = (current.size?.trim() || item.size?.trim() || '-').toLowerCase();
    const key = `${prodName}__${activeVar}__${activeSize}`;

    const pool = poolMap.get(key);
    if (pool) {
      const alloc = Math.min(item.quantity, pool.remaining);
      pool.remaining = Math.max(0, pool.remaining - alloc);
      nextState[item.id] = {
        ...current,
        allocated_qty: alloc,
        status: alloc > 0 ? 'PURCHASED' : 'UNAVAILABLE',
        actual_unit_price: pool.unitPrice > 0 ? pool.unitPrice : current.actual_unit_price,
      };
    } else {
      nextState[item.id] = {
        ...current,
        allocated_qty: 0,
        status: 'UNAVAILABLE',
      };
    }
  }

  return nextState;
}

