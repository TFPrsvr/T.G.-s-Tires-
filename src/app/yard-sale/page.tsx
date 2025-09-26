import { Metadata } from 'next';
import { YardSaleBrowse } from '@/components/features/yard-sale/yard-sale-browse';

export const metadata: Metadata = {
  title: 'Yard Sale Items - T.G.\'s Tires',
  description: 'Browse yard sale items from T.G.\'s Tires. Find great deals on household items, furniture, electronics, and more.',
  keywords: 'yard sale, garage sale, used items, furniture, electronics, household items, deals',
};

export default function YardSalePage() {
  return <YardSaleBrowse />;
}