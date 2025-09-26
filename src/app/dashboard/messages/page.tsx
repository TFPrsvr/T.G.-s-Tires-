import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { MessagingDashboard } from "@/components/features/messaging/messaging-dashboard";

export default async function MessagesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Customer Messages"
        text="View and respond to customer inquiries across all channels - SMS, Email, and In-App messages."
      />

      <div className="space-y-6">
        <MessagingDashboard />
      </div>
    </DashboardShell>
  );
}