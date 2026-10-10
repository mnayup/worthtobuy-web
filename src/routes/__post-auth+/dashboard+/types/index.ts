export interface DashboardStats {
  totalOrders?: number;
  itemCount?: number;
  omzet?: number;
  averageOrder?: number;
  serviceFees?: number;
  outstanding?: number;
  unpaidOrders?: number;
  cashIn?: number;
  cashOut?: number;
  readyToShip?: number;
  completed?: number;
  invoiceCount?: number;
}

export interface DashboardCharts {
  daily?: Array<{ date: string; omzet: number; orders: number }>;
  statusGroups?: Array<{ status: string; _count: { _all: number } }>;
  topProducts?: Array<{ name: string; quantity: number }>;
  topCustomers?: Array<{ name: string; orders: number; omzet: number }>;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: DashboardCharts;
  latest?: Array<{
    id: number;
    action: string;
    entity: string;
    createdAt: string;
    user?: { name: string };
  }>;
  alerts?: {
    overduePayments?: any[];
    unpurchased?: any[];
    lateShipments?: any[];
  };
}

export interface DashboardFilterParams {
  periodId?: string;
  start?: string;
  end?: string;
}
