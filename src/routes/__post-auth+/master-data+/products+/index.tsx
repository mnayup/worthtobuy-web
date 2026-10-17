import { CrudPage } from '~/components/CrudPage';
import { StatusBadge } from '~/components/StatusBadge';
import { api } from '~/lib/api';
import { money, number } from '~/lib/format';
import { useAuth } from '~/context/AuthContext';
import {
  getProductFields,
  prepareProductSubmit,
  prepareProductInitial,
} from './helpers/product-form-fields.helper';

export async function loader() {
  const response = await api.get('/products?limit=100');
  return response.data;
}

export default function ProductsRoute() {
  const { hasPermission } = useAuth();
  const fields = getProductFields();

  return (
    <CrudPage
      title="Products & Catalog"
      entityName="Product"
      description={
        'Curated product database for events and ready stock inventory. ' +
        'Available stock automatically adjusts for reserved orders.'
      }
      endpoint="/products"
      fields={fields}
      canCreate={hasPermission('products', 'create')}
      canEdit={hasPermission('products', 'edit')}
      canDelete={hasPermission('products', 'delete')}
      searchPlaceholder="Search product name, SKU, brand, variant, size, tenant location..."
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
          render: (row) => {
            const raw = row.image_urls || row.imageUrls;
            const imgs = Array.isArray(raw) && raw.length > 0
              ? raw
              : row.image_url || row.imageUrl
              ? [row.image_url || row.imageUrl]
              : [];
            const primary = imgs[0] || row.image_url || row.imageUrl;
            return (
              <div className="relative inline-block">
                <img
                  src={primary || 'https://placehold.co/48'}
                  className="h-10 w-10 rounded-xl object-cover border border-brand-100"
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/48';
                  }}
                />
                {imgs.length > 1 && (
                  <span
                    className={
                      'absolute -bottom-1 -right-1 rounded-full bg-brand-900/85 ' +
                      'px-1 py-0.2 text-[9px] font-bold text-white shadow-xs'
                    }
                  >
                    +{imgs.length - 1}
                  </span>
                )}
              </div>
            );
          },
        },
        { key: 'sku', label: 'SKU' },
        {
          key: 'name',
          label: 'Product',
          render: (row) => {
            const variant = row.variant || row.variation;
            const size = row.size;
            return (
              <div className="flex flex-col max-w-[240px] min-w-0">
                <span className="font-semibold text-brand-900 truncate block" title={row.name}>
                  {row.name}
                </span>
                {(variant || size) && (
                  <div className="flex flex-wrap items-center gap-1 mt-1 max-w-full">
                    {variant && (
                      <span
                        title={variant}
                        className={
                          'max-w-[220px] truncate rounded-md bg-brand-50 border border-brand-200 ' +
                          'px-1.5 py-0.5 text-[10px] font-semibold text-brand-700 block'
                        }
                      >
                        {variant}
                      </span>
                    )}
                    {size && (
                      <span
                        className={
                          'shrink-0 rounded-md bg-amber-50 border border-amber-200 ' +
                          'px-1.5 py-0.5 text-[10px] font-semibold text-amber-700'
                        }
                      >
                        Size: {size}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          },
        },
        {
          key: 'brandName',
          label: 'Brand',
          render: (row) => {
            const brand = row.brand_name || row.brandName;
            return brand ? (
              <span className="font-medium text-brand-700 truncate max-w-[150px] block" title={brand}>
                {brand}
              </span>
            ) : (
              '-'
            );
          },
        },
        {
          key: 'stockMode',
          label: 'Type',
          render: (row) => <StatusBadge value={row.stock_mode || row.stockMode} />,
        },
        {
          key: 'stockQuantity',
          label: 'Stock',
          render: (row) => {
            const qty = row.stock_quantity ?? row.stockQuantity ?? 0;
            const reserved = row.reserved_quantity ?? row.reservedQuantity ?? 0;
            return (
              <div>
                <strong>{number(qty)}</strong>
                <p className="text-[11px] text-brand-400">Reserved {number(reserved)}</p>
              </div>
            );
          },
        },
        {
          key: 'availableStock',
          label: 'Available',
          render: (row) => {
            const qty = row.stock_quantity ?? row.stockQuantity ?? 0;
            const reserved = row.reserved_quantity ?? row.reservedQuantity ?? 0;
            const low = row.low_stock_threshold ?? row.lowStockThreshold ?? 0;
            const avail = Math.max(0, Number(qty) - Number(reserved));
            return (
              <strong className={avail <= Number(low) ? 'text-cherry-600' : 'text-emerald-600'}>
                {number(avail)}
              </strong>
            );
          },
        },
        {
          key: 'buyPrice',
          label: 'Buy Price',
          render: (row) => money(row.buy_price ?? row.buyPrice ?? 0),
        },
        {
          key: 'sellingPrice',
          label: 'Selling Price',
          render: (row) => money(row.selling_price ?? row.sellingPrice ?? 0),
        },
      ]}
      importConfig={{
        entityType: 'products',
        sampleFileName: 'products-template.xlsx',
      }}
      prepareSubmit={prepareProductSubmit}
      prepareInitial={prepareProductInitial}
    />
  );
}
