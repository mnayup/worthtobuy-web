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
  })
);

export const loadProducts = loadPaginatedOptions(
  '/products?activePeriod=true',
  (row) => ({
    value: row.id,
    label: `${row.sku} • ${row.name}`,
  })
);

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
