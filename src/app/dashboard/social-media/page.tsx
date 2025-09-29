import { Metadata } from 'next';
import { DashboardShell } from '@/components/features/dashboard/dashboard-shell';
import { SocialMediaDashboard } from '@/components/features/social-media/social-media-dashboard';

export const metadata: Metadata = {
  title: 'Social Media Dashboard - T.G.\'s Tires',
  description: 'Manage your social media accounts and automated posting for tire listings and yard sale items',
};

export default function SocialMediaPage() {
  return (
    <DashboardShell>
      <SocialMediaDashboard />
    </DashboardShell>
  );
}