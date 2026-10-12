import { createBrowserRouter } from 'react-router-dom';
import { RoleGuard } from '~/components/RoleGuard';

// Layouts
import PublicLayout from '~/routes/__public';
import PreAuthLayout from '~/routes/__pre-auth';
import PostAuthLayout from '~/routes/__post-auth';

// Public customer route modules
import CustomerHomeRoute from '~/routes/__public+/index';
import PublicEventsRoute from '~/routes/__public+/events+';
import PublicReadyStockRoute from '~/routes/__public+/ready-stock+';
import PublicTrackingRoute from '~/routes/__public+/track+';
import PublicInvoiceViewRoute from '~/routes/__public+/invoice+';

// Route modules
import LoginRoute from '~/routes/__pre-auth+/login+';
import DashboardRoute from '~/routes/__post-auth+/dashboard+';
import SearchRoute from '~/routes/__post-auth+/search+';
import SummaryRoute from '~/routes/__post-auth+/finance+/summary+';
import InvoicesRoute from '~/routes/__post-auth+/finance+/invoices+';
import InvoiceDetailRoute from '~/routes/__post-auth+/finance+/invoices+/$id+';
import PeriodsRoute from '~/routes/__post-auth+/operations+/periods+';
import CustomersRoute from '~/routes/__post-auth+/master-data+/customers+';
import CustomerDetailRoute from '~/routes/__post-auth+/master-data+/customers+/$id+';
import ProductsRoute from '~/routes/__post-auth+/master-data+/products+';
import OrdersRoute from '~/routes/__post-auth+/operations+/orders+';
import ItemTrackingRoute from '~/routes/__post-auth+/operations+/item-tracking+';
import ShoppingListRoute from '~/routes/__post-auth+/operations+/shopping-list+';
import PurchasesRoute from '~/routes/__post-auth+/operations+/purchases+';
import PaymentsRoute from '~/routes/__post-auth+/finance+/payments+';
import ShipmentsRoute from '~/routes/__post-auth+/operations+/shipments+';
import ExpensesRoute from '~/routes/__post-auth+/finance+/expenses+';
import RefundsRoute from '~/routes/__post-auth+/finance+/refunds+';
import FinanceOverviewRoute from '~/routes/__post-auth+/finance+/overview+';
import ReportsRoute from '~/routes/__post-auth+/finance+/reports+';
import UsersRoute from '~/routes/__post-auth+/system+/users+';
import PermissionManagementRoute from '~/routes/__post-auth+/settings+/permission-management+';
import ProfileRoute from '~/routes/__post-auth+/profile+';
import SettingsRoute from '~/routes/__post-auth+/system+/settings+';
import AiInsightsRoute from '~/routes/__post-auth+/ai-insights+';
import TrashRoute from '~/routes/__post-auth+/system+/trash+';
import NotFoundRoute from '~/routes/$';

export const router = createBrowserRouter([
  // Public customer portal routes (Home, Running Events, Ready Stock, Order Tracking)
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <CustomerHomeRoute />,
      },
      {
        path: '/events',
        element: <PublicEventsRoute />,
      },
      {
        path: '/ready-stock',
        element: <PublicReadyStockRoute />,
      },
      {
        path: '/track',
        element: <PublicTrackingRoute />,
      },
      {
        path: '/track/:trackingId',
        element: <PublicTrackingRoute />,
      },
      {
        path: '/invoice/:invoiceNumber',
        element: <PublicInvoiceViewRoute />,
      },
      {
        path: '/invoices/view/:invoiceNumber',
        element: <PublicInvoiceViewRoute />,
      },
    ],
  },
  // Pre-auth routes (login, register, forgot-password, etc.)
  {
    element: <PreAuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginRoute />,
      },
    ],
  },
  // Post-auth routes (dashboard, operations, master-data, finance, system)
  {
    element: <PostAuthLayout />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardRoute />,
      },
      {
        path: 'search',
        element: <SearchRoute />,
      },
      {
        path: 'summary',
        element: (
          <RoleGuard roles={['OWNER', 'ADMIN', 'FINANCE']}>
            <SummaryRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'invoices',
        element: (
          <RoleGuard roles={['OWNER', 'ADMIN', 'FINANCE']}>
            <InvoicesRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'invoices/:id',
        element: (
          <RoleGuard roles={['OWNER', 'ADMIN', 'FINANCE']}>
            <InvoiceDetailRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'periods',
        element: <PeriodsRoute />,
      },
      {
        path: 'customers',
        element: (
          <RoleGuard roles={['OWNER', 'ADMIN', 'FINANCE']}>
            <CustomersRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'customers/:id',
        element: (
          <RoleGuard roles={['OWNER', 'ADMIN', 'FINANCE']}>
            <CustomerDetailRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'products',
        element: (
          <RoleGuard roles={['OWNER', 'ADMIN', 'SHOPPER']}>
            <ProductsRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'orders',
        element: (
          <RoleGuard roles={['OWNER', 'ADMIN', 'FINANCE']}>
            <OrdersRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'item-tracking',
        element: (
          <RoleGuard roles={['OWNER', 'ADMIN', 'SHOPPER', 'FINANCE']}>
            <ItemTrackingRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'shopping-list',
        element: (
          <RoleGuard roles={['OWNER', 'ADMIN', 'SHOPPER']}>
            <ShoppingListRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'purchases',
        element: (
          <RoleGuard roles={['OWNER', 'ADMIN', 'SHOPPER']}>
            <PurchasesRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'payments',
        element: (
          <RoleGuard roles={['OWNER', 'ADMIN', 'FINANCE']}>
            <PaymentsRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'shipments',
        element: (
          <RoleGuard roles={['OWNER', 'ADMIN']}>
            <ShipmentsRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'expenses',
        element: (
          <RoleGuard roles={['OWNER', 'FINANCE']}>
            <ExpensesRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'refunds',
        element: (
          <RoleGuard roles={['OWNER', 'FINANCE']}>
            <RefundsRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'finance',
        element: (
          <RoleGuard roles={['OWNER', 'FINANCE']}>
            <FinanceOverviewRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'reports',
        element: (
          <RoleGuard roles={['OWNER', 'FINANCE']}>
            <ReportsRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'users',
        element: (
          <RoleGuard roles={['OWNER']}>
            <UsersRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'roles',
        element: (
          <RoleGuard roles={['OWNER']}>
            <PermissionManagementRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'settings/permission-management',
        element: (
          <RoleGuard roles={['OWNER']}>
            <PermissionManagementRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'profile',
        element: <ProfileRoute />,
      },
      {
        path: 'settings',
        element: (
          <RoleGuard roles={['OWNER']}>
            <SettingsRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'ai-assistant',
        element: (
          <RoleGuard roles={['OWNER', 'FINANCE', 'ADMIN']}>
            <AiInsightsRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'ai-insights',
        element: (
          <RoleGuard roles={['OWNER', 'FINANCE', 'ADMIN']}>
            <AiInsightsRoute />
          </RoleGuard>
        ),
      },
      {
        path: 'trash',
        element: (
          <RoleGuard roles={['OWNER']}>
            <TrashRoute />
          </RoleGuard>
        ),
      },
      {
        path: '*',
        element: <NotFoundRoute />,
      },
    ],
  },
]);
