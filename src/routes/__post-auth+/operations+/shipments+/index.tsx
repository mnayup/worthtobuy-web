import React, { useMemo, useState, useEffect } from 'react';
import { GitMerge } from 'lucide-react';
import { CrudPage } from '~/components/CrudPage';
import { api } from '~/lib/api';
import type { FieldConfig } from '~/types';
import type { Shipment } from './types';
import { ShipmentDetailModal } from './components/shipment-detail-modal';
import { PackingModal } from './components/packing-modal';
import { SetTrackingModal } from './components/set-tracking-modal';
import { ConfirmDeliveredModal } from './components/confirm-delivered-modal';
import { MergeShipmentsModal } from './components/merge-shipments-modal';
import { SplitShipmentModal } from './components/split-shipment-modal';
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
  const [mergingShipments, setMergingShipments] = useState<Shipment[] | null>(null);
  const [splittingShipment, setSplittingShipment] = useState<Shipment | null>(null);
  const [clearSelectionCallback, setClearSelectionCallback] = useState<(() => void) | null>(null);
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
          'Shipments are automatically bundled by invoice & customer. ' +
          'Manage packing, merge eligible customer shipments, split multi-order packages, and track courier delivery.'
        }
        endpoint="/shipments"
        fields={fields}
        canCreate={false}
        canEdit={false}
        canDelete={false}
        selectable={true}
        canSelectRow={(row: Shipment, selectedRows: Shipment[] = []) => {
          // Merging is only allowed if shipment is not yet packed (WAITING_PACKING and not packed_at)
          if (row.status !== 'WAITING_PACKING' || Boolean(row.packed_at || row.packedAt)) {
            return false;
          }
          // If rows are already selected, can only select shipments for the SAME customer!
          if (selectedRows && selectedRows.length > 0) {
            const activeCustomerId = selectedRows[0]?.customer_id ?? selectedRows[0]?.customerId;
            const rowCustomerId = row.customer_id ?? row.customerId;
            return rowCustomerId === activeCustomerId;
          }
          return true;
        }}
        getSelectDisabledReason={(row: Shipment, selectedRows: Shipment[] = []) => {
          if (row.status !== 'WAITING_PACKING' || Boolean(row.packed_at || row.packedAt)) {
            return 'Merging is only possible if shipment is not yet packed (Waiting Packing status).';
          }
          if (selectedRows && selectedRows.length > 0) {
            const activeCustomerId = selectedRows[0]?.customer_id ?? selectedRows[0]?.customerId;
            const rowCustomerId = row.customer_id ?? row.customerId;
            if (rowCustomerId !== activeCustomerId) {
              const activeCustName =
                selectedRows[0]?.customer?.full_name ||
                selectedRows[0]?.customer?.fullName ||
                'selected customer';
              return `Can only merge shipments for the same customer (${activeCustName}).`;
            }
          }
          return undefined;
        }}
        renderBulkActions={({ selectedRows, clearSelection }) => {
          if (selectedRows.length < 2) {
            const activeCustName =
              selectedRows[0]?.customer?.full_name ||
              selectedRows[0]?.customer?.fullName ||
              'customer';
            return (
              <div className="flex items-center justify-between rounded-2xl bg-purple-50/80 border border-purple-200/90 px-4 py-2.5 text-xs text-purple-900 shadow-xs animate-in fade-in-0 duration-200">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-purple-700 bg-white border border-purple-200 px-2 py-0.5 rounded-md shadow-2xs">
                    {selectedRows.length} selected
                  </span>
                  <span>
                    Select at least <strong>2 shipments</strong> for customer <strong>{activeCustName}</strong> to merge them into 1 shipment.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-purple-700 hover:text-purple-900 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            );
          }

          const activeCustName =
            selectedRows[0]?.customer?.full_name ||
            selectedRows[0]?.customer?.fullName ||
            'Customer';

          return (
            <div className="flex items-center justify-between rounded-2xl bg-purple-600 px-5 py-3 text-xs text-white shadow-lg shadow-purple-600/25 animate-in fade-in-0 duration-200">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white shadow-xs">
                  <GitMerge size={18} />
                </div>
                <div>
                  <span className="font-black text-sm block">
                    {selectedRows.length} Shipments Ready to Merge
                  </span>
                  <span className="text-purple-100 text-[11px]">
                    Customer: <strong>{activeCustName}</strong> • Consolidate items into 1 package
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-xl px-3 py-1.5 font-bold text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMergingShipments(selectedRows);
                    setClearSelectionCallback(() => clearSelection);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-black text-purple-900 shadow-md hover:bg-purple-50 active:scale-98 transition cursor-pointer"
                >
                  <GitMerge size={15} className="text-purple-700" />
                  <span>Merge ({selectedRows.length}) Shipments</span>
                </button>
              </div>
            </div>
          );
        }}
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
            onOpenSplit: (s) => setSplittingShipment(s),
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
        onOpenSplit={(shipment) => setSplittingShipment(shipment)}
      />

      <MergeShipmentsModal
        open={Boolean(mergingShipments)}
        shipments={mergingShipments || []}
        courierOptions={courierOptions}
        onClose={() => setMergingShipments(null)}
        onMerged={() => {
          if (clearSelectionCallback) {
            clearSelectionCallback();
            setClearSelectionCallback(null);
          }
          setRefreshKey((k) => k + 1);
          fetchSummary();
        }}
      />

      <SplitShipmentModal
        open={Boolean(splittingShipment)}
        shipment={splittingShipment}
        onClose={() => setSplittingShipment(null)}
        onSplit={() => {
          setRefreshKey((k) => k + 1);
          fetchSummary();
        }}
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

