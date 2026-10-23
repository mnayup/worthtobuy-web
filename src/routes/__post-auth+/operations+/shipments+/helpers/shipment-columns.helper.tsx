import React from 'react';
import { AlertCircle, Box, Check, Copy, ShoppingBag } from 'lucide-react';
import { money, number } from '~/lib/format';
import { StatusBadge } from '~/components/StatusBadge';
import { isShipmentFullyPaid, getShipmentItems, getShipmentOrderNumbers, type Shipment } from '../types';

export function getShipmentColumns({
  copiedId,
  onCopy,
  onOpenDetail,
}: {
  copiedId: number | null;
  onCopy: (id: number, text: string) => void;
  onOpenDetail: (shipment: Shipment) => void;
}) {
  return [
    {
      key: 'trackingNumber',
      label: 'Tracking # (Resi)',
      render: (row: Shipment) => {
        const tracking = row.tracking_number || row.trackingNumber;
        const service = row.service_type || row.serviceType;
        const isShopee =
          (row.courier || '').toLowerCase().includes('shopee') ||
          row.shipping_method === 'SHOPEE' ||
          row.shippingMethod === 'SHOPEE';
        const shopeeUser = row.shopee_username || row.shopeeUsername;

        return tracking ? (
          <div className="flex items-center gap-1.5">
            <div className="flex flex-col">
              <span className="font-mono font-black text-brand-900 text-xs tracking-wider">
                {tracking}
              </span>
              <span className="text-[10px] text-brand-500 font-semibold flex items-center gap-1">
                {row.shipping_counter?.name || row.shippingCounter?.name ? (
                  <span className="text-brand-700 font-bold">
                    {row.shipping_counter?.name || row.shippingCounter?.name} •{' '}
                  </span>
                ) : null}
                {isShopee ? (
                  <span className="inline-flex items-center gap-0.5 text-orange-700 font-bold">
                    <ShoppingBag size={10} /> Shopee {shopeeUser ? `(@${shopeeUser.replace(/^@/, '')})` : ''}
                  </span>
                ) : (
                  `${row.courier || 'JNE'} ${service ? `• ${service}` : ''}`
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopy(row.id, tracking);
              }}
              className={
                'rounded-lg p-1 text-brand-400 hover:bg-brand-100 ' +
                'hover:text-brand-700 transition cursor-pointer'
              }
              title="Copy Resi"
            >
              {copiedId === row.id ? (
                <Check size={13} className="text-emerald-600" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1 items-start">
            <span
              className={
                'inline-flex items-center gap-1 rounded-lg bg-amber-50 ' +
                'border border-amber-200/80 px-2 py-0.5 text-[11px] font-bold text-amber-700'
              }
            >
              <AlertCircle size={12} />
              Awaiting Resi
            </span>
            {isShopee && (
              <span className="inline-flex items-center gap-1 rounded bg-orange-50 border border-orange-200 px-1.5 py-0.5 text-[10px] font-extrabold text-orange-700">
                <ShoppingBag size={10} /> Shopee {shopeeUser ? `(@${shopeeUser.replace(/^@/, '')})` : ''}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row: Shipment) => {
        const custName = row.customer?.full_name || row.customer?.fullName || '-';
        const custCode = row.customer?.customer_code || row.customer?.customerCode;
        const phone = row.customer?.whatsapp;
        return (
          <div className="flex flex-col max-w-[170px]">
            <span className="font-bold text-brand-900 text-xs truncate" title={custName}>
              {custName}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-brand-500 font-medium">
              {custCode && <span className="font-mono text-brand-600 font-semibold">{custCode}</span>}
              {custCode && phone && <span>•</span>}
              {phone && <span className="truncate">{phone}</span>}
            </div>
          </div>
        );
      },
    },
    {
      key: 'order',
      label: 'Order',
      render: (row: Shipment) => {
        const orderNumbers = getShipmentOrderNumbers(row);
        const isMerged = orderNumbers.length > 1;

        return (
          <div className="flex flex-col gap-1 max-w-[160px]">
            {isMerged ? (
              <>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-brand-900 text-xs font-mono">
                    {orderNumbers[0]}
                  </span>
                  <span
                    className={
                      'rounded-md bg-purple-50 border border-purple-200 px-1.5 py-0.5 ' +
                      'text-[10px] font-extrabold text-purple-700 shadow-xs'
                    }
                    title={`Merged orders in this shipment:\n${orderNumbers.join('\n')}`}
                  >
                    +{orderNumbers.length - 1} merged
                  </span>
                </div>
                <span
                  className="text-[10px] text-purple-600 font-medium truncate"
                  title={orderNumbers.join(', ')}
                >
                  {orderNumbers.slice(1).join(', ')}
                </span>
              </>
            ) : (
              <span className="font-bold text-brand-900 text-xs font-mono">
                {orderNumbers[0] || row.order?.order_number || row.order?.orderNumber || '-'}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'itemsToPack',
      label: 'Items to Pack',
      render: (row: Shipment) => {
        const items = getShipmentItems(row);
        if (!items.length) {
          return <span className="text-brand-400 text-xs italic">No items listed</span>;
        }
        const totalPcs = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

        return (
          <div
            className="flex flex-col max-w-[240px] cursor-pointer group"
            onClick={() => onOpenDetail(row)}
            title={
              `Click to view checklist:\n` +
              items
                .map((it) => {
                  const name =
                    it.product?.name ||
                    it.manual_product_name ||
                    it.manualProductName ||
                    'Item';
                  return `• ${it.quantity}x ${name}`;
                })
                .join('\n')
            }
          >
            <div
              className={
                'flex items-center gap-1.5 text-xs font-semibold text-brand-900 ' +
                'truncate group-hover:text-indigo-600 transition'
              }
            >
              <Box size={13} className="text-amber-500 shrink-0" />
              <span className="truncate">
                {items[0]?.product?.name ||
                  items[0]?.manual_product_name ||
                  items[0]?.manualProductName ||
                  'Item'}
              </span>
              {items.length > 1 && (
                <span
                  className={
                    'rounded bg-indigo-50 border border-indigo-200 px-1 py-0.2 ' +
                    'text-[10px] font-bold text-indigo-700 shrink-0'
                  }
                >
                  +{items.length - 1} more
                </span>
              )}
            </div>
            <span className="text-[10px] text-brand-400 font-medium">
              Total: {totalPcs} pcs ({items.length} line{items.length > 1 ? 's' : ''})
            </span>
          </div>
        );
      },
    },
    {
      key: 'address',
      label: 'Destination Address',
      render: (row: Shipment) => (
        <span
          className={
            !row.address || row.address === '-'
              ? 'text-amber-600 font-medium text-xs'
              : 'text-xs text-brand-700 max-w-[190px] truncate block'
          }
          title={row.address}
        >
          {!row.address || row.address === '-' ? 'Address not specified' : row.address}
        </span>
      ),
    },
    {
      key: 'weightKg',
      label: 'Weight',
      render: (row: Shipment) => {
        const weight = row.weight_kg ?? row.weightKg;
        return (
          <span className="text-xs text-brand-700 font-medium">
            {weight ? `${number(weight)} kg` : '-'}
          </span>
        );
      },
    },
    {
      key: 'shippingCost',
      label: 'Shipping Fee (Est / Act)',
      render: (row: Shipment) => {
        const isShopee =
          (row.courier || '').toLowerCase().includes('shopee') ||
          row.shipping_method === 'SHOPEE' ||
          row.shippingMethod === 'SHOPEE';
        const shopeeRefund = row.shopee_refund_amount ?? row.shopeeRefundAmount;

        if (isShopee) {
          return (
            <div className="flex flex-col text-xs space-y-0.5">
              <span className="font-bold text-orange-700">Checkout Shopee</span>
              {shopeeRefund !== null && shopeeRefund !== undefined && Number(shopeeRefund) > 0 ? (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-1 rounded w-fit">
                  Refund: Rp{Number(shopeeRefund).toLocaleString('id-ID')}
                </span>
              ) : (
                <span className="text-[10px] text-brand-400">Gratis Ongkir CO</span>
              )}
            </div>
          );
        }

        const est = Number(row.shipping_cost ?? row.shippingCost ?? 0);
        const act = row.actual_shipping_cost ?? row.actualShippingCost;
        const diff = row.shipping_cost_difference ?? row.shippingCostDifference;

        return (
          <div className="flex flex-col text-xs space-y-0.5">
            <span className="font-bold text-brand-900">
              {act !== null && act !== undefined ? money(Number(act)) : money(est)}
            </span>
            {act !== null && act !== undefined && (
              <span className="text-[10px] text-brand-500">Est: {money(est)}</span>
            )}
            {diff !== null && diff !== undefined && Number(diff) > 0 && (
              <span
                className={
                  'text-[10px] font-bold text-amber-800 bg-amber-100/70 ' +
                  'px-1 rounded w-fit'
                }
              >
                +Rp{Number(diff).toLocaleString('id-ID')} (Kurang)
              </span>
            )}
            {diff !== null && diff !== undefined && Number(diff) < 0 && (
              <span
                className={
                  'text-[10px] font-bold text-emerald-800 bg-emerald-100/70 ' +
                  'px-1 rounded w-fit'
                }
              >
                -Rp{Math.abs(Number(diff)).toLocaleString('id-ID')} (Refund)
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (row: Shipment) => {
        const fullyPaid = isShipmentFullyPaid(row);
        if (fullyPaid) {
          return (
            <span
              className={
                'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 ' +
                'border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700'
              }
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Full Payment
            </span>
          );
        }
        const remaining = Number(
          row.order?.outstanding_amount ?? row.order?.outstandingAmount ?? 0
        );
        return (
          <span
            className={
              'inline-flex items-center gap-1.5 rounded-full bg-rose-50 ' +
              'border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-rose-700'
            }
            title={
              remaining > 0
                ? `Unpaid balance: Rp${remaining.toLocaleString('id-ID')}`
                : 'Payment not settled'
            }
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Not Full Payment
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Shipment) => <StatusBadge value={row.status} />,
    },
  ];
}
