import React from 'react';
import { MapPin, Truck, Hash } from 'lucide-react';
import { SearchableSelect } from '~/components/SearchableSelect';
import type { Option } from '~/types';

export const COMMON_COURIERS = [
  'JNE',
  'J&T Express',
  'SiCepat',
  'Shopee (Checkout Shopee)',
  'Paxel',
  'Lion Parcel',
  'Anteraja',
  'GoSend',
  'GrabExpress',
  'POS Indonesia',
  'TIKI',
  'Ninja Xpress',
  'Other',
];

export const COMMON_SERVICES = [
  'Regular (REG)',
  'Next Day / Express (YES / BEST)',
  'Cargo / JTR',
  'Same Day',
  'Instant',
  'Economy (ECO)',
];

import type { ShippingCounter } from '../types';

interface SetTrackingCourierFieldsProps {
  address: string;
  setAddress: (val: string) => void;
  courier: string;
  setCourier: (val: string) => void;
  customCourier: string;
  setCustomCourier: (val: string) => void;
  serviceType: string;
  setServiceType: (val: string) => void;
  trackingNumber: string;
  setTrackingNumber: (val: string) => void;
  shippingCounters?: ShippingCounter[];
  shippingCounterId?: number | null;
  setShippingCounterId?: (val: number | null) => void;
}

export function SetTrackingCourierFields({
  address,
  setAddress,
  courier,
  setCourier,
  customCourier,
  setCustomCourier,
  serviceType,
  setServiceType,
  trackingNumber,
  setTrackingNumber,
  shippingCounters = [],
  shippingCounterId = null,
  setShippingCounterId,
}: SetTrackingCourierFieldsProps) {
  const selectedCounter = shippingCounters.find((sc) => sc.id === shippingCounterId);

  const courierOptions: Option[] = [
    ...(shippingCounters.length > 0
      ? shippingCounters.map((sc) => ({
          label: `${sc.name}${sc.code && sc.code !== sc.name ? ` (${sc.code})` : ''}`,
          value: sc.name,
        }))
      : COMMON_COURIERS.filter((c) => c !== 'Other').map((c) => ({
          label: c,
          value: c,
        }))),
    ...(courier &&
    courier !== 'Other' &&
    !shippingCounters.some((c) => c.name === courier) &&
    !COMMON_COURIERS.includes(courier)
      ? [{ label: courier, value: courier }]
      : []),
    { label: 'Other / Custom Courier...', value: 'Other' },
  ];

  return (
    <>
      {/* Destination Address */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
          <MapPin size={13} className="text-brand-500" />
          Destination Address <span className="text-cherry-500">*</span>
        </label>
        <textarea
          rows={2}
          required
          className="input !py-2 text-xs leading-relaxed"
          placeholder="Full destination address for delivery"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {/* Courier & Service Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Truck size={13} className="text-brand-500" />
              Shipping Courier / Expedition <span className="text-cherry-500">*</span>
            </span>
            {shippingCounters.length > 0 && (
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                Master Data
              </span>
            )}
          </label>
          <SearchableSelect
            value={courier}
            placeholder="Search or select courier..."
            options={courierOptions}
            onChange={(val) => {
              const strVal = String(val || '');
              setCourier(strVal);
              const found = shippingCounters.find((c) => c.name === strVal);
              setShippingCounterId?.(found ? found.id : null);
            }}
          />
          {courier === 'Other' && (
            <input
              type="text"
              required
              className="input !h-9 text-xs mt-1.5"
              placeholder="Enter custom courier name..."
              value={customCourier}
              onChange={(e) => setCustomCourier(e.target.value)}
            />
          )}
          {selectedCounter && (selectedCounter.phone || selectedCounter.notes) && (
            <div className="text-[11px] text-brand-600 bg-brand-50/70 border border-brand-200/60 rounded-lg p-2 mt-1 space-y-0.5">
              {selectedCounter.phone && (
                <div className="text-brand-700 font-medium">Hotline / CS: {selectedCounter.phone}</div>
              )}
              {selectedCounter.notes && (
                <div className="text-brand-500 text-[10px]">{selectedCounter.notes}</div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-brand-700">Courier Service Type</label>
          <input
            type="text"
            list="service-suggestions"
            className="input !h-10 text-xs"
            placeholder="e.g. Regular (REG), Express (YES)"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
          />
          <datalist id="service-suggestions">
            {COMMON_SERVICES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Tracking Number (Resi) - Required Highlight */}
      <div
        className={
          'rounded-2xl border-2 border-indigo-200 bg-gradient-to-br ' +
          'from-indigo-50/50 to-white p-4 space-y-2 shadow-xs'
        }
      >
        <label
          className={
            'text-xs font-extrabold uppercase tracking-wider text-indigo-900 ' +
            'flex items-center justify-between'
          }
        >
          <span className="flex items-center gap-1.5">
            <Hash size={14} className="text-indigo-600" />
            Nomor Resi / Tracking Number <span className="text-cherry-500">*</span>
          </span>
          <span
            className={
              'text-[10px] font-semibold text-indigo-600 bg-indigo-100 ' +
              'px-2 py-0.5 rounded-full'
            }
          >
            Required for In Transit
          </span>
        </label>
        <input
          type="text"
          required
          className={
            'input !h-11 text-base font-black tracking-wider text-brand-900 ' +
            'border-indigo-300 focus:border-indigo-600 focus:ring-indigo-500/20'
          }
          placeholder="e.g. SOCAG00123456789"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
        />
        <p className="text-[11px] text-brand-500 font-medium">
          After setting this tracking number, customer can check delivery status.
        </p>
      </div>
    </>
  );
}
