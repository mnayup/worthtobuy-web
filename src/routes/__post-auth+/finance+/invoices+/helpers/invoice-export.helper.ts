import { date } from '~/lib/format';
import { exportToExcel } from '~/lib/excel';
import { type Invoice } from '../types';

export function exportInvoicesToExcel(invoices: Invoice[]) {
  const headers = [
    'Invoice #',
    'Customer',
    'Customer Code',
    'Event Codes',
    'Total Bill (IDR)',
    'Paid Amount (IDR)',
    'Balance Due (IDR)',
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
      invoice.invoiceNumber || invoice.invoice_number || '-',
      invoice.customer?.fullName || invoice.customer?.full_name || '-',
      invoice.customer?.customerCode || invoice.customer?.customer_code || '-',
      eventCodes || '-',
      Number(invoice.totalBill ?? invoice.total_bill ?? 0),
      Number(invoice.paidAmount ?? invoice.paid_amount ?? 0),
      Number(invoice.outstandingAmount ?? invoice.outstanding_amount ?? 0),
      invoice.dueDate || invoice.due_date ? date(invoice.dueDate || invoice.due_date) : '-',
      invoice.status || '-',
    ];
  });
  exportToExcel(
    `invoices-list-${new Date().toISOString().slice(0, 10)}.xlsx`,
    'Invoices',
    headers,
    rows
  );
}
