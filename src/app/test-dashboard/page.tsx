import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { DashboardStats } from "@/components/features/dashboard/dashboard-stats";
import { RecentListings } from "@/components/features/tire-listings/recent-listings";
import { QuickActions } from "@/components/features/dashboard/quick-actions";

export default function TestDashboardPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Test Dashboard (No Auth Check)</h1>
      <DashboardShell>
        <DashboardHeader
          heading="T.G.'s Tires Dashboard"
          text="Manage your tire listings, yard sale items, and business operations."
        />

        <div className="grid gap-8">
          <DashboardStats />

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <QuickActions />
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Recent Listings</h2>
              <RecentListings />
            </div>
          </div>
        </div>
      </DashboardShell>
    </div>
  );
}