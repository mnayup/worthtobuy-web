export interface Product {
  id: number;
  sku: string;
  name: string;
  category?: string;
  brandName?: string;
  storeLocation?: string;
  stockMode: 'EVENT' | 'READY_STOCK' | 'BOTH';
  stockQuantity: number;
  reservedQuantity: number;
  sellingPrice: number;
  buyPrice?: number;
  lowStockThreshold: number;
  productUrl?: string;
  imageUrl?: string;
  notes?: string;
}
