import { type Invoice } from '../types';

export type SortColumn =
  | 'invoiceNumber'
  | 'customer'
  | 'event'
  | 'totalBill'
  | 'paidAmount'
  | 'dueDate'
  | 'status';

export type SortDirection = 'asc' | 'desc' | null;

export function sortInvoices(
  list: Invoice[],
  sortCol: SortColumn | null,
  sortDir: SortDirection
): Invoice[] {
  if (!sortCol || !sortDir || !list.length) return list;
  const factor = sortDir === 'asc' ? 1 : -1;

  return [...list].sort((a, b) => {
    let valA: any = '';
    let valB: any = '';

    switch (sortCol) {
      case 'invoiceNumber':
        valA = a.invoiceNumber || '';
        valB = b.invoiceNumber || '';
        break;
      case 'customer':
        valA = a.customer?.fullName || '';
        valB = b.customer?.fullName || '';
        break;
      case 'event':
        valA = (a.orders || [])
          .map((l: any) => l.order?.period?.code || '')
          .join(',');
        valB = (b.orders || [])
          .map((l: any) => l.order?.period?.code || '')
          .join(',');
        break;
      case 'totalBill':
        return (Number(a.totalBill || 0) - Number(b.totalBill || 0)) * factor;
      case 'paidAmount':
        return (
          (Number(a.paidAmount || 0) - Number(b.paidAmount || 0)) * factor
        );
      case 'dueDate':
        valA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        valB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return (valA - valB) * factor;
      case 'status':
        valA = a.status || '';
        valB = b.status || '';
        break;
    }

    return (
      String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
        sensitivity: 'base',
      }) * factor
    );
  });
}
