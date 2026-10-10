import React, { useMemo, useState, useEffect } from 'react';
import { CrudPage } from '~/components/CrudPage';
import { api } from '~/lib/api';
import type { FieldConfig } from '~/types';
import { isShipmentFullyPaid, type Shipment } from './types';
import { ShipmentDetailModal } from './components/shipment-detail-modal';
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
  const [trackingShipment, setTrackingShipment] = useState<Shipment | null>(null);
  const [deliveringShipment, setDeliveringShipment] = useState<Shipment | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [rowActionLoadingId, setRowActionLoadingId] = useState<number | null>(null);

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

  const handleQuickPack = async (shipment: Shipment) => {
    if (!isShipmentFullyPaid(shipment)) {
      alert('Proses packing tidak dapat dilakukan karena pesanan belum lunas.');
      return;
    }
    setRowActionLoadingId(shipment.id);
    try {
      await api.put(`/shipments/${shipment.id}`, { status: 'PACKED' });
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      console.error('Failed to pack shipment:', err);
      alert(err.response?.data?.message || 'Failed to pack shipment');
    } finally {
      setRowActionLoadingId(null);
    }
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
            options: [
              { label: 'JNE', value: 'JNE' },
              { label: 'J&T Express', value: 'J&T' },
              { label: 'SiCepat', value: 'SiCepat' },
              { label: 'Paxel', value: 'Paxel' },
              { label: 'Lion Parcel', value: 'Lion Parcel' },
              { label: 'Anteraja', value: 'Anteraja' },
              { label: 'GoSend', value: 'GoSend' },
              { label: 'GrabExpress', value: 'GrabExpress' },
            ],
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
            rowActionLoadingId,
            onQuickPack: handleQuickPack,
            onOpenSetTracking: (s) => setTrackingShipment(s),
            onOpenConfirmDelivered: (s) => setDeliveringShipment(s),
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
        onOpenSetTracking={(shipment) => setTrackingShipment(shipment)}
        onOpenConfirmDelivered={(shipment) => setDeliveringShipment(shipment)}
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
