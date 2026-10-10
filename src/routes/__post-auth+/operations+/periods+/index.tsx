import { CrudPage } from '~/components/CrudPage';
import { StatusBadge } from '~/components/StatusBadge';
import { api } from '~/lib/api';
import { date } from '~/lib/format';
import { useAuth } from '~/context/AuthContext';
import type { FieldConfig } from '~/types';
import { periodStatusOptions } from './types';
import dayjs from 'dayjs';

export async function loader() {
  const response = await api.get('/periods?limit=100');
  return response.data;
}

export default function PeriodsRoute() {
  const { user } = useAuth();
  const fields: FieldConfig[] = [
    { 
      name: 'code', 
      label: 'Event Code', 
      placeholder: 'e.g. EVT-NOV26-1234', 
      required: true,
      disabled: (form) => form.code === 'READY-STOCK',
      defaultValue: () => {
        const date = new Date();
        const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const year = date.getFullYear().toString().slice(-2);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `EVT-${month}${year}-${random}`;
      }
    },
    { name: 'name', label: 'Event Name', placeholder: 'e.g. Bangkok Shopping Spree', required: true },
    { name: 'city', label: 'Destination City', placeholder: 'e.g. Bangkok, Thailand', required: true },
    { name: 'type', label: 'Event Type', type: 'select', options: [{ label: 'Local', value: 'LOCAL' }, { label: 'International', value: 'INTERNATIONAL' }], required: true },
    { 
      name: 'eventPeriod', 
      label: 'Event Period', 
      type: 'datetimerange', 
      required: true,
      colSpan: 2,
      dependsOn: (form) => form.code !== 'READY-STOCK',
    },
    { 
      name: 'ordersPeriod', 
      label: 'Orders Period', 
      type: 'datetimerange', 
      required: true,
      colSpan: 2,
      dependsOn: (form) => form.code !== 'READY-STOCK',
    },
    { name: 'estimatedShippingAt', label: 'Estimated Shipping Date', type: 'datetime-local', dependsOn: (form) => form.code !== 'READY-STOCK' },
    { name: 'status', label: 'Status', type: 'select', options: periodStatusOptions, required: true, defaultValue: 'DRAFT', disabled: (form) => form.code === 'READY-STOCK' },
    { name: 'maxItems', label: 'Max Item Quota', type: 'number', dependsOn: (form) => form.type === 'INTERNATIONAL' && form.code !== 'READY-STOCK' },
    { name: 'baggageCapacityKg', label: 'Luggage Capacity (kg)', type: 'number', dependsOn: (form) => form.type === 'INTERNATIONAL' && form.code !== 'READY-STOCK' },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ];

  return (
    <CrudPage
      title="Events"
      description="Manage concierge itineraries, target cities, order open/close windows, and luggage quotas."
      endpoint="/periods"
      fields={fields}
      searchPlaceholder="Search event name, code, destination city..."
      filters={[
        {
          key: 'status',
          label: 'Event Status',
          placeholder: 'All Status',
          options: [
            { label: 'Draft', value: 'DRAFT' },
            { label: 'Open (PO)', value: 'OPEN' },
            { label: 'Shopping', value: 'SHOPPING' },
            { label: 'Closed', value: 'CLOSED' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Archived', value: 'ARCHIVED' },
          ],
        },
        {
          key: 'type',
          label: 'Event Type',
          placeholder: 'All Types',
          options: [
            { label: 'Local (Domestic)', value: 'LOCAL' },
            { label: 'International', value: 'INTERNATIONAL' },
          ],
        },
      ]}
      columns={[
        { 
          key: 'code', 
          label: 'Code',
          render: (row) => (
            <div className="flex items-center gap-1.5 font-semibold">
              <span>{row.code}</span>
              {row.code === 'READY-STOCK' && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  System
                </span>
              )}
            </div>
          )
        },
        { key: 'name', label: 'Event Name' },
        { key: 'city', label: 'Destination' },
        { key: 'type', label: 'Type', render: (row) => row.type === 'LOCAL' ? 'Local' : row.type === 'INTERNATIONAL' ? 'International' : row.type },
        { key: 'departureAt', label: 'Event Period', render: (row) => row.code === 'READY-STOCK' ? 'Permanent' : `${date(row.departureAt)} - ${date(row.returnAt)}` },
        { key: 'orderOpenAt', label: 'Orders Period', render: (row) => row.code === 'READY-STOCK' ? 'Always Open' : `${date(row.orderOpenAt)} - ${date(row.orderCloseAt)}` },
        { key: 'status', label: 'Status', render: (row) => {
          let currentStatus = row.status;
          if (row.code !== 'READY-STOCK' && currentStatus === 'OPEN' && row.orderCloseAt && new Date() > new Date(row.orderCloseAt)) {
            currentStatus = 'CLOSED';
          }
          return <StatusBadge value={currentStatus} />;
        }},
      ]}
      canCreate={user?.role !== 'SHOPPER' && user?.role !== 'FINANCE'}
      canEdit={user?.role === 'OWNER' || user?.role === 'ADMIN'}
      canDelete={user?.role === 'OWNER'}
      canDeleteRow={(row) => row.code !== 'READY-STOCK'}
      prepareSubmit={(form) => {
        if (form.code === 'READY-STOCK') {
          const { eventPeriod: _ep, ordersPeriod: _op, ...rest } = form;
          return {
            ...rest,
            code: 'READY-STOCK',
            status: 'OPEN',
            orderOpenAt: new Date('2020-01-01T00:00:00.000Z').toISOString(),
            orderCloseAt: new Date('2099-12-31T23:59:59.000Z').toISOString(),
            departureAt: new Date('2099-12-31T23:59:59.000Z').toISOString(),
            returnAt: new Date('2099-12-31T23:59:59.000Z').toISOString(),
            estimatedShippingAt: new Date('2099-12-31T23:59:59.000Z').toISOString(),
          };
        }

        const eventPeriod = form.eventPeriod || ['', ''];
        const ordersPeriod = form.ordersPeriod || ['', ''];
        const orderOpenAt = ordersPeriod[0] ? new Date(ordersPeriod[0]) : null;
        const orderCloseAt = ordersPeriod[1] ? new Date(ordersPeriod[1]) : null;
        const departureAt = eventPeriod[0] ? new Date(eventPeriod[0]) : null;
        const returnAt = eventPeriod[1] ? new Date(eventPeriod[1]) : null;

        if (departureAt && returnAt && departureAt > returnAt) {
          throw new Error('Event start cannot be later than event end date.');
        }
        if (orderOpenAt && orderCloseAt && orderOpenAt > orderCloseAt) {
          throw new Error('Order opening date cannot be later than order closing date.');
        }

        const { eventPeriod: _ep, ordersPeriod: _op, ...rest } = form;

        return {
          ...rest,
          orderOpenAt: orderOpenAt ? orderOpenAt.toISOString() : undefined,
          orderCloseAt: orderCloseAt ? orderCloseAt.toISOString() : undefined,
          departureAt: departureAt ? departureAt.toISOString() : undefined,
          returnAt: returnAt ? returnAt.toISOString() : undefined,
          estimatedShippingAt: form.estimatedShippingAt ? new Date(form.estimatedShippingAt).toISOString() : undefined,
          maxItems: form.maxItems ? Number(form.maxItems) : null,
          baggageCapacityKg: form.baggageCapacityKg ? Number(form.baggageCapacityKg) : null,
        };
      }}
      prepareInitial={(row) => {
        let currentStatus = row.status;
        if (currentStatus === 'OPEN' && row.orderCloseAt && new Date() > new Date(row.orderCloseAt)) {
          currentStatus = 'CLOSED';
        }
        return {
          ...row,
          status: currentStatus,
          eventPeriod: [
            row.departureAt ? dayjs(row.departureAt).format('YYYY-MM-DDTHH:mm') : '',
            row.returnAt ? dayjs(row.returnAt).format('YYYY-MM-DDTHH:mm') : ''
          ],
          ordersPeriod: [
            row.orderOpenAt ? dayjs(row.orderOpenAt).format('YYYY-MM-DDTHH:mm') : '',
            row.orderCloseAt ? dayjs(row.orderCloseAt).format('YYYY-MM-DDTHH:mm') : ''
          ],
          estimatedShippingAt: row.estimatedShippingAt ? dayjs(row.estimatedShippingAt).format('YYYY-MM-DDTHH:mm') : '',
        };
      }}
      importConfig={{
        entityType: 'events',
        sampleFileName: 'events-template.xlsx',
      }}
    />
  );
}
