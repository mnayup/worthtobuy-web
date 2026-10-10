import { titleCase } from '~/lib/format';
import type { Option } from '~/types';

export interface Refund {
  id: number;
  refundNumber: string;
  invoiceId?: number;
  orderId?: number;
  customerId?: number;
  refundType?: 'CUSTOMER_DEPOSIT' | 'DIRECT_TRANSFER' | string;
  amount: number;
  reason: string;
  source: string;
  status: string;
  refundedAt?: string;
  notes?: string;
  customer?: { id?: number; fullName: string; whatsapp?: string; customerCode?: string };
  invoice?: { id?: number; invoiceNumber: string; customer?: { fullName: string; whatsapp?: string } };
  order?: { id?: number; orderNumber: string; customer?: { fullName: string; whatsapp?: string } };
}

export const refundStatuses = ['REQUESTED', 'APPROVED', 'PAID', 'REJECTED'];
export const refundStatusOptions: Option[] = refundStatuses.map((value) => ({
  value,
  label: titleCase(value),
}));

export const refundTypeOptions: Option[] = [
  { value: 'CUSTOMER_DEPOSIT', label: 'Customer Deposit (Saldo Pelanggan)' },
  { value: 'DIRECT_TRANSFER', label: 'Direct Transfer (Kirim ke Pelanggan)' },
];
