import React, { useMemo, useState, useEffect } from 'react';
import { CrudPage } from '~/components/CrudPage';
import { api } from '~/lib/api';
import type { FieldConfig } from '~/types';
import type { Shipment } from './types';
import { ShipmentDetailModal } from './components/shipment-detail-modal';
import { PackingModal } from './components/packing-modal';
import { SetTrackingModal } from './components/set-tracking-modal';
import { ConfirmDeliveredModal } from './components/confirm-delivered-modal';
import { ShipmentStatusCards } from './components/shipment-status-cards';
import { getShipmentColumns } from './helpers/shipment-columns.helper';
import { renderShipmentRowActions } from './helpers/shipment-actions.helper';

export default function ShipmentsRoute() {
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [detailShipment, setDetailShipment] = useState<Shipment | null>(null);
  const [packingShipment, setPackingShipment] = useState<Shipment | null>(null);
  const [trackingShipment, setTrackingShipment] = useState<Shipment | null>(null);
  const [deliveringShipment, setDeliveringShipment] = useState<Shipment | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [courierOptions, setCourierOptions] = useState<Array<{ label: string; value: string }>>([
    { label: 'JNE', value: 'JNE' },
    { label: 'J&T Express', value: 'J&T' },
    { label: 'SiCepat', value: 'SiCepat' },
    { label: 'Paxel', value: 'Paxel' },
    { label: 'Lion Parcel', value: 'Lion Parcel' },
    { label: 'Anteraja', value: 'Anteraja' },
    { label: 'GoSend', value: 'GoSend' },
    { label: 'GrabExpress', value: 'GrabExpress' },
  ]);

  useEffect(() => {
    api
      .get('/shipping-counters?limit=200')
      .then((res) => {
        const items = res.data?.data || res.data || [];
        if (Array.isArray(items) && items.length > 0) {
          const courierMap = new Map<string, string>();
          items.forEach((item: any) => {
            if (item.courier) {
              courierMap.set(item.courier, item.courier);
            }
          });
          if (courierMap.size > 0) {
            setCourierOptions(
              Array.from(courierMap.keys()).map((courier) => ({
                label: courier,
                value: courier,
              }))
            );
          }
        }
      })
      .catch(() => {});
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/shipments/summary');
      setSummary(res.data || {});
    } catch (err) {
      console.error('Failed to load shipment summary:', err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [refreshKey]);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fields = useMemo<FieldConfig[]>(
    () => [
      { name: 'trackingNumber', label: 'Tracking Number (Resi)' },
      { name: 'courier', label: 'Courier' },
      { name: 'serviceType', label: 'Service Type' },
      { name: 'address', label: 'Delivery Address' },
      { name: 'notes', label: 'Notes' },
    ],
    []
  );

  const columns = useMemo(
    () =>
      getShipmentColumns({
        copiedId,
        onCopy: handleCopy,
        onOpenDetail: (shipment) => setDetailShipment(shipment),
      }),
    [copiedId]
  );

  return (
    <>
      <CrudPage
        title="Shipments & Delivery"
        description={
          'Shipments are automatically generated when orders are purchased. ' +
          'Manage warehouse packing, courier tracking (Resi), and customer delivery.'
        }
        endpoint="/shipments"
        fields={fields}
        canCreate={false}
        canEdit={false}
        canDelete={false}
        extraQuery={{ ...(selectedStatus ? { status: selectedStatus } : {}), refreshKey }}
        searchPlaceholder="Search resi, customer name, courier, order number, item name..."
        filters={[
          {
            key: 'status',
            label: 'Shipment Status',
            placeholder: 'All Status',
            options: [
              { label: 'Awaiting Packing', value: 'WAITING_PACKING' },
              { label: 'Packed', value: 'PACKED' },
              { label: 'Waiting Settlement', value: 'WAITING_SETTLEMENT' },
              { label: 'In Transit', value: 'IN_TRANSIT' },
              { label: 'Delivered', value: 'DELIVERED' },
              { label: 'Failed', value: 'FAILED' },
              { label: 'Returned', value: 'RETURNED' },
            ],
          },
          {
            key: 'courier',
            label: 'Courier',
            placeholder: 'All Couriers',
            options: courierOptions,
          },
        ]}
        topContent={
          <ShipmentStatusCards
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
            summary={summary}
          />
        }
        columns={columns}
        renderActions={(row: Shipment) =>
          renderShipmentRowActions({
            row,
            onOpenDetail: (s) => setDetailShipment(s),
          })
        }
      />

      <ShipmentDetailModal
        open={Boolean(detailShipment)}
        shipment={detailShipment}
        onClose={() => setDetailShipment(null)}
        onSaved={() => {
          setRefreshKey((k) => k + 1);
          fetchSummary();
        }}
        onOpenPack={(shipment) => setPackingShipment(shipment)}
        onOpenSetTracking={(shipment) => setTrackingShipment(shipment)}
        onOpenConfirmDelivered={(shipment) => setDeliveringShipment(shipment)}
      />

      <PackingModal
        open={Boolean(packingShipment)}
        shipment={packingShipment}
        onClose={() => setPackingShipment(null)}
        onSaved={() => {
          setRefreshKey((k) => k + 1);
          fetchSummary();
        }}
      />

      <SetTrackingModal
        open={Boolean(trackingShipment)}
        shipment={trackingShipment}
        onClose={() => setTrackingShipment(null)}
        onSaved={() => {
          setRefreshKey((k) => k + 1);
          fetchSummary();
        }}
      />

      <ConfirmDeliveredModal
        open={Boolean(deliveringShipment)}
        shipment={deliveringShipment}
        onClose={() => setDeliveringShipment(null)}
        onConfirmed={() => {
          setRefreshKey((k) => k + 1);
          fetchSummary();
        }}
      />
    </>
  );
}
