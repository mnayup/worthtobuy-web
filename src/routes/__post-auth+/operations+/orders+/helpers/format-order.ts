import { titleCase } from '~/lib/format';
import type { Option } from '~/types';

export const orderStatuses = [
  'NEW',
  'WAITING_DP',
  'WAITING_PURCHASE',
  'SEARCHING',
  'PURCHASED',
  'UNAVAILABLE',
  'WAITING_SETTLEMENT',
  'PAID',
  'READY_TO_SHIP',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
  'REFUND',
];

export const fulfillmentStatuses = [
  'PENDING',
  'SEARCHING',
  'AVAILABLE',
  'UNAVAILABLE',
  'KEPT',
  'READY_TO_SHIP',
  'SHIPPED',
  'DELIVERED',
];

export const orderStatusOptions: Option[] = orderStatuses.map((value) => ({
  value,
  label: titleCase(value),
}));

export const fulfillmentStatusOptions: Option[] = fulfillmentStatuses.map((value) => ({
  value,
  label: titleCase(value),
}));
