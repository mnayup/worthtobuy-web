import { titleCase } from '~/lib/format';
import type { Option } from '~/types';

export interface ShipmentOrderItem {
  id: number;
  orderId: number;
  productId?: number | null;
  manualProductName?: string | null;
  brandName?: string | null;
  variation?: string | null;
  size?: string | null;
  color?: string | null;
  quantity: number;
  fulfillmentStatus?: string;
  purchaseStatus?: string;
  photoUrl?: string | null;
  product?: {
    id: number;
    sku?: string;
    name: string;
    brandName?: string | null;
    imageUrl?: string | null;
  } | null;
}

export interface Shipment {
  id: number;
  trackingNumber?: string | null;
  orderId: number;
  customerId: number;
  address: string;
  courier: string;
  serviceType?: string | null;
  weightKg?: number | null;
  shippingCost: number;
  shippedAt?: string | null;
  status: string;
  proofUrl?: string | null;
  notes?: string | null;
  customer?: {
    id?: number;
    customerCode?: string;
    fullName: string;
    whatsapp?: string;
    email?: string | null;
    address?: string | null;
  };
  order?: {
    id: number;
    orderNumber: string;
    status?: string;
    customerNotes?: string | null;
    internalNotes?: string | null;
    totalBill?: number;
    paidAmount?: number;
    outstandingAmount?: number;
    customerShipping?: number;
    items?: ShipmentOrderItem[];
    invoiceLinks?: Array<{
      invoice?: {
        id: number;
        invoiceNumber: string;
        status: string;
        outstandingAmount: number;
        paidAmount: number;
        totalBill: number;
      };
    }>;
  };
}

export function isShipmentFullyPaid(shipment?: Shipment | null): boolean {
  if (!shipment?.order) return false;
  const order = shipment.order;

  // 1. If invoice exists, check whether invoice is fully paid
  if (order.invoiceLinks && order.invoiceLinks.length > 0) {
    const hasUnpaidInvoice = order.invoiceLinks.some((link) => {
      const inv = link.invoice;
      if (!inv) return false;
      return !['PAID', 'OVERPAID'].includes(inv.status) || Number(inv.outstandingAmount || 0) > 0;
    });
    if (hasUnpaidInvoice) return false;
  }

  // 2. Check order outstanding amount
  const outstanding = Number(order.outstandingAmount ?? 0);
  if (outstanding > 0) return false;

  // 3. Check paidAmount vs totalBill
  const totalBill = Number(order.totalBill ?? 0);
  const paid = Number(order.paidAmount ?? 0);
  if (totalBill > 0 && paid < totalBill) return false;

  // 4. Status check: if order is still waiting for DP, settlement, or new
  if (['NEW', 'WAITING_DP', 'DP_RECEIVED', 'WAITING_SETTLEMENT'].includes(order.status || '')) {
    return false;
  }

  return true;
}

export const shipmentStatuses = [
  'WAITING_PACKING',
  'PACKED',
  'READY',
  'HANDED_TO_COURIER',
  'IN_TRANSIT',
  'DELIVERED',
  'FAILED',
  'RETURNED',
];

export const shipmentStatusOptions: Option[] = shipmentStatuses.map((value) => ({
  value,
  label: titleCase(value),
}));

