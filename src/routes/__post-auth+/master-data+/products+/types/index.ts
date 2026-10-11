export interface Product {
  id: number;
  sku: string;
  name: string;
  category?: string;
  brandName?: string;
  variant?: string;
  size?: string;
  storeLocation?: string;
  stockMode: 'EVENT' | 'READY_STOCK' | 'BOTH';
  stockQuantity: number;
  reservedQuantity: number;
  sellingPrice: number;
  buyPrice?: number;
  lowStockThreshold: number;
  productUrl?: string;
  imageUrl?: string;
  imageUrls?: string[];
  notes?: string;
}
