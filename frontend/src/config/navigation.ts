import {
  FiHome,
  FiPieChart,
  FiTrendingUp,
  FiDollarSign,
  FiSettings,
} from 'react-icons/fi';

export interface NavItem {
  name: string;
  href: string;
  icon: typeof FiHome;
}

export const mainNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: FiHome },
  { name: 'Asset Allocation', href: '/allocation', icon: FiPieChart },
  { name: 'Monthly Investments', href: '/investments', icon: FiTrendingUp },
  { name: 'Cash Flow', href: '/cashflow', icon: FiDollarSign },
  { name: 'Settings', href: '/settings', icon: FiSettings },
];


