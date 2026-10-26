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
  const { user, hasPermission } = useAuth();
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
    {
      name: 'name',
      label: 'Event Name',
      placeholder: 'e.g. Bangkok Shopping Spree',
      required: true,
    },
    {
      name: 'city',
      label: 'Destination City',
      placeholder: 'e.g. Bangkok, Thailand',
      required: true,
    },
    {
      name: 'type',
      label: 'Event Type',
      type: 'select',
      options: [
        { label: 'Local', value: 'LOCAL' },
        { label: 'International', value: 'INTERNATIONAL' },
      ],
      required: true,
    },
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
    {
      name: 'estimatedShippingAt',
      label: 'Estimated Shipping Date',
      type: 'datetime-local',
      dependsOn: (form) => form.code !== 'READY-STOCK',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: periodStatusOptions,
      required: true,
      defaultValue: 'DRAFT',
      disabled: (form) => form.code === 'READY-STOCK',
    },
    {
      name: 'maxItems',
      label: 'Max Item Quota',
      type: 'number',
      dependsOn: (form) => form.type === 'INTERNATIONAL' && form.code !== 'READY-STOCK',
    },
    {
      name: 'baggageCapacityKg',
      label: 'Luggage Capacity (kg)',
      type: 'number',
      dependsOn: (form) => form.type === 'INTERNATIONAL' && form.code !== 'READY-STOCK',
    },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ];

  return (
    <CrudPage
      title="Events"
      description={
        'Manage concierge itineraries, target cities, order open/close windows, ' +
        'and luggage quotas.'
      }
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
          exportValue: (row) => row.code || '-',
          render: (row) => (
            <div className="flex items-center gap-1.5 font-semibold">
              <span>{row.code}</span>
              {row.code === 'READY-STOCK' && (
                <span
                  className={
                    'rounded-full bg-emerald-100 px-2 py-0.5 ' +
                    'text-[10px] font-bold text-emerald-700'
                  }
                >
                  System
                </span>
              )}
            </div>
          )
        },
        { key: 'name', label: 'Event Name', exportValue: (row) => row.name || '-' },
        { key: 'city', label: 'Destination', exportValue: (row) => row.city || '-' },
        {
          key: 'type',
          label: 'Type',
          exportValue: (row) => (row.type === 'LOCAL' ? 'Local' : row.type === 'INTERNATIONAL' ? 'International' : row.type || '-'),
          render: (row) =>
            row.type === 'LOCAL'
              ? 'Local'
              : row.type === 'INTERNATIONAL'
              ? 'International'
              : row.type,
        },
        {
          key: 'departureAt',
          label: 'Event Period',
          exportValue: (row) => {
            const dep = row.departure_at ?? row.departureAt;
            const ret = row.return_at ?? row.returnAt;
            return row.code === 'READY-STOCK' ? 'Permanent' : `${date(dep)} - ${date(ret)}`;
          },
          render: (row) => {
            const dep = row.departure_at ?? row.departureAt;
            const ret = row.return_at ?? row.returnAt;
            return row.code === 'READY-STOCK' ? 'Permanent' : `${date(dep)} - ${date(ret)}`;
          },
        },
        {
          key: 'orderOpenAt',
          label: 'Orders Period',
          exportValue: (row) => {
            const open = row.order_open_at ?? row.orderOpenAt;
            const close = row.order_close_at ?? row.orderCloseAt;
            return row.code === 'READY-STOCK' ? 'Always Open' : `${date(open)} - ${date(close)}`;
          },
          render: (row) => {
            const open = row.order_open_at ?? row.orderOpenAt;
            const close = row.order_close_at ?? row.orderCloseAt;
            return row.code === 'READY-STOCK' ? 'Always Open' : `${date(open)} - ${date(close)}`;
          },
        },
        {
          key: 'status',
          label: 'Status',
          exportValue: (row) => {
            let currentStatus = row.status;
            const closeAt = row.order_close_at ?? row.orderCloseAt;
            const isExpired = closeAt && new Date() > new Date(closeAt);
            if (row.code !== 'READY-STOCK' && currentStatus === 'OPEN' && isExpired) {
              currentStatus = 'CLOSED';
            }
            return currentStatus || '-';
          },
          render: (row) => {
            let currentStatus = row.status;
            const closeAt = row.order_close_at ?? row.orderCloseAt;
            const isExpired = closeAt && new Date() > new Date(closeAt);
            if (row.code !== 'READY-STOCK' && currentStatus === 'OPEN' && isExpired) {
              currentStatus = 'CLOSED';
            }
            return <StatusBadge value={currentStatus} />;
          },
        },
      ]}
      canCreate={hasPermission('periods', 'create')}
      canEdit={hasPermission('periods', 'edit')}
      canDelete={hasPermission('periods', 'delete')}
      canDeleteRow={(row) => row.code !== 'READY-STOCK'}
      prepareSubmit={(form) => {
        if (form.code === 'READY-STOCK') {
          const { eventPeriod: _ep, ordersPeriod: _op, ...rest } = form;
          const openIso = new Date('2020-01-01T00:00:00.000Z').toISOString();
          const farIso = new Date('2099-12-31T23:59:59.000Z').toISOString();
          return {
            ...rest,
            code: 'READY-STOCK',
            status: 'OPEN',
            order_open_at: openIso,
            orderOpenAt: openIso,
            order_close_at: farIso,
            orderCloseAt: farIso,
            departure_at: farIso,
            departureAt: farIso,
            return_at: farIso,
            returnAt: farIso,
            estimated_shipping_at: farIso,
            estimatedShippingAt: farIso,
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
        const estShip = form.estimated_shipping_at || form.estimatedShippingAt;

        return {
          ...rest,
          order_open_at: orderOpenAt ? orderOpenAt.toISOString() : undefined,
          orderOpenAt: orderOpenAt ? orderOpenAt.toISOString() : undefined,
          order_close_at: orderCloseAt ? orderCloseAt.toISOString() : undefined,
          orderCloseAt: orderCloseAt ? orderCloseAt.toISOString() : undefined,
          departure_at: departureAt ? departureAt.toISOString() : undefined,
          departureAt: departureAt ? departureAt.toISOString() : undefined,
          return_at: returnAt ? returnAt.toISOString() : undefined,
          returnAt: returnAt ? returnAt.toISOString() : undefined,
          estimated_shipping_at: estShip ? new Date(estShip).toISOString() : undefined,
          estimatedShippingAt: estShip ? new Date(estShip).toISOString() : undefined,
          maxItems: form.maxItems ? Number(form.maxItems) : null,
          baggageCapacityKg: form.baggageCapacityKg ? Number(form.baggageCapacityKg) : null,
        };
      }}
      prepareInitial={(row) => {
        let currentStatus = row.status;
        const closeAt = row.order_close_at ?? row.orderCloseAt;
        const depAt = row.departure_at ?? row.departureAt;
        const retAt = row.return_at ?? row.returnAt;
        const openAt = row.order_open_at ?? row.orderOpenAt;
        const estShip = row.estimated_shipping_at ?? row.estimatedShippingAt;

        if (currentStatus === 'OPEN' && closeAt && new Date() > new Date(closeAt)) {
          currentStatus = 'CLOSED';
        }
        return {
          ...row,
          status: currentStatus,
          eventPeriod: [
            depAt ? dayjs(depAt).format('YYYY-MM-DDTHH:mm') : '',
            retAt ? dayjs(retAt).format('YYYY-MM-DDTHH:mm') : ''
          ],
          ordersPeriod: [
            openAt ? dayjs(openAt).format('YYYY-MM-DDTHH:mm') : '',
            closeAt ? dayjs(closeAt).format('YYYY-MM-DDTHH:mm') : ''
          ],
          estimatedShippingAt: estShip ? dayjs(estShip).format('YYYY-MM-DDTHH:mm') : '',
        };
      }}
      importConfig={{
        entityType: 'events',
        sampleFileName: 'events-template.xlsx',
      }}
    />
  );
}
