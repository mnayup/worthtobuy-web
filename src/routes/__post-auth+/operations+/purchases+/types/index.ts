export interface PurchaseItem {
  id: number;
  purchase_id?: number;
  order_item_id?: number;
  order_id?: number;
  order_number?: string;
  customer_id?: number;
  customer_name?: string;
  customer_whatsapp?: string;
  customer_segment?: string;
  is_priority_customer?: boolean;
  order_status?: string;
  order_paid_amount?: number;
  order_total_bill?: number;
  order_outstanding_amount?: number;
  has_paid_dp?: boolean;
  is_eligible_to_buy?: boolean;
  product_id?: number | null;
  product_name?: string;
  product_variants?: string[];
  product_sizes?: string[];
  brand_name?: string;
  variation?: string | null;
  size?: string | null;
  color?: string | null;
  quantity: number;
  estimated_price: number;
  actual_price: number;
  price_difference?: number;
  status?: string;
  fulfillment_status?: string;
  purchase_status?: string;
  kept_until?: string | null;
}

export interface Purchase {
  id: number;
  purchaseNumber?: string;
  purchase_number?: string;
  batchNumber?: number;
  batch_number?: number;
  purchaseDate?: string;
  purchase_date?: string;
  shopperId?: number;
  shopper_id?: number;
  periodId?: number;
  period_id?: number;
  orderItemId?: number;
  order_item_id?: number;
  productId?: number;
  product_id?: number;
  brandName?: string;
  brand_name?: string;
  quantity?: number;
  totalQuantity?: number;
  eligibleQuantity?: number;
  estimatedPrice?: number;
  estimated_price?: number;
  actualPrice?: number;
  actual_price?: number;
  priceDifference?: number;
  price_difference?: number;
  status: string;
  paymentMethod?: string;
  payment_method?: string;
  receiptUrl?: string;
  receipt_url?: string;
  notes?: string;
  product_summary?: string;
  product?: { name: string };
  period?: { id?: number; name?: string; code?: string };
  items?: PurchaseItem[];
  sortingLines?: BulkSortingLine[];
  sorting_lines?: BulkSortingLine[];
  orderItem?: any;
  order_item?: any;
  shopper?: { name: string };
}

export const purchaseStatuses = [
  'WAITING_PURCHASE',
  'SORTING',
  'PURCHASED',
  'UNAVAILABLE',
];

export const purchaseStatusOptions: { value: string; label: string }[] = [
  { value: 'WAITING_PURCHASE', label: 'Waiting to Purchase' },
  { value: 'SORTING', label: 'Sorting / In Warehouse' },
  { value: 'PURCHASED', label: 'Already Purchased' },
  { value: 'UNAVAILABLE', label: 'Item Unavailable' },
];

export interface ItemChecklistState {
  id: number;
  order_item_id: number;
  status: 'PURCHASED' | 'UNAVAILABLE' | 'WAITING_PURCHASE' | 'SORTING';
  allocated_qty: number;
  max_qty: number;
  actual_unit_price: number;
  estimated_unit_price: number;
  kept_until?: string | null;
  variation?: string | null;
  size?: string | null;
}

export interface BulkSortingLine {
  key: string;
  productId?: number | null;
  productName: string;
  brandName?: string;
  variant: string;
  size: string;
  plannedQty: number;
  actualQty: number;
  unitPrice: number;
  isAdditional?: boolean;
}
