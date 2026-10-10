export interface Customer {
  id: number;
  customerCode: string;
  fullName: string;
  whatsapp: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  socialUsername?: string;
  segment: 'REGULAR' | 'PRIORITY' | 'PROBLEM' | 'INACTIVE';
  status: 'active' | 'inactive';
  notes?: string;
}

export interface CustomerOverviewSummary {
  totalOrders: number;
  omzet: number;
  outstanding: number;
  totalRefund: number;
}

export interface CustomerOverviewData {
  customer: Customer & {
    invoices: any[];
    orders: any[];
    shipments: any[];
  };
  summary: CustomerOverviewSummary;
  refunds: any[];
}
