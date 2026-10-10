import { date } from '~/lib/format';
import { exportToExcel } from '~/lib/excel';
import { type Invoice } from '../types';

export function exportInvoicesToExcel(invoices: Invoice[]) {
  const headers = [
    'Invoice Number',
    'Customer',
    'Events',
    'Total Bill',
    'Paid Amount',
    'Balance Due',
    'Due Date',
    'Status',
  ];
  const rows = invoices.map((invoice) => {
    const eventCodes = [
      ...new Set<string>(
        (invoice.orders || [])
          .map((link: any) => String(link.order?.period?.code || ''))
          .filter(Boolean)
      ),
    ].join(', ');
    return [
      invoice.invoiceNumber,
      invoice.customer?.fullName || '-',
      eventCodes || '-',
      Number(invoice.totalBill || 0),
      Number(invoice.paidAmount || 0),
      Number(invoice.outstandingAmount || 0),
      invoice.dueDate ? date(invoice.dueDate) : '-',
      invoice.status,
    ];
  });
  exportToExcel(
    `invoices-list-${new Date().toISOString().slice(0, 10)}.xlsx`,
    'Invoices',
    headers,
    rows
  );
}
