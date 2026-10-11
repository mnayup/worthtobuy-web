import { api } from '~/lib/api';
import type { Option } from '~/types';

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

export const loadPeriods = loadPaginatedOptions('/periods?status=OPEN', (row) => ({
  value: row.id,
  label: `${row.code} • ${row.name}`,
  code: row.code,
  orderOpenAt: row.orderOpenAt || row.order_open_at,
  orderCloseAt: row.orderCloseAt || row.order_close_at,
}));

export const loadCustomers = loadPaginatedOptions('/customers', (row) => {
  const code = row.customerCode || row.customer_code || '';
  const name = row.fullName || row.full_name || row.name || '';
  const wa = row.whatsapp || row.phone || '';
  const labelParts = [code, name, wa].filter(Boolean).join(' • ');
  const vip = row.segment === 'PRIORITY' ? ' (VIP Priority)' : '';
  return {
    value: row.id,
    label: (labelParts || `Customer #${row.id}`) + vip,
    segment: row.segment,
    raw: row,
  };
});

export const loadProducts = async (
  search: string,
  form?: Record<string, any>
): Promise<Option[]> => {
  const query = new URLSearchParams({ limit: '25' });
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
    const detailSuffix = details ? ` (${details})` : '';
    const stockSuffix = isReady ? ` • stock ${availStock}` : '';

    return {
      value: row.id,
      label: `${row.sku} • ${row.name}${detailSuffix}${stockSuffix}`,
      stock: isReady ? availStock : undefined,
      stockMode: row.stock_mode || row.stockMode,
      price: Number(row.selling_price ?? row.sellingPrice ?? 0),
      raw: row,
    };
  });
  return [
    { value: '__NEW_PRODUCT__', label: '+ Create / Add New Product', price: 0 },
    ...items,
  ];
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
