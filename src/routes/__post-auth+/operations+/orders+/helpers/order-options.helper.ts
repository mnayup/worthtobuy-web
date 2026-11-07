import { api } from '~/lib/api';
import type { Option } from '~/types';
import { parseProductPriceRules } from '~/lib/pricing-rules';

export const responseRows = (response: any): any[] => {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const loadPaginatedOptions =
  (endpoint: string, mapper: (row: any) => Option) =>
  async (search: string): Promise<Option[]> => {
    const [path, queryString] = endpoint.split('?');
    const query = new URLSearchParams(queryString || '');
    query.set('limit', '25');
    if (search) query.set('search', search);
    const response = await api.get(`${path}?${query}`);
    return responseRows(response).map(mapper);
  };

export const loadPeriods = async (search: string): Promise<Option[]> => {
  const query = new URLSearchParams({ limit: '50', status: 'OPEN' });
  if (search) query.set('search', search);
  const response = await api.get(`/periods?${query}`);
  const rows = responseRows(response);
  return rows
    .filter((row: any) => (row.status || '').toUpperCase() === 'OPEN')
    .map((row: any) => ({
      value: row.id,
      label: `${row.code} • ${row.name}`,
      code: row.code,
      orderOpenAt: row.orderOpenAt || row.order_open_at,
      orderCloseAt: row.orderCloseAt || row.order_close_at,
    }));
};

export const loadCustomers = loadPaginatedOptions('/customers', (row) => {
  const code = row.customerCode || row.customer_code || '';
  const name = row.fullName || row.full_name || row.name || `Customer #${row.id}`;
  const wa = row.whatsapp || row.phone || '';
  const vip = row.segment === 'PRIORITY' ? ' (VIP Priority)' : '';
  const subLabelParts = [code ? `ID: ${code}` : `ID: #${row.id}`, wa].filter(Boolean).join(' • ');

  return {
    value: row.id,
    label: `${name}${vip}`,
    subLabel: subLabelParts,
    segment: row.segment,
    raw: row,
  };
});

export const loadProducts = async (
  search: string,
  form?: Record<string, any>,
  page: number = 1
): Promise<Option[]> => {
  const query = new URLSearchParams({ limit: '10', page: String(page) });
  if (search) query.set('search', search);
  if (form?.periodId) query.set('eventId', form.periodId);
  else query.set('activePeriod', 'true');
  const response = await api.get(`/products?${query}`);
  const items = responseRows(response).map((row: any) => {
    const isReady = ['READY_STOCK', 'BOTH'].includes(row.stock_mode || row.stockMode);
    const qty = row.stock_quantity ?? row.stockQuantity ?? 0;
    const reserved = row.reserved_quantity ?? row.reservedQuantity ?? 0;
    const availStock = Math.max(0, qty - reserved);
    const variant = row.variant || row.variation;
    const size = row.size;
    const details = [variant, size ? `Size: ${size}` : ''].filter(Boolean).join(' • ');
    const stockSuffix = isReady ? `stock: ${availStock}` : '';
    const subLabelParts = [row.sku ? `SKU: ${row.sku}` : '', details, stockSuffix]
      .filter(Boolean)
      .join(' • ');

    // Check if this product has bundle promo rules defined
    const priceRules = parseProductPriceRules(row.variant_prices || row.variantPrices);
    const bundleCount = (priceRules.bundleRules || []).length;
    const bundleTag = bundleCount > 0 ? (bundleCount === 1 ? 'Bundle Promo' : `${bundleCount} Bundle Promos`) : undefined;

    return {
      value: row.id,
      label: row.name,
      subLabel: subLabelParts,
      tag: bundleTag,
      stock: isReady ? availStock : undefined,
      stockMode: row.stock_mode || row.stockMode,
      price: Number(row.selling_price ?? row.sellingPrice ?? 0),
      raw: row,
    };
  });

  // Only include "+ Create / Add New Product" option on page 1
  if (page === 1) {
    return [
      { value: '__NEW_PRODUCT__', label: '+ Create / Add New Product', price: 0 },
      ...items,
    ];
  }
  return items;
};

export const getNowDateTimeLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const loadUsers = loadPaginatedOptions('/users', (row) => ({
  value: row.id,
  label: `${row.name} • ${row.role?.name || ''}`,
}));
