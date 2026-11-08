import { titleCase } from '~/lib/format';
import type { Option } from '~/types';

export interface ShipmentOrderItem {
  id: number;
  orderId?: number;
  order_id?: number;
  productId?: number | null;
  product_id?: number | null;
  manualProductName?: string | null;
  manual_product_name?: string | null;
  brandName?: string | null;
  brand_name?: string | null;
  variation?: string | null;
  size?: string | null;
  color?: string | null;
  quantity: number;
  fulfillmentStatus?: string;
  fulfillment_status?: string;
  purchaseStatus?: string;
  purchase_status?: string;
  photoUrl?: string | null;
  photo_url?: string | null;
  product?: {
    id: number;
    sku?: string;
    name: string;
    brandName?: string | null;
    brand_name?: string | null;
    imageUrl?: string | null;
    image_url?: string | null;
  } | null;
}

export interface ShippingCounter {
  id: number;
  name: string;
  courier: string;
  code?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  contact_person?: string | null;
  contactPerson?: string | null;
  is_active?: boolean;
  isActive?: boolean;
  notes?: string | null;
}

export interface Shipment {
  id: number;
  trackingNumber?: string | null;
  tracking_number?: string | null;
  orderId?: number;
  order_id?: number;
  customerId?: number;
  customer_id?: number;
  shippingCounterId?: number | null;
  shipping_counter_id?: number | null;
  shippingCounter?: ShippingCounter | null;
  shipping_counter?: ShippingCounter | null;
  address: string;
  courier: string;
  serviceType?: string | null;
  service_type?: string | null;
  weightKg?: number | null;
  weight_kg?: number | null;
  shippingCost?: number;
  shipping_cost?: number;
  actualShippingCost?: number | null;
  actual_shipping_cost?: number | null;
  shippingCostDifference?: number | null;
  shipping_cost_difference?: number | null;
  shippedAt?: string | null;
  shipped_at?: string | null;
  packedAt?: string | null;
  packed_at?: string | null;
  status: string;
  shippingMethod?: string | null;
  shipping_method?: string | null;
  shopeeUsername?: string | null;
  shopee_username?: string | null;
  shopeeRefundAmount?: number | null;
  shopee_refund_amount?: number | null;
  proofBeforeUrl?: string | null;
  proof_before_url?: string | null;
  proofUrl?: string | null;
  proof_url?: string | null;
  notes?: string | null;
  customer?: {
    id?: number;
    customerCode?: string;
    customer_code?: string;
    fullName?: string;
    full_name?: string;
    whatsapp?: string;
    email?: string | null;
    address?: string | null;
  };
  order?: {
    id: number;
    orderNumber?: string;
    order_number?: string;
    status?: string;
    customerNotes?: string | null;
    customer_notes?: string | null;
    internalNotes?: string | null;
    internal_notes?: string | null;
    totalBill?: number;
    total_bill?: number;
    paidAmount?: number;
    paid_amount?: number;
    outstandingAmount?: number;
    outstanding_amount?: number;
    customerShipping?: number;
    customer_shipping?: number;
    items?: ShipmentOrderItem[];
    invoiceLinks?: Array<{
      invoice?: {
        id: number;
        invoiceNumber?: string;
        invoice_number?: string;
        status: string;
        outstandingAmount?: number;
        outstanding_amount?: number;
        paidAmount?: number;
        paid_amount?: number;
        totalBill?: number;
        total_bill?: number;
      };
    }>;
    invoice_links?: Array<{
      invoice?: {
        id: number;
        invoiceNumber?: string;
        invoice_number?: string;
        status: string;
        outstandingAmount?: number;
        outstanding_amount?: number;
        paidAmount?: number;
        paid_amount?: number;
        totalBill?: number;
        total_bill?: number;
      };
    }>;
  };
  shipment_orders?: Array<{
    id: number;
    shipment_id?: number;
    order_id?: number;
    order?: Shipment['order'];
  }>;
  shipmentOrders?: Array<{
    id: number;
    shipment_id?: number;
    order_id?: number;
    order?: Shipment['order'];
  }>;
}

export function getShipmentOrders(shipment?: Shipment | null): Array<NonNullable<Shipment['order']>> {
  if (!shipment) return [];
  const map = new Map<number, NonNullable<Shipment['order']>>();
  if (shipment.order && shipment.order.id) {
    map.set(shipment.order.id, shipment.order);
  }
  const links = shipment.shipment_orders || shipment.shipmentOrders || [];
  for (const link of links) {
    if (link.order && link.order.id) {
      map.set(link.order.id, link.order);
    }
  }
  return Array.from(map.values());
}

export function getShipmentItems(shipment?: Shipment | null): ShipmentOrderItem[] {
  const orders = getShipmentOrders(shipment);
  if (!orders.length && shipment?.order?.items) {
    return shipment.order.items;
  }
  return orders.flatMap((o) => o.items || []);
}

export function getShipmentOrderNumbers(shipment?: Shipment | null): string[] {
  const orders = getShipmentOrders(shipment);
  if (!orders.length && (shipment?.order?.order_number || shipment?.order?.orderNumber)) {
    return [shipment.order.order_number || shipment.order.orderNumber || ''];
  }
  return orders
    .map((o) => o.order_number || o.orderNumber)
    .filter(Boolean) as string[];
}

export function isSingleOrderFullyPaid(order?: Shipment['order'] | null): boolean {
  if (!order) return false;

  if (['NEW', 'WAITING_DP', 'DP_RECEIVED', 'CANCELLED'].includes(order.status || '')) {
    return false;
  }

  const totalBill = Number(order.total_bill ?? order.totalBill ?? 0);
  const paid = Number(order.paid_amount ?? order.paidAmount ?? 0);
  const outstanding = Number(order.outstanding_amount ?? order.outstandingAmount ?? 0);
  const customerShipping = Number(order.customer_shipping ?? order.customerShipping ?? 0);
  const nonShippingBill = Math.max(0, totalBill - customerShipping);

  if (outstanding <= 0 && (totalBill <= 0 || paid >= totalBill)) {
    return true;
  }

  if (
    ['READY_TO_SHIP', 'WAITING_SETTLEMENT', 'SHIPPED', 'COMPLETED'].includes(order.status || '') &&
    paid > 0 &&
    paid >= nonShippingBill
  ) {
    return true;
  }

  const invoiceLinks = order.invoice_links || order.invoiceLinks;
  if (invoiceLinks && invoiceLinks.length > 0) {
    const allInvoicesPaid = invoiceLinks.every((link) => {
      const inv = link.invoice;
      if (!inv) return false;
      const invOutstanding = Number(inv.outstanding_amount ?? inv.outstandingAmount ?? 0);
      return ['PAID', 'OVERPAID', 'REFUND_DUE'].includes(inv.status) && invOutstanding <= 0;
    });
    if (allInvoicesPaid) return true;
  }

  return false;
}

export function isShipmentFullyPaid(shipment?: Shipment | null): boolean {
  const orders = getShipmentOrders(shipment);
  if (!orders.length) return false;
  return orders.every((ord) => isSingleOrderFullyPaid(ord));
}

export const shipmentStatuses = [
  'WAITING_PACKING',
  'PACKED',
  'READY',
  'HANDED_TO_COURIER',
  'IN_TRANSIT',
  'WAITING_SETTLEMENT',
  'DELIVERED',
  'FAILED',
  'RETURNED',
];

export const shipmentStatusOptions: Option[] = shipmentStatuses.map((value) => ({
  value,
  label: titleCase(value),
}));


