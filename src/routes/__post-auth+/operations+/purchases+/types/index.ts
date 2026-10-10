export interface Purchase {
  id: number;
  purchaseNumber: string;
  purchaseDate: string;
  shopperId?: number;
  periodId: number;
  orderItemId: number;
  productId?: number;
  brandName: string;
  quantity: number;
  estimatedPrice: number;
  actualPrice: number;
  priceDifference: number;
  status: string;
  paymentMethod?: string;
  receiptUrl?: string;
  notes?: string;
  product?: { name: string };
  orderItem?: {
    id?: number;
    manualProductName?: string;
    order?: {
      id?: number;
      orderNumber?: string;
      totalBill?: number;
      paidAmount?: number;
      outstandingAmount?: number;
      status?: string;
      customer?: {
        id?: number;
        fullName?: string;
        whatsapp?: string;
        address?: string;
      };
    };
  };
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
