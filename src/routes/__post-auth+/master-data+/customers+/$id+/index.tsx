import { useNavigate } from 'react-router-dom';
import { money } from '~/lib/format';
import { CustomerHeader } from './components/customer-header';
import { CustomerInvoicesTable } from './components/customer-invoices-table';
import { CustomerMetricCard } from './components/customer-metric-card';
import { CustomerOrdersSection } from './components/customer-orders-section';
import { CustomerProfileCard } from './components/customer-profile-card';
import { CustomerRefundsCard } from './components/customer-refunds-card';
import { CustomerShipmentsCard } from './components/customer-shipments-card';
import { loader, useCustomerDetail } from './hooks/use-customer-detail';

export { loader };

export default function CustomerDetailRoute() {
  const navigate = useNavigate();
  const {
    customer,
    summary,
    refunds,
    loading,
    error,
    derivedSegment,
    phone,
    invoicePage,
    setInvoicePage,
    invoicePages,
    paginatedInvoices,
    rawInvoices,
    orderPage,
    setOrderPage,
    orderPages,
    orders,
    paginatedOrders,
    pageSize,
    sortKey,
    sortDirection,
    toggleSort,
  } = useCustomerDetail();

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div
          className={
            'h-10 w-10 animate-spin rounded-full border-4 border-brand-100 ' +
            'border-t-cherry-500'
          }
        />
      </div>
    );
  }

  if (error || !customer || !summary) {
    return (
      <div className="card p-8 text-center">
        <p className="font-bold text-cherry-600">{error || 'Customer not found.'}</p>
        <button className="btn-secondary mt-4" onClick={() => navigate('/customers')}>
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="animate-rise space-y-6">
      <CustomerHeader
        fullName={customer.fullName}
        customerCode={customer.customerCode}
        whatsapp={customer.whatsapp}
        city={customer.city}
        phone={phone}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CustomerMetricCard
          label="Total Orders"
          value={String(summary.totalOrders)}
          caption="Lifetime order volume"
          tone="indigo"
        />
        <CustomerMetricCard
          label="Customer Revenue"
          value={money(summary.omzet)}
          caption="Total billed transactions"
          tone="emerald"
        />
        <CustomerMetricCard
          label="Outstanding Balance"
          value={money(summary.outstanding)}
          caption="Remaining unpaid amount"
          tone="amber"
        />
        <CustomerMetricCard
          label="Refunds Paid"
          value={money(summary.totalRefund)}
          caption="Processed refunds"
          tone="cherry"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-6">
          <CustomerInvoicesTable
            invoices={paginatedInvoices}
            totalInvoices={rawInvoices.length}
            page={invoicePage}
            totalPages={invoicePages}
            pageSize={pageSize}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={toggleSort}
            onPageChange={setInvoicePage}
          />

          <CustomerOrdersSection
            orders={paginatedOrders}
            totalOrders={orders.length}
            page={orderPage}
            totalPages={orderPages}
            pageSize={pageSize}
            onPageChange={setOrderPage}
          />
        </div>

        <div className="space-y-6">
          <CustomerProfileCard
            email={customer.email}
            address={customer.address}
            postalCode={customer.postalCode}
            socialUsername={customer.socialUsername}
            segment={derivedSegment}
            notes={customer.notes}
          />

          <CustomerShipmentsCard shipments={customer.shipments || []} />

          <CustomerRefundsCard refunds={refunds} />
        </div>
      </div>
    </div>
  );
}
