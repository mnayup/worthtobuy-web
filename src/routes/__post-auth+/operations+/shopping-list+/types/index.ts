export interface ShoppingListItem {
  id: number;
  quantity: number;
  sourceType?: string;
  purchaseStatus: string;
  targetPriceIdr?: number;
  unitPriceForeign?: number;
  photoUrl?: string;
  purchaseNotes?: string;
  brandName?: string;
  manualProductName?: string;
  variation?: string;
  size?: string;
  product?: {
    name: string;
    brandName?: string;
    storeLocation?: string;
    imageUrl?: string;
    variant?: string;
    size?: string;
  };
  order?: {
    orderNumber: string;
    customer?: { fullName: string };
    period?: { code: string };
  };
}

export const shoppingStatuses = [
  'PENDING',
  'FOUND',
  'PURCHASED',
  'OUT_OF_STOCK',
  'PRICE_CHANGED',
  'REPLACED',
];
