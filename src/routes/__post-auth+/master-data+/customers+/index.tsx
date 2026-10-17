import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
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

  const fields: FieldConfig[] = [
    { name: 'fullName', label: 'Full name', required: true },
    {
      name: 'whatsapp',
      label: 'WhatsApp number',
      type: 'tel',
      required: true,
      placeholder: 'e.g. 0812... or +62...',
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
      ]}
      columns={[
        {
          key: 'customerCode',
          label: 'Customer ID',
          render: (row) => row.customer_code || row.customerCode,
        },
        {
          key: 'fullName',
          label: 'Full Name',
          render: (row) => row.full_name || row.fullName,
        },
        { key: 'whatsapp', label: 'WhatsApp' },
        { key: 'city', label: 'City' },
        {
          key: 'segment',
          label: 'Segment',
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
          className="rounded-xl p-2 text-brand-500 hover:bg-brand-50"
          title="Customer 360°"
        >
          <Eye size={16} />
        </button>
      )}
    />
  );
}
