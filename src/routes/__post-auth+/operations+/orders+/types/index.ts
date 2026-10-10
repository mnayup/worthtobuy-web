import type { Option } from '~/types';

export interface OrderItem {
  id?: number;
  productId?: number;
  manualProductName?: string;
  brandName?: string;
  quantity: number;
  variation?: string;
  size?: string;
  color?: string;
  unitPriceForeign: number;
  targetPriceIdr?: number;
  sourceType: 'CATALOG' | 'MANUAL_RECAP' | 'READY_STOCK';
  fulfillmentStatus: string;
  keptUntil?: string;
  product?: {
    id: number;
    name: string;
    sku: string;
    brandName?: string;
    imageUrl?: string;
  };
}

export interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  dueDate?: string;
  periodId: number;
  customerId: number;
  adminId?: number;
  status: string;
  totalBill: number;
  outstandingAmount: number;
  serviceFeeMode: 'AUTO' | 'AUTO_CUSTOMER' | 'AUTO_RESELLER' | 'MANUAL';
  serviceFee: number;
  serviceFeeNote?: string;
  localShipping: number;
  customerShipping: number;
  additionalFee: number;
  discount: number;
  customerNotes?: string;
  internalNotes?: string;
  customer?: { id: number; fullName: string; customerCode?: string };
  period?: { id: number; code: string; name: string };
  items: OrderItem[];
  invoiceLinks?: Array<{ invoiceId: number }>;
}

export interface OrderLookupData {
  periods: Option[];
  customers: Option[];
  products: Option[];
  users: Option[];
}
