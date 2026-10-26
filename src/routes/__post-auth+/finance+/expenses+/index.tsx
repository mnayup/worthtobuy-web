import { useMemo } from 'react';
import { CrudPage } from '~/components/CrudPage';
import { api } from '~/lib/api';
import { date, money } from '~/lib/format';
import { useAuth } from '~/context/AuthContext';
import type { FieldConfig, Option } from '~/types';

const responseRows = (response: any): any[] => {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const loadPaginatedOptions =
  (endpoint: string, mapper: (row: any) => Option) =>
  async (search: string): Promise<Option[]> => {
    const [path, queryString] = endpoint.split('?');
    const query = new URLSearchParams(queryString || '');
    query.set('limit', '25');
    if (search) query.set('search', search);
    const response = await api.get(`${path}?${query}`);
    return responseRows(response).map(mapper);
  };

const loadPeriods = loadPaginatedOptions('/periods?status=OPEN', (row) => ({
  value: row.id,
  label: `${row.code} • ${row.name}`,
}));

export async function loader() {
  const response = await api.get('/periods?limit=100');
  return { periods: responseRows(response) };
}

export default function ExpensesRoute() {
  const { user, hasPermission } = useAuth();
  const fields = useMemo<FieldConfig[]>(
    () => [
      { name: 'expenseNumber', label: 'Expense number' },
      { name: 'expenseDate', label: 'Date & Time', type: 'datetime-local' },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: [
          'Transportation',
          'Accommodation',
          'Event Tickets',
          'Parking & Tolls',
          'Packaging & Supplies',
          'Shipping & Logistics',
          'Bank & Admin Fees',
          'Team Payroll',
          'Shopper Commission',
          'Marketing & Ads',
          'Meals & Operations',
          'Other Expenses',
        ].map((value) => ({ value, label: value })),
        required: true,
      },
      {
        name: 'periodId',
        label: 'Event',
        type: 'select',
        loadOptions: loadPeriods,
        searchable: true,
      },
      { name: 'amount', label: 'Amount (IDR)', type: 'currency', required: true },
      { name: 'payee', label: 'Payee / Vendor' },
      { name: 'paymentMethod', label: 'Payment method' },
      {
        name: 'proofUrl',
        label: 'Transaction Receipt / Proof',
        type: 'file',
        entityType: 'expenses',
        fileType: 'all',
        colSpan: 2,
      },
      { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
    ],
    []
  );

  return (
    <CrudPage
      title="Operational Expenses"
      description="Track event logistics, local vendor costs, and operational expenses in IDR."
      endpoint="/expenses"
      fields={fields}
      searchPlaceholder="Search expense number, vendor / payee, notes..."
      filters={[
        {
          key: 'category',
          label: 'Expense Category',
          placeholder: 'All Categories',
          options: [
            { label: 'Flight & Travel', value: 'Flight & Travel' },
            { label: 'Cargo & Shipping', value: 'Cargo & Shipping' },
            { label: 'Baggage Fee', value: 'Baggage Fee' },
            { label: 'Hotel & Lodging', value: 'Hotel' },
            { label: 'Meals & Food', value: 'Meals' },
            { label: 'Packaging & Supplies', value: 'Packaging' },
            { label: 'Local Transport', value: 'Transport' },
            { label: 'Sim Card & Roaming', value: 'Sim Card' },
            { label: 'Other Expenses', value: 'Other Expenses' },
          ],
        },
      ]}
      columns={[
        {
          key: 'expenseNumber',
          label: 'Expense #',
          exportValue: (row) => row.expense_number || row.expenseNumber || '-',
          render: (row) => row.expense_number || row.expenseNumber,
        },
        {
          key: 'expenseDate',
          label: 'Date',
          exportValue: (row) => date(row.expense_date || row.expenseDate),
          render: (row) => date(row.expense_date || row.expenseDate),
        },
        { key: 'category', label: 'Category', exportValue: (row) => row.category || '-' },
        { key: 'period', label: 'Event', exportValue: (row) => row.period?.code || row.period?.name || '-', render: (row) => row.period?.code || '-' },
        {
          key: 'amountIdr',
          label: 'Amount (IDR)',
          exportValue: (row) => Number(row.amount_idr ?? row.amountIdr ?? row.amount ?? 0),
          render: (row) => (
            <strong>{money(row.amount_idr ?? row.amountIdr ?? row.amount)}</strong>
          ),
        },
        { key: 'payee', label: 'Payee', exportValue: (row) => row.payee || '-' },
      ]}
      canCreate={hasPermission('expenses', 'create')}
      canEdit={hasPermission('expenses', 'edit')}
      canDelete={hasPermission('expenses', 'delete')}
      prepareInitial={(row) => ({
        ...row,
        expenseNumber: row.expense_number || row.expenseNumber,
        expenseDate: row.expense_date
          ? String(row.expense_date).slice(0, 16)
          : row.expenseDate
          ? String(row.expenseDate).slice(0, 16)
          : '',
        periodId: row.period_id ?? row.periodId,
        amount: Number(row.amount_idr ?? row.amountIdr ?? row.amount ?? 0),
        paymentMethod: row.payment_method || row.paymentMethod,
        proofUrl: row.proof_url || row.proofUrl,
      })}
      prepareSubmit={(form) => ({
        ...form,
        expenseNumber: form.expenseNumber,
        expenseDate: form.expenseDate ? new Date(form.expenseDate).toISOString() : undefined,
        periodId: form.periodId ? Number(form.periodId) : undefined,
        amountIdr: Number(form.amount || 0),
        amount: Number(form.amount || 0),
        paymentMethod: form.paymentMethod,
        proofUrl: form.proofUrl,
      })}
    />
  );
}
