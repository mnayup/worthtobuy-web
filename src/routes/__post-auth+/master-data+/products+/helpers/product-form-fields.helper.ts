import { api } from '~/lib/api';
import type { FieldConfig } from '~/types';

export function getProductFields(): FieldConfig[] {
  return [
    { name: 'sku', label: 'SKU' },
    { name: 'name', label: 'Product name', required: true },
    { name: 'category', label: 'Category' },
    { name: 'brandName', label: 'Brand' },
    {
      name: 'variant',
      label: 'Variant (Color / Pattern)',
      type: 'tags',
      placeholder: 'Type variant & press Enter (e.g. Navy, Crimson, Black)',
    },
    {
      name: 'size',
      label: 'Size',
      type: 'tags',
      placeholder: 'Type size & press Enter (e.g. S, M, L, XL, 42)',
    },
    { name: 'storeLocation', label: 'Store location / tenant' },
    {
      name: 'stockMode',
      label: 'Product type',
      type: 'select',
      options: [
        { value: 'EVENT', label: 'Event Product' },
        { value: 'READY_STOCK', label: 'Ready Stock' },
      ],
      defaultValue: 'EVENT',
      required: true,
    },
    {
      name: 'periodId',
      label: 'Event',
      type: 'select',
      searchable: true,
      loadOptions: async (search) => {
        const res = await api.get(`/periods?search=${search}&limit=50&status=OPEN`);
        return res.data.data.map((p: any) => ({ label: p.name, value: p.id }));
      },
      dependsOn: (form) => form.stockMode === 'EVENT',
      required: true,
    },
    {
      name: 'stockQuantity',
      label: 'Physical stock',
      type: 'number',
      defaultValue: 0,
      dependsOn: (form) => form.stockMode === 'READY_STOCK',
    },
    { name: 'buyPrice', label: 'Buy price', type: 'currency', defaultValue: 0 },
    { name: 'sellingPrice', label: 'Selling price', type: 'currency', defaultValue: 0 },
    {
      name: 'imageUrls',
      label: 'Product Photos (Variant / Color / Size)',
      type: 'images',
      entityType: 'products',
      colSpan: 2,
    },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ];
}

export function prepareProductSubmit(form: Record<string, any>) {
  const { periodId_option, stockMode_option, ...rest } = form;
  const sMode = form.stock_mode || form.stockMode || 'EVENT';
  const pId = form.period_id || form.periodId;
  const rawImgs = form.imageUrls || form.image_urls;
  const imgs: string[] = Array.isArray(rawImgs)
    ? rawImgs.filter(Boolean)
    : form.imageUrl || form.image_url
    ? [form.imageUrl || form.image_url]
    : [];
  const primaryImg = imgs[0] || form.imageUrl || form.image_url || null;

  return {
    ...rest,
    stockMode: sMode,
    stock_mode: sMode,
    periodId: sMode === 'EVENT' && pId ? Number(pId) : null,
    period_id: sMode === 'EVENT' && pId ? Number(pId) : null,
    buyPrice: Number(form.buy_price ?? form.buyPrice ?? 0),
    buy_price: Number(form.buy_price ?? form.buyPrice ?? 0),
    sellingPrice: Number(form.selling_price ?? form.sellingPrice ?? 0),
    selling_price: Number(form.selling_price ?? form.sellingPrice ?? 0),
    stockQuantity:
      sMode === 'READY_STOCK'
        ? Number(form.stock_quantity ?? form.stockQuantity ?? 0)
        : 0,
    stock_quantity:
      sMode === 'READY_STOCK'
        ? Number(form.stock_quantity ?? form.stockQuantity ?? 0)
        : 0,
    variant: form.variant || form.variation || null,
    size: form.size || null,
    imageUrl: primaryImg,
    image_url: primaryImg,
    imageUrls: imgs,
    image_urls: imgs,
    brandName: form.brand_name || form.brandName || null,
    brand_name: form.brand_name || form.brandName || null,
    storeLocation: form.store_location || form.storeLocation || null,
    store_location: form.store_location || form.storeLocation || null,
  };
}

export function prepareProductInitial(row: Record<string, any>) {
  const pId = row.period_id || row.periodId;
  const raw = row.image_urls || row.imageUrls;
  const imgs =
    Array.isArray(raw) && raw.length > 0
      ? raw
      : row.image_url || row.imageUrl
      ? [row.image_url || row.imageUrl]
      : [];
  return {
    ...row,
    periodId: pId ? String(pId) : '',
    imageUrl: imgs[0] || row.image_url || row.imageUrl || '',
    imageUrls: imgs,
    variant: row.variant || row.variation || '',
    size: row.size || '',
    brandName: row.brand_name || row.brandName || '',
    storeLocation: row.store_location || row.storeLocation || '',
    stockMode: row.stock_mode || row.stockMode || 'EVENT',
    stockQuantity: row.stock_quantity ?? row.stockQuantity ?? 0,
    buyPrice: row.buy_price ?? row.buyPrice ?? 0,
    sellingPrice: row.selling_price ?? row.sellingPrice ?? 0,
  };
}
