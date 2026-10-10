import { titleCase } from '~/lib/format';
import type { Option } from '~/types';

export interface Payment {
  id: number;
  paymentNumber: string;
  invoiceId?: number;
  orderId?: number;
  paymentDate: string;
  amount: number;
  method: string;
  destinationAccount?: string;
  proofUrl?: string;
  status: string;
  notes?: string;
  invoice?: { invoiceNumber: string; customer?: { fullName: string } };
  order?: { orderNumber: string; customer?: { fullName: string } };
}

export const paymentStatuses = ['PENDING', 'VERIFIED', 'REJECTED', 'PARTIAL_REFUND', 'FULL_REFUND'];

export const paymentStatusOptions: Option[] = paymentStatuses.map((value) => ({
  value,
  label: titleCase(value),
}));
