import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { DashboardStats } from "@/components/features/dashboard/dashboard-stats";
import { RecentListings } from "@/components/features/tire-listings/recent-listings";
import { QuickActions } from "@/components/features/dashboard/quick-actions";
import { QuickSettings } from "@/components/features/dashboard/quick-settings";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen p-8">
      <DashboardShell>
        <DashboardHeader
          heading="T.G.'s Tires Dashboard"
          text="Manage your tire listings & yard sale items, and business operations."
        />

        <div className="grid gap-8">
          {/* Stats and Quick Settings Side by Side */}
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <DashboardStats />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Quick Settings</h2>
              <QuickSettings />
            </div>
          </div>

          {/* Recent Listings and Quick Actions Side by Side */}
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Recent Listings</h2>
              <RecentListings />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <QuickActions />
            </div>
          </div>
        </div>
      </DashboardShell>
    </div>
  );
}