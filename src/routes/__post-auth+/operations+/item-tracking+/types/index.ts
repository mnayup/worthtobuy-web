export interface TrackingItem {
  id: number;
  fulfillmentStatus: string;
  keptUntil?: string;
  notes?: string;
  sourceType?: string;
  quantity: number;
  product?: {
    name: string;
    sku: string;
  };
  manualProductName?: string;
  order?: {
    orderNumber: string;
    customer?: { fullName: string };
    period?: { code: string; name: string };
  };
}

export const fulfillmentStatuses = [
  'PENDING',
  'SEARCHING',
  'AVAILABLE',
  'UNAVAILABLE',
  'KEPT',
  'READY_TO_SHIP',
  'SHIPPED',
  'DELIVERED',
];
