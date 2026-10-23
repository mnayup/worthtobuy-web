import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, Package } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { StatusBadge } from '~/components/StatusBadge';
import { isShipmentFullyPaid, getShipmentItems, getShipmentOrders, getShipmentOrderNumbers, type Shipment } from '../types';
import { ShipmentDetailPipeline } from './shipment-detail-pipeline';
import { ShipmentDetailItemsCard } from './shipment-detail-items-card';
import { ShipmentDetailLogistics } from './shipment-detail-logistics';
import { ShipmentDetailFooter } from './shipment-detail-footer';

interface ShipmentDetailModalProps {
  open: boolean;
  shipment: Shipment | null;
  onClose: () => void;
  onSaved: () => void;
  onOpenPack?: (shipment: Shipment) => void;
  onOpenSetTracking?: (shipment: Shipment) => void;
  onOpenConfirmDelivered?: (shipment: Shipment) => void;
  onOpenSplit?: (shipment: Shipment) => void;
}

export function ShipmentDetailModal({
  open,
  shipment,
  onClose,
  onSaved,
  onOpenPack,
  onOpenSetTracking,
  onOpenConfirmDelivered,
  onOpenSplit,
}: ShipmentDetailModalProps) {
  const [copiedResi, setCopiedResi] = useState(false);
  const [packingLoading, setPackingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setCopiedResi(false);
      setError('');
    }
  }, [open, shipment]);

  if (!open || !shipment) return null;

  const currentStatus = shipment.status || 'WAITING_PACKING';
  const orders = getShipmentOrders(shipment);
  const items = getShipmentItems(shipment);
  const orderNumbers = getShipmentOrderNumbers(shipment);
  const isMerged = orders.length > 1;
  const totalItemsCount = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
  const fullyPaid = isShipmentFullyPaid(shipment);

  const copyTracking = () => {
    const trackingNum = shipment?.tracking_number || shipment?.trackingNumber;
    if (!trackingNum) return;
    navigator.clipboard.writeText(trackingNum);
    setCopiedResi(true);
    setTimeout(() => setCopiedResi(false), 2000);
  };

  const handleMarkAsPacked = async () => {
    if (!shipment) return;
    if (!fullyPaid) {
      setError('Proses packing tidak dapat dilakukan karena pesanan belum lunas.');
      return;
    }
    setPackingLoading(true);
    setError('');
    try {
      await api.put(`/shipments/${shipment.id}`, { status: 'PACKED' });
      onSaved();
      onClose();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPackingLoading(false);
    }
  };

  const cleanWaNumber = (shipment.customer?.whatsapp || '').replace(/[^0-9]/g, '');
  const waPrefix = cleanWaNumber.startsWith('0') ? `62${cleanWaNumber.slice(1)}` : cleanWaNumber;
  const custName = shipment.customer?.full_name || shipment.customer?.fullName || '';
  const orderNum = shipment.order?.order_number || shipment.order?.orderNumber || '';
  const waLink = cleanWaNumber
    ? `https://api.whatsapp.com/send/?phone=${waPrefix}&text=Halo%20kak%20${encodeURIComponent(
        custName
      )}%2C%20update%20pengiriman%20pesanan%20${orderNum}`
    : null;

  return createPortal(
    <div
      className={
        'fixed inset-0 z-[100] flex items-end justify-center ' +
        'bg-brand-900/50 backdrop-blur-sm sm:items-center sm:p-4 animate-in fade-in-0 duration-200'
      }
    >
      <div
        className={
          'w-full max-w-3xl max-h-[92vh] flex flex-col rounded-t-3xl ' +
          'bg-white shadow-2xl sm:rounded-3xl overflow-hidden border border-brand-100 ' +
          'animate-in zoom-in-95 duration-200'
        }
      >
        {/* Header */}
        <div
          className={
            'flex items-center justify-between border-b border-brand-100 px-6 py-4 ' +
            'bg-gradient-to-r from-brand-50/80 via-white to-brand-50/40'
          }
        >
          <div className="flex items-center gap-3">
            <div
              className={
                'flex h-11 w-11 items-center justify-center rounded-2xl ' +
                'bg-gradient-to-br from-indigo-500 to-brand-600 text-white ' +
                'shadow-md shadow-brand-600/20'
              }
            >
              <Package size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-brand-900 text-lg tracking-tight">
                  {shipment.trackingNumber || shipment.tracking_number || 'Awaiting Tracking (Resi)'}
                </h2>
                <StatusBadge value={currentStatus} />
                {isMerged && (
                  <span className="rounded-full bg-purple-100 text-purple-800 font-extrabold px-2.5 py-0.5 text-[10px]">
                    Merged ({orders.length} Orders)
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-500 font-medium">
                Order{' '}
                <strong className="font-bold text-brand-800">
                  {orderNumbers.join(', ') || '-'}
                </strong>{' '}
                • Customer{' '}
                <strong className="font-bold text-brand-800">
                  {shipment.customer?.fullName || shipment.customer?.full_name || '-'}
                </strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={
              'rounded-xl p-2 text-brand-400 hover:bg-brand-100/70 ' +
              'hover:text-brand-700 transition cursor-pointer'
            }
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div
              className={
                'rounded-2xl bg-cherry-50 border border-cherry-200/80 p-3.5 ' +
                'text-sm font-semibold text-cherry-700 flex items-center gap-2.5 shadow-xs'
              }
            >
              <AlertCircle size={18} className="shrink-0 text-cherry-600" />
              <span>{error}</span>
            </div>
          )}

          {!fullyPaid && (
            <div
              className={
                'rounded-2xl border border-rose-200 bg-rose-50/90 p-4 ' +
                'text-xs text-rose-800 flex items-start gap-3 shadow-xs'
              }
            >
              <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-rose-900 text-sm">
                  Status Pembayaran: Belum Lunas (Full Payment Required)
                </p>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  Proses packing dan penginputan nomor resi tidak dapat dilakukan sebelum
                  pembayaran pesanan ini lunas.
                  {shipment.order?.outstandingAmount
                    ? ` Sisa tagihan: Rp${Number(
                        shipment.order.outstandingAmount
                      ).toLocaleString('id-ID')}`
                    : ''}
                </p>
              </div>
            </div>
          )}

          <ShipmentDetailPipeline currentStatus={currentStatus} />

          <ShipmentDetailItemsCard
            items={items}
            totalItemsCount={totalItemsCount}
          />

          <ShipmentDetailLogistics
            shipment={shipment}
            waLink={waLink}
            copiedResi={copiedResi}
            onCopyTracking={copyTracking}
          />

          {shipment.notes && (
            <div
              className={
                'rounded-2xl border border-brand-100 bg-brand-50/30 p-3.5 ' +
                'text-xs text-brand-700'
              }
            >
              <span className="font-bold text-brand-900 block mb-1">Notes:</span>
              <p className="leading-relaxed whitespace-pre-wrap">{shipment.notes}</p>
            </div>
          )}
        </div>

        <ShipmentDetailFooter
          currentStatus={currentStatus}
          packingLoading={packingLoading}
          fullyPaid={fullyPaid}
          shipment={shipment}
          onClose={onClose}
          onOpenPack={onOpenPack}
          onOpenSetTracking={onOpenSetTracking}
          onOpenConfirmDelivered={onOpenConfirmDelivered}
          onOpenSplit={onOpenSplit}
        />
      </div>
    </div>,
    document.body
  );
}
