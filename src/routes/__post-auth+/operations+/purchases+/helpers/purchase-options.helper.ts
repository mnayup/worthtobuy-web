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

export const loadPeriods = loadPaginatedOptions(
  '/periods?status=OPEN',
  (row) => ({
    value: row.id,
    label: `${row.code} • ${row.name}`,
    raw: row,
  })
);

export const loadLiveShoppingPeriods = loadPaginatedOptions(
  '/periods?status=OPEN&type=LIVE_SHOPPING',
  (row) => ({
    value: row.id,
    label: `${row.name}`,
    subLabel: `Code: ${row.code} • Live Shopping`,
    raw: row,
  })
);

export const loadProducts = loadPaginatedOptions(
  '/products?activePeriod=true',
  (row) => ({
    value: row.id,
    label: row.name,
    subLabel: row.sku ? `SKU: ${row.sku}` : undefined,
    raw: row,
  })
);

export const loadLiveShoppingProducts = async (
  search: string,
  form?: Record<string, any>,
  page: number = 1
): Promise<Option[]> => {
  const query = new URLSearchParams({ limit: '10', page: String(page) });
  if (search) query.set('search', search);
  if (form?.periodId) query.set('eventId', String(form.periodId));
  else query.set('activePeriod', 'true');

  const response = await api.get(`/products?${query}`);
  const items = responseRows(response).map((row: any) => {
    const qty = row.stock_quantity ?? row.stockQuantity ?? 0;
    const reserved = row.reserved_quantity ?? row.reservedQuantity ?? 0;
    const avail = Math.max(0, qty - reserved);
    const buyPrice = Number(row.buy_price ?? row.buyPrice ?? 0);
    return {
      value: row.id,
      label: row.name,
      subLabel: [
        row.sku ? `SKU: ${row.sku}` : '',
        row.brand_name || row.brandName ? `Brand: ${row.brand_name || row.brandName}` : '',
        `Current Stock: ${avail}`,
      ]
        .filter(Boolean)
        .join(' • '),
      price: buyPrice,
      raw: row,
    };
  });

  if (page === 1) {
    return [
      { value: '__NEW_PRODUCT__', label: '+ Create / Add New Product', price: 0 },
      ...items,
    ];
  }
  return items;
};

export const loadUsers = loadPaginatedOptions('/users', (row) => ({
  value: row.id,
  label: `${row.name} • ${row.role?.name || ''}`,
}));

export const loadOrderItems = loadPaginatedOptions('/order-items', (row) => {
  const oNum = row.order?.order_number || row.order?.orderNumber || '-';
  const pName =
    row.product?.name ||
    row.manual_product_name ||
    row.manualProductName ||
    'Custom item';
  const cName =
    row.order?.customer?.full_name || row.order?.customer?.fullName || '-';
  return { value: row.id, label: `${oNum} • ${pName} • ${cName}` };
});
