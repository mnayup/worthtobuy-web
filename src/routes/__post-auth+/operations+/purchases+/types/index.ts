export interface Purchase {
  id: number;
  purchaseNumber?: string;
  purchase_number?: string;
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
  product?: { name: string };
  orderItem?: {
    id?: number;
    manualProductName?: string;
    manual_product_name?: string;
    order?: {
      id?: number;
      orderNumber?: string;
      order_number?: string;
      totalBill?: number;
      total_bill?: number;
      paidAmount?: number;
      paid_amount?: number;
      outstandingAmount?: number;
      outstanding_amount?: number;
      status?: string;
      customer?: {
        id?: number;
        fullName?: string;
        full_name?: string;
        whatsapp?: string;
        address?: string;
      };
    };
  };
  order_item?: any;
  shopper?: { name: string };
}

export const purchaseStatuses = [
  'WAITING_PURCHASE',
  'PURCHASED',
  'UNAVAILABLE',
];

export const purchaseStatusOptions: { value: string; label: string }[] = [
  { value: 'WAITING_PURCHASE', label: 'Waiting to Purchase' },
  { value: 'PURCHASED', label: 'Already Purchased' },
  { value: 'UNAVAILABLE', label: 'Item Unavailable' },
];
