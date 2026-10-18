import { useMemo } from 'react';
import { Truck } from 'lucide-react';
import { CrudPage } from '~/components/CrudPage';
import { StatusBadge } from '~/components/StatusBadge';
import { useAuth } from '~/context/AuthContext';
import type { FieldConfig } from '~/types';

export default function ShippingCountersRoute() {
  const { user } = useAuth();
  const canManage = user?.role === 'OWNER' || user?.role === 'ADMIN';

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'name',
        label: 'Courier / Expedition Name',
        required: true,
        placeholder: 'e.g. JNE, J&T Express, SiCepat, Indah Cargo, Wahana',
      },
      {
        name: 'code',
        label: 'Short Code / Identifier',
        placeholder: 'e.g. JNE, JNT, SICEPAT, INDAH',
      },
      {
        name: 'isActive',
        label: 'Active Status',
        type: 'toggle',
        defaultValue: true,
      },
      {
        name: 'notes',
        label: 'Services & Description',
        type: 'textarea',
        colSpan: 2,
        placeholder: 'e.g. Layanan Reguler, Next Day, Cargo. Catatan operasional...',
      },
    ],
    []
  );

  return (
    <CrudPage
      title="Master Shipping Courier"
      entityName="Courier / Expedition"
      description="Manage the list of shipping couriers and expeditions used for order deliveries and tracking."
      endpoint="/shipping-counters"
      fields={fields}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      searchPlaceholder="Search courier name, code, services..."
      prepareInitial={(item) => ({
        name: item.name || '',
        code: item.code || '',
        isActive: item.is_active ?? item.isActive ?? true,
        notes: item.notes || '',
      })}
      prepareSubmit={(values) => ({
        name: values.name?.trim(),
        courier: values.name?.trim(),
        code: values.code?.trim() || null,
        isActive: values.isActive !== false,
        notes: values.notes?.trim() || null,
      })}
      filters={[
        {
          key: 'isActive',
          label: 'Status',
          placeholder: 'All Status',
          options: [
            { label: 'Active', value: 'true' },
            { label: 'Inactive', value: 'false' },
          ],
        },
      ]}
      columns={[
        {
          key: 'name',
          label: 'Courier / Expedition',
          render: (row) => (
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/80 shadow-xs">
                <Truck size={17} />
              </div>
              <div>
                <div className="font-bold text-brand-900 leading-snug">{row.name}</div>
                {row.code && (
                  <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-brand-100 text-brand-700">
                    {row.code}
                  </span>
                )}
              </div>
            </div>
          ),
        },
        {
          key: 'notes',
          label: 'Services & Description',
          render: (row) =>
            row.notes ? (
              <div className="text-xs text-brand-700 leading-relaxed max-w-xl">
                {row.notes}
              </div>
            ) : (
              <span className="text-brand-400 text-xs italic">Belum ada keterangan</span>
            ),
        },
        {
          key: 'isActive',
          label: 'Status',
          render: (row) => {
            const active = row.is_active ?? row.isActive ?? true;
            return (
              <StatusBadge
                status={active ? 'ACTIVE' : 'INACTIVE'}
                color={active ? 'green' : 'gray'}
              />
            );
          },
        },
      ]}
    />
  );
}
