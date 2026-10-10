import { titleCase } from '~/lib/format';
import type { Option } from '~/types';

export interface Period {
  id: number;
  code: string;
  name: string;
  city: string;
  orderOpenAt: string;
  orderCloseAt: string;
  departureAt: string;
  returnAt: string;
  estimatedShippingAt?: string;
  status: string;
  maxItems?: number;
  baggageCapacityKg?: number;
  notes?: string;
}

export const periodStatuses = ['DRAFT', 'OPEN', 'CLOSED', 'COMPLETED', 'CANCELLED'];

export const periodStatusOptions: Option[] = periodStatuses.map((value) => ({
  value,
  label: titleCase(value),
}));
