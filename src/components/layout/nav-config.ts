import {
  Boxes,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Landmark,
  LayoutDashboard,
  ReceiptText,
  Settings,
  ShoppingBag,
  Sparkles,
  Truck,
  UserCog,
  Users,
  Trash2,
  ShieldCheck,
  Archive,
} from 'lucide-react';

export interface NavSubItem {
  to: string;
  label: string;
  roles: string[];
}

export interface NavItemConfig {
  to: string;
  label: string;
  icon: any;
  roles: string[];
  subItems?: NavSubItem[];
  colorBadge?: string;
}

export interface NavGroupConfig {
  title: string;
  roles: string[];
  items: NavItemConfig[];
}

export const navGroups: NavGroupConfig[] = [
  {
    title: 'Main',
    roles: ['OWNER', 'ADMIN', 'SHOPPER', 'FINANCE'],
    items: [
      {
        to: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        roles: ['OWNER', 'ADMIN', 'SHOPPER', 'FINANCE'],
      },
      {
        to: '/ai-assistant',
        label: 'WORTHTOBUY AI',
        icon: Sparkles,
        roles: ['OWNER', 'FINANCE', 'ADMIN'],
      },
    ],
  },
  {
    title: 'Master Data',
    roles: ['OWNER', 'ADMIN', 'SHOPPER', 'FINANCE'],
    items: [
      {
        to: '/periods',
        label: 'Events',
        icon: ClipboardList,
        roles: ['OWNER', 'ADMIN', 'SHOPPER', 'FINANCE'],
      },
      {
        to: '/products',
        label: 'Products',
        icon: Boxes,
        roles: ['OWNER', 'ADMIN', 'SHOPPER'],
      },
      {
        to: '/customers',
        label: 'Customers',
        icon: Users,
        roles: ['OWNER', 'ADMIN', 'FINANCE'],
      },
      {
        to: '/shipping-counters',
        label: 'Shipping Couriers',
        icon: Truck,
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
  {
    title: 'Operations',
    roles: ['OWNER', 'ADMIN', 'SHOPPER', 'FINANCE'],
    items: [
      {
        to: '/orders',
        label: 'Orders',
        icon: ReceiptText,
        roles: ['OWNER', 'ADMIN', 'FINANCE'],
      },
      {
        to: '/purchases',
        label: 'Purchases',
        icon: ShoppingBag,
        roles: ['OWNER', 'ADMIN', 'SHOPPER'],
      },
      {
        to: '/shipments',
        label: 'Shipments',
        icon: Truck,
        roles: ['OWNER', 'ADMIN'],
      },
      {
        to: '/keep-items',
        label: 'Keep Items',
        icon: Archive,
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
  {
    title: 'Finance',
    roles: ['OWNER', 'ADMIN', 'FINANCE'],
    items: [
      {
        to: '/invoices',
        label: 'Invoices & Billing',
        icon: FileText,
        roles: ['OWNER', 'ADMIN', 'FINANCE'],
        subItems: [
          {
            to: '/invoices',
            label: 'Customer Invoices',
            roles: ['OWNER', 'ADMIN', 'FINANCE'],
          },
          {
            to: '/payments',
            label: 'Payment History',
            roles: ['OWNER', 'ADMIN', 'FINANCE'],
          },
          {
            to: '/refunds',
            label: 'Refunds',
            roles: ['OWNER', 'FINANCE'],
          },
        ],
      },
      {
        to: '/expenses',
        label: 'Expenses',
        icon: CircleDollarSign,
        roles: ['OWNER', 'FINANCE'],
      },
      {
        to: '/finance',
        label: 'Cash Flow & Reports',
        icon: Landmark,
        roles: ['OWNER', 'FINANCE'],
        subItems: [
          {
            to: '/finance',
            label: 'Cash Flow Overview',
            roles: ['OWNER', 'FINANCE'],
          },
          {
            to: '/summary',
            label: 'Summary & Fees',
            roles: ['OWNER', 'ADMIN', 'FINANCE'],
          },
          {
            to: '/reports',
            label: 'Profit & Loss Report',
            roles: ['OWNER', 'FINANCE'],
          },
        ],
      },
    ],
  },
  {
    title: 'System',
    roles: ['OWNER'],
    items: [
      {
        to: '/users',
        label: 'User Management',
        icon: UserCog,
        roles: ['OWNER'],
      },
      {
        to: '/roles',
        label: 'Role & Permissions',
        icon: ShieldCheck,
        roles: ['OWNER'],
      },
      {
        to: '/settings',
        label: 'System Settings',
        icon: Settings,
        roles: ['OWNER'],
      },
      {
        to: '/trash',
        label: 'Trash / Bin',
        icon: Trash2,
        roles: ['OWNER'],
      },
    ],
  },
];

export const navItems = navGroups.flatMap((group) => group.items);
