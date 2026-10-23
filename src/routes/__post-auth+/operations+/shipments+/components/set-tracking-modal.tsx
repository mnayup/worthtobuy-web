import React, { useState, useEffect, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, Truck, AlertCircle, AlertTriangle } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import {
  isShipmentFullyPaid,
  getShipmentItems,
  getShipmentOrders,
  getShipmentOrderNumbers,
  type Shipment,
  type ShippingCounter,
} from '../types';
import dayjs from 'dayjs';
import { SetTrackingItemsPreview } from './set-tracking-items-preview';
import {
  SetTrackingCourierFields,
  COMMON_COURIERS,
} from './set-tracking-courier-fields';
import { SetTrackingAdditionalFields } from './set-tracking-additional-fields';

interface SetTrackingModalProps {
  open: boolean;
  shipment: Shipment | null;
  onClose: () => void;
  onSaved: () => void;
}

export function SetTrackingModal({
  open,
  shipment,
  onClose,
  onSaved,
}: SetTrackingModalProps) {
  const [shippingCounters, setShippingCounters] = useState<ShippingCounter[]>([]);
  const [shippingCounterId, setShippingCounterId] = useState<number | null>(null);
  const [courier, setCourier] = useState('JNE');
  const [customCourier, setCustomCourier] = useState('');
  const [serviceType, setServiceType] = useState('Regular (REG)');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [address, setAddress] = useState('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [actualShippingCost, setActualShippingCost] = useState<string>('');
  const [shopeeRefundAmount, setShopeeRefundAmount] = useState<string>('');
  const [shopeeUsername, setShopeeUsername] = useState<string>('');
  const [shippedAt, setShippedAt] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      api
        .get('/shipping-counters?limit=200')
        .then((res) => {
          const items = res.data?.data || res.data || [];
          setShippingCounters(items);
        })
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (open && shipment) {
      const rawCounterId = shipment.shipping_counter_id ?? shipment.shippingCounterId;
      setShippingCounterId(rawCounterId ? Number(rawCounterId) : null);

      const isKnown = COMMON_COURIERS.includes(shipment.courier || 'JNE');
      setCourier(isKnown ? shipment.courier || 'JNE' : 'Other');
      setCustomCourier(isKnown ? '' : shipment.courier || '');
      const rawWeight = shipment.weight_kg ?? shipment.weightKg;
      const rawActual = shipment.actual_shipping_cost ?? shipment.actualShippingCost;
      const rawShippedAt = shipment.shipped_at || shipment.shippedAt;

      setServiceType(shipment.service_type || shipment.serviceType || 'Regular (REG)');
      setTrackingNumber(shipment.tracking_number || shipment.trackingNumber || '');
      setAddress(shipment.address || shipment.customer?.address || '');
      setWeightKg(rawWeight !== null && rawWeight !== undefined ? String(rawWeight) : '');
      setActualShippingCost(rawActual !== null && rawActual !== undefined ? String(rawActual) : '');
      const rawShopeeRefund = shipment.shopee_refund_amount ?? shipment.shopeeRefundAmount;
      setShopeeRefundAmount(
        rawShopeeRefund !== null && rawShopeeRefund !== undefined ? String(rawShopeeRefund) : ''
      );
      setShopeeUsername(shipment.shopee_username || shipment.shopeeUsername || '');
      setProofUrl(shipment.proof_url || shipment.proofUrl || '');
      setNotes(shipment.notes || '');

      if (rawShippedAt) {
        setShippedAt(dayjs(rawShippedAt).format('YYYY-MM-DDTHH:mm'));
      } else {
        setShippedAt(dayjs().format('YYYY-MM-DDTHH:mm'));
      }
      setError('');
    }
  }, [open, shipment]);

  if (!open || !shipment) return null;

  const effectiveCourier = courier === 'Other' ? customCourier.trim() : courier;
  const isShopee =
    effectiveCourier.toLowerCase().includes('shopee') ||
    shipment.shipping_method === 'SHOPEE' ||
    shipment.shippingMethod === 'SHOPEE';
  const totalBill = getShipmentOrders(shipment).reduce(
    (sum, ord) => sum + Number(ord?.total_bill ?? ord?.totalBill ?? 0),
    0
  );
  const items = getShipmentItems(shipment);
  const fullyPaid = isShipmentFullyPaid(shipment);
  const isNotPackedYet = shipment.status === 'WAITING_PACKING';
  const estimatedCost = Number(
    shipment.shipping_cost ??
      shipment.shippingCost ??
      shipment.order?.customer_shipping ??
      shipment.order?.customerShipping ??
      0
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!shipment) return;

    if (isNotPackedYet) {
      setError('Pesanan harus dipacking terlebih dahulu sebelum input nomor resi.');
      return;
    }

    if (!fullyPaid) {
      setError('Penginputan nomor resi tidak dapat dilakukan karena pesanan belum lunas.');
      return;
    }

    if (!trackingNumber.trim()) {
      setError('Nomor Resi (Tracking Number) wajib diisi.');
      return;
    }

    if (!effectiveCourier) {
      setError('Silakan pilih atau isi nama Kurir.');
      return;
    }

    if (!isShopee && (!actualShippingCost || isNaN(Number(actualShippingCost)))) {
      setError('Aktual ongkir wajib diisi angka valid.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.put(`/shipments/${shipment.id}`, {
        trackingNumber: trackingNumber.trim(),
        courier: effectiveCourier,
        shippingCounterId: shippingCounterId || null,
        shipping_counter_id: shippingCounterId || null,
        serviceType: serviceType.trim() || (isShopee ? 'Checkout Shopee' : null),
        address: address.trim(),
        weightKg: weightKg ? Number(weightKg) : null,
        actualShippingCost: isShopee ? 0 : Number(actualShippingCost),
        shopeeRefundAmount: isShopee ? Number(shopeeRefundAmount || 0) : null,
        shippingMethod: isShopee ? 'SHOPEE' : 'MANUAL',
        shopeeUsername: isShopee
          ? shopeeUsername || shipment.shopee_username || shipment.shopeeUsername || null
          : null,
        shippedAt: shippedAt ? new Date(shippedAt).toISOString() : new Date().toISOString(),
        proofUrl: proofUrl.trim() || null,
        notes: notes.trim() || null,
      });
      onSaved();
      onClose();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className={
        'fixed inset-0 z-[100] flex items-end justify-center ' +
        'bg-brand-900/50 backdrop-blur-sm sm:items-center sm:p-4'
      }
    >
      <div
        className={
          'w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl bg-white ' +
          'shadow-2xl sm:rounded-3xl overflow-hidden border border-brand-100 ' +
          'animate-in fade-in-0 zoom-in-95 duration-200'
        }
      >
        {/* Header */}
        <div
          className={
            'flex items-center justify-between border-b border-brand-100 px-6 py-4 ' +
            'bg-gradient-to-r from-brand-50/80 via-white to-indigo-50/50'
          }
        >
          <div className="flex items-center gap-3">
            <div
              className={
                'flex h-11 w-11 items-center justify-center rounded-2xl ' +
                'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              }
            >
              <Truck size={22} />
            </div>
            <div>
              <h2 className="font-black text-brand-900 text-lg tracking-tight">
                {shipment.trackingNumber || shipment.tracking_number
                  ? 'Update Resi & Aktual Ongkir'
                  : 'Input Resi & Aktual Ongkir'}
              </h2>
              <p className="text-xs text-brand-500 font-medium">
                Order{' '}
                <strong className="font-bold text-brand-800">
                  {getShipmentOrderNumbers(shipment).join(', ') || '-'}
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
              'rounded-xl p-2 text-brand-400 hover:bg-brand-100 ' +
              'hover:text-brand-700 transition cursor-pointer'
            }
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
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

          {isNotPackedYet && (
            <div
              className={
                'rounded-2xl border border-amber-300 bg-amber-50/90 p-4 ' +
                'text-xs text-amber-900 flex items-start gap-3 shadow-xs'
              }
            >
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-950 text-sm block">
                  Pesanan Belum Dipacking (Status: Waiting Packing)
                </strong>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Nomor resi dan aktual ongkir tidak dapat diinput sebelum barang selesai
                  dipacking dan label dibuat. Mohon klik tombol <strong>Pack</strong> terlebih
                  dahulu.
                </p>
              </div>
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
                <strong className="font-bold text-rose-900 text-sm block">
                  Status Pembayaran: Belum Lunas (Full Payment Required)
                </strong>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  Penginputan nomor resi tidak dapat diproses karena pembayaran pesanan ini belum
                  lunas.
                </p>
              </div>
            </div>
          )}

          <SetTrackingItemsPreview items={items} />

          <SetTrackingCourierFields
            address={address}
            setAddress={setAddress}
            courier={courier}
            setCourier={setCourier}
            customCourier={customCourier}
            setCustomCourier={setCustomCourier}
            serviceType={serviceType}
            setServiceType={setServiceType}
            trackingNumber={trackingNumber}
            setTrackingNumber={setTrackingNumber}
            shippingCounters={shippingCounters}
            shippingCounterId={shippingCounterId}
            setShippingCounterId={setShippingCounterId}
          />

          <SetTrackingAdditionalFields
            weightKg={weightKg}
            setWeightKg={setWeightKg}
            estimatedCost={estimatedCost}
            actualShippingCost={actualShippingCost}
            setActualShippingCost={setActualShippingCost}
            isShopee={isShopee}
            shopeeRefundAmount={shopeeRefundAmount}
            setShopeeRefundAmount={setShopeeRefundAmount}
            shopeeUsername={shopeeUsername || shipment.shopee_username || shipment.shopeeUsername || ''}
            totalBill={totalBill}
            shippedAt={shippedAt}
            setShippedAt={setShippedAt}
            proofUrl={proofUrl}
            setProofUrl={setProofUrl}
            notes={notes}
            setNotes={setNotes}
            orderNumber={getShipmentOrderNumbers(shipment).join(', ') || '-'}
            saving={saving}
            fullyPaid={fullyPaid && !isNotPackedYet}
            trackingNumber={trackingNumber}
            onClose={onClose}
          />
        </form>
      </div>
    </div>,
    document.body
  );
}
