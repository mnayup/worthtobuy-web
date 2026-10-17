import type { Purchase, PurchaseItem } from '../types';
import type { ItemChecklistState } from '../components/purchase-items-checklist';

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
  let computedActualPrice = 0;
  let computedEstimatedPrice = 0;

  items.forEach((it) => {
    const st = itemsState[it.id];
    const unitEst = Number(it.estimated_price || 0) / (it.quantity || 1);

    if (st) {
      if (st.status === 'PURCHASED') {
        actualBought += st.allocated_qty;
        computedActualPrice += st.actual_unit_price * st.allocated_qty;
        computedEstimatedPrice += unitEst * st.allocated_qty;
        if (st.allocated_qty < it.quantity) {
          rejectedCount += it.quantity - st.allocated_qty;
        }
      } else if (st.status === 'UNAVAILABLE') {
        rejectedCount += it.quantity;
      }
    } else {
      if (it.status === 'PURCHASED') {
        actualBought += it.quantity;
        computedActualPrice += Number(it.actual_price || 0);
        computedEstimatedPrice += Number(it.estimated_price || 0);
      } else if (it.status === 'UNAVAILABLE') {
        rejectedCount += it.quantity;
      }
    }
  });

  return { actualBought, rejectedCount, computedActualPrice, computedEstimatedPrice };
}
