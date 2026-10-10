import { CrudPage } from '~/components/CrudPage';
import { StatusBadge } from '~/components/StatusBadge';
import { api } from '~/lib/api';
import { money, number } from '~/lib/format';
import { useAuth } from '~/context/AuthContext';
import type { FieldConfig } from '~/types';

export async function loader() {
  const response = await api.get('/products?limit=100');
  return response.data;
}

export default function ProductsRoute() {
  const { user } = useAuth();
  const fields: FieldConfig[] = [
    { name: 'sku', label: 'SKU' },
    { name: 'name', label: 'Product name', required: true },
    { name: 'category', label: 'Category' },
    { name: 'brandName', label: 'Brand' },
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
    { name: 'stockQuantity', label: 'Physical stock', type: 'number', defaultValue: 0, dependsOn: (form) => form.stockMode === 'READY_STOCK' },
    { name: 'buyPrice', label: 'Buy price', type: 'currency', defaultValue: 0 },
    { name: 'sellingPrice', label: 'Selling price', type: 'currency', defaultValue: 0 },
    { name: 'productUrl', label: 'Product link', type: 'url', colSpan: 2, placeholder: 'https://store-link.com/item' },
    { name: 'imageUrl', label: 'Product Photo / Image', type: 'image', entityType: 'products', fileType: 'image', colSpan: 2 },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ];

  return (
    <CrudPage
      title="Products & Catalog"
      entityName="Product"
      description="Curated product database for events and ready stock inventory. Available stock automatically adjusts for reserved orders."
      endpoint="/products"
      fields={fields}
      searchPlaceholder="Search product name, SKU, brand, tenant location..."
      filters={[
        {
          key: 'stockMode',
          label: 'Product Type',
          placeholder: 'All Types',
          options: [
            { label: 'Event Product (PO)', value: 'EVENT' },
            { label: 'Ready Stock', value: 'READY_STOCK' },
          ],
        },
        {
          key: 'category',
          label: 'Category',
          placeholder: 'All Categories',
          options: [
            { label: 'Fashion & Apparel', value: 'Fashion' },
            { label: 'Beauty & Skincare', value: 'Skincare' },
            { label: 'Shoes & Footwear', value: 'Shoes' },
            { label: 'Bags & Accessories', value: 'Bags' },
            { label: 'Food & Snacks', value: 'Snack' },
            { label: 'Electronics & Gadgets', value: 'Electronics' },
            { label: 'Other', value: 'Other' },
          ],
        },
      ]}
      columns={[
        {
          key: 'imageUrl',
          label: 'Photo',
          render: (row) => (
            <img src={row.imageUrl || 'https://placehold.co/48'} className="h-10 w-10 rounded-xl object-cover" alt="" />
          ),
        },
        { key: 'sku', label: 'SKU' },
        { key: 'name', label: 'Product' },
        { key: 'brandName', label: 'Brand' },
        { key: 'stockMode', label: 'Type', render: (row) => <StatusBadge value={row.stockMode} /> },
        {
          key: 'stockQuantity',
          label: 'Stock',
          render: (row) => (
            <div>
              <strong>{number(row.stockQuantity)}</strong>
              <p className="text-[11px] text-brand-400">Reserved {number(row.reservedQuantity)}</p>
            </div>
          ),
        },
        {
          key: 'availableStock',
          label: 'Available',
          render: (row) => (
            <strong
              className={
                Number(row.stockQuantity) - Number(row.reservedQuantity) <= Number(row.lowStockThreshold)
                  ? 'text-cherry-600'
                  : 'text-emerald-600'
              }
            >
              {number(Math.max(0, Number(row.stockQuantity) - Number(row.reservedQuantity)))}
            </strong>
          ),
        },
        { key: 'buyPrice', label: 'Buy Price', render: (row) => money(row.buyPrice || 0) },
        { key: 'sellingPrice', label: 'Selling Price', render: (row) => money(row.sellingPrice) },
      ]}
      canDelete={user?.role === 'OWNER' || user?.role === 'ADMIN'}
      importConfig={{
        entityType: 'products',
        sampleFileName: 'products-template.xlsx',
      }}
      prepareSubmit={(form) => {
        const { periodId_option, stockMode_option, ...rest } = form;
        return {
          ...rest,
          stockMode: form.stockMode || 'EVENT',
          periodId: form.stockMode === 'EVENT' && form.periodId ? Number(form.periodId) : null,
          buyPrice: Number(form.buyPrice || 0),
          sellingPrice: Number(form.sellingPrice || 0),
          stockQuantity: form.stockMode === 'READY_STOCK' ? Number(form.stockQuantity || 0) : 0,
        };
      }}
      prepareInitial={(row) => ({
        ...row,
        periodId: row.periodId ? String(row.periodId) : '',
      })}
    />
  );
}
