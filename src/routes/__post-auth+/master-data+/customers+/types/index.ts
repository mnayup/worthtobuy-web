export interface Customer {
  id: number;
  customerCode?: string;
  customer_code?: string;
  fullName?: string;
  full_name?: string;
  whatsapp: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  postal_code?: string;
  socialUsername?: string;
  social_username?: string;
  segment: 'REGULAR' | 'PRIORITY' | 'PROBLEM' | 'INACTIVE';
  status: 'active' | 'inactive';
  notes?: string;
  whatsapp_group_id?: number | null;
  whatsappGroupId?: number | null;
  whatsapp_group?: { id: number; name: string; url?: string } | null;
  whatsappGroup?: { id: number; name: string; url?: string } | null;
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
