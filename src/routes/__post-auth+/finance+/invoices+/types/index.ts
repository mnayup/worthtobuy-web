export interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  customerId: number;
  totalBill: number;
  paidAmount: number;
  outstandingAmount: number;
  overpaymentAmount?: number;
  depositAmount?: number;
  useDeposit?: boolean;
  status: string;
  billingModel?: string;
  dpPercent?: number;
  dpAmount?: number;
  dpSettlementNote?: string;
  whatsappMessage?: string;
  notes?: string;
  customer?: {
    id: number;
    fullName: string;
    whatsapp: string;
    email?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    depositBalance?: number;
  };
  orders?: Array<{
    id: number;
    snapshotAmount: number;
    order: {
      id: number;
      orderNumber: string;
      orderDate: string;
      totalBill: number;
      period?: { code: string; name: string };
      items?: any[];
      shipments?: any[];
    };
  }>;
  payments?: any[];
  refunds?: any[];
}

export type StageMode = 'DP' | 'SETTLEMENT' | 'PAID' | 'FULL' | 'REKAP';
export const paymentMethods = ['Transfer Bank', 'Tunai', 'QRIS', 'E-Wallet', 'CO Shopee'];
export const invoiceStatuses = ['ISSUED', 'PARTIAL', 'PAID', 'REFUND_DUE', 'CANCELLED'];
