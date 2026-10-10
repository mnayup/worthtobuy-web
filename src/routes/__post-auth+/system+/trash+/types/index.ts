export interface TrashItem {
  id: number | string;
  entityType: string;
  code: string;
  name: string;
  deletedAt: string;
  deletedByName?: string;
}

export const typeLabels: Record<string, string> = {
  USER: 'User',
  CUSTOMER: 'Customer',
  PERIOD: 'Event',
  PRODUCT: 'Product',
  ORDER: 'Order',
  PAYMENT: 'Payment',
  EXPENSE: 'Expense',
  REFUND: 'Refund',
  INVOICE: 'Invoice',
};

export const rowKey = (row: any) => `${row.entityType}:${row.id}`;
