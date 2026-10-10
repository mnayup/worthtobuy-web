import {
  Calculator,
  FileBarChart2,
  FileText,
  Landmark,
  PackageCheck,
  PackageSearch,
  ReceiptText,
  RotateCcw,
  ScrollText,
  Settings,
  ShoppingBag,
  Trash2,
  UserCog,
  WalletCards,
} from 'lucide-react';
import type { FlowTabItem } from './FlowTabs';

export const orderFlowTabs: FlowTabItem[] = [
  { to: '/orders', label: 'Orders', icon: ReceiptText },
  { to: '/item-tracking', label: 'Item Tracking', icon: PackageSearch },
];

export const shoppingFlowTabs: FlowTabItem[] = [
  { to: '/shopping-list', label: 'Shopping List (By Brand)', icon: ShoppingBag },
  { to: '/purchases', label: 'Purchase Log', icon: PackageCheck },
];

export const billingFlowTabs: FlowTabItem[] = [
  { to: '/invoices', label: 'Customer Invoices', icon: FileText },
  { to: '/payments', label: 'Payment History', icon: WalletCards },
  { to: '/refunds', label: 'Customer Refunds', icon: RotateCcw },
];

export const financeFlowTabs: FlowTabItem[] = [
  { to: '/finance', label: 'Cash Flow Overview', icon: Landmark },
  { to: '/summary', label: 'Summary & Fees', icon: Calculator },
  { to: '/reports', label: 'Profit & Loss Report', icon: FileBarChart2 },
];

export const systemFlowTabs: FlowTabItem[] = [
  { to: '/settings', label: 'System Settings', icon: Settings },
  { to: '/users', label: 'User Management', icon: UserCog },
  { to: '/trash', label: 'Trash', icon: Trash2 },
];
