import React from 'react';
import { MapPin, Truck, Hash } from 'lucide-react';

export const COMMON_COURIERS = [
  'JNE',
  'J&T Express',
  'SiCepat',
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
}: SetTrackingCourierFieldsProps) {
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
          <label className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
            <Truck size={13} className="text-brand-500" />
            Shipping Courier <span className="text-cherry-500">*</span>
          </label>
          <select
            className="input !h-10 text-xs"
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
          >
            {COMMON_COURIERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {courier === 'Other' && (
            <input
              type="text"
              required
              className="input !h-9 text-xs mt-1.5"
              placeholder="Enter courier name..."
              value={customCourier}
              onChange={(e) => setCustomCourier(e.target.value)}
            />
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
