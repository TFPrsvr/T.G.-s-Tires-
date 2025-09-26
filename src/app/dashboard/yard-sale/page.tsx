import { Metadata } from 'next';
import { YardSaleDashboard } from '@/components/features/yard-sale/yard-sale-dashboard';

export const metadata: Metadata = {
  title: 'Yard Sale Dashboard - T.G.\'s Tires',
  description: 'Manage your yard sale items and upcoming sales',
};

export default function YardSalePage() {
  return <YardSaleDashboard />;
}