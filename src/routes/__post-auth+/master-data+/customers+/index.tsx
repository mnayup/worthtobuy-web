import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MessageCircle, ExternalLink } from 'lucide-react';
import { CrudPage } from '~/components/CrudPage';
import { StatusBadge } from '~/components/StatusBadge';
import { api } from '~/lib/api';
import { titleCase } from '~/lib/format';
import { useAuth } from '~/context/AuthContext';
import type { FieldConfig, Option } from '~/types';

const opts = (values: string[]): Option[] =>
  values.map((value) => ({ value, label: titleCase(value) }));

export async function loader() {
  const response = await api.get('/customers?limit=100');
  return response.data;
}

export default function CustomersRoute() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [waGroupOptions, setWaGroupOptions] = useState<Option[]>([]);

  useEffect(() => {
    api
      .get('/whatsapp-groups?limit=200')
      .then((res) => {
        const rows = res.data?.data || res.data || [];
        setWaGroupOptions(
          rows.map((g: any) => ({
            label: g.name,
            value: String(g.id),
          }))
        );
      })
      .catch(() => setWaGroupOptions([]));
  }, []);

  const fields: FieldConfig[] = [
    { name: 'fullName', label: 'Full name', required: true },
    {
      name: 'whatsapp',
      label: 'WhatsApp number',
      type: 'tel',
      required: true,
      placeholder: 'e.g. 0812... or +62...',
    },
    {
      name: 'whatsappGroupId',
      label: 'WhatsApp Group',
      type: 'select',
      placeholder: 'Select WhatsApp Group...',
      searchable: true,
      loadOptions: async (search) => {
        try {
          const res = await api.get(
            `/whatsapp-groups?limit=100&search=${encodeURIComponent(search || '')}`
          );
          const rows = res.data?.data || res.data || [];
          return [
            { label: 'None (Unassigned)', value: '' },
            ...rows.map((g: any) => ({
              label: `${g.name}${g.customerCount !== undefined ? ` (${g.customerCount} members)` : ''}`,
              value: g.id,
            })),
          ];
        } catch {
          return [];
        }
      },
    },
    { name: 'email', label: 'Email (optional)', type: 'email' },
    { name: 'socialUsername', label: 'Social media handle' },
    { name: 'address', label: 'Address', type: 'textarea', colSpan: 2 },
    { name: 'city', label: 'City' },
    { name: 'postalCode', label: 'Postal code', type: 'tel' },
    {
      name: 'segment',
      label: 'Segment',
      type: 'select',
      options: opts(['REGULAR', 'PRIORITY', 'PROBLEM', 'INACTIVE']),
      defaultValue: 'REGULAR',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'toggle',
      defaultValue: true,
    },
    { name: 'notes', label: 'Customer notes', type: 'textarea', colSpan: 2 },
  ];

  return (
    <CrudPage
      title="Customers"
      description="Manage customer directory, VIP segmentation, and shopping history."
      endpoint="/customers"
      fields={fields}
      searchPlaceholder="Search customer name, ID, WhatsApp, city..."
      filters={[
        {
          key: 'segment',
          label: 'Segment',
          placeholder: 'All Segments',
          options: [
            { label: 'Regular', value: 'REGULAR' },
            { label: 'Priority (VIP)', value: 'PRIORITY' },
            { label: 'Problem', value: 'PROBLEM' },
            { label: 'Inactive', value: 'INACTIVE' },
          ],
        },
        {
          key: 'status',
          label: 'Account Status',
          placeholder: 'All Status',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ],
        },
        ...(waGroupOptions.length > 0
          ? [
              {
                key: 'whatsappGroupId',
                label: 'WhatsApp Group',
                placeholder: 'All WA Groups',
                options: waGroupOptions,
              },
            ]
          : []),
      ]}
      columns={[
        {
          key: 'customerCode',
          label: 'Customer ID',
          exportValue: (row) => row.customer_code || row.customerCode || '-',
          render: (row) => row.customer_code || row.customerCode,
        },
        {
          key: 'fullName',
          label: 'Full Name',
          exportValue: (row) => row.full_name || row.fullName || '-',
          render: (row) => row.full_name || row.fullName,
        },
        { key: 'whatsapp', label: 'WhatsApp', exportValue: (row) => row.whatsapp || '-' },
        {
          key: 'whatsapp_group',
          label: 'WA Group',
          exportValue: (row) => {
            const group = row.whatsapp_group || row.whatsappGroup;
            return group?.name || 'Unassigned';
          },
          render: (row) => {
            const group = row.whatsapp_group || row.whatsappGroup;
            if (!group) {
              return <span className="text-brand-300 text-xs italic">Unassigned</span>;
            }
            return (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <MessageCircle size={12} className="text-emerald-500 shrink-0" />
                  <span className="max-w-[130px] truncate">{group.name}</span>
                </span>
                {group.url && (
                  <a
                    href={group.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-800 p-1 hover:bg-emerald-50 rounded-lg transition"
                    title={`Open ${group.name} link`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            );
          },
        },
        { key: 'city', label: 'City', exportValue: (row) => row.city || '-' },
        {
          key: 'segment',
          label: 'Segment',
          exportValue: (row) => {
            let segment = row.segment;
            const orderCount = row._count?.orders || row.orders?.length || 0;
            if (segment === 'REGULAR' && orderCount >= 24) {
              segment = 'PRIORITY';
            }
            return segment || 'REGULAR';
          },
          render: (row) => {
            let segment = row.segment;
            const orderCount = row._count?.orders || row.orders?.length || 0;
            if (segment === 'REGULAR' && orderCount >= 24) {
              segment = 'PRIORITY';
            }
            return <StatusBadge value={segment} />;
          },
        },
        {
          key: 'status',
          label: 'Status',
          exportValue: (row) => row.status || 'inactive',
          render: (row) => <StatusBadge value={row.status || 'inactive'} />,
        },
      ]}
      canCreate={hasPermission('customers', 'create')}
      canEdit={hasPermission('customers', 'edit')}
      canDelete={hasPermission('customers', 'delete')}
      prepareSubmit={(form) => {
        let wa = form.whatsapp || '';
        wa = wa.replace(/[^\d+]/g, '');
        if (wa.startsWith('0')) wa = '62' + wa.substring(1);
        else if (wa.startsWith('+62')) wa = '62' + wa.substring(3);

        let postal = form.postalCode || '';
        if (postal) postal = postal.replace(/\D/g, '');

        return {
          ...form,
          whatsapp: wa,
          postalCode: postal,
          status: form.status ? 'active' : 'inactive',
          whatsappGroupId: form.whatsappGroupId ? Number(form.whatsappGroupId) : null,
        };
      }}
      prepareInitial={(row) => {
        let segment = row.segment;
        const orderCount = row._count?.orders || row.orders?.length || 0;
        if (segment === 'REGULAR' && orderCount >= 24) {
          segment = 'PRIORITY';
        }
        return {
          ...row,
          fullName: row.full_name || row.fullName,
          socialUsername: row.social_username || row.socialUsername,
          postalCode: row.postal_code || row.postalCode,
          whatsappGroupId:
            row.whatsapp_group_id ||
            row.whatsappGroupId ||
            row.whatsapp_group?.id ||
            '',
          segment,
          status: row.status === 'active',
        };
      }}
      importConfig={{
        entityType: 'customers',
        sampleFileName: 'customers-template.xlsx',
      }}
      renderActions={(row) => (
        <button
          onClick={() => navigate(`/customers/${row.id}`)}
          className="inline-flex items-center justify-center px-2.5 py-1.5 h-8 min-w-[34px] rounded-xl border border-brand-200 bg-white text-brand-600 shadow-2xs hover:bg-brand-50 hover:text-brand-900 hover:border-brand-300 transition cursor-pointer"
          title="Customer 360°"
          aria-label="Customer 360°"
        >
          <Eye size={15} />
        </button>
      )}
    />
  );
}
