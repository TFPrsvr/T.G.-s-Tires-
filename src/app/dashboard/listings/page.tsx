import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ListingsManager } from "@/components/features/tire-listings/listings-manager";

async function getUserListings(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId }
  });

  if (!user) return [];

  return await prisma.tireListing.findMany({
    where: { sellerId: user.id },
    orderBy: { createdAt: 'desc' }
  });
}

export default async function ListingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const listings = await getUserListings(userId);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Tire Listings"
        text="Manage all your tire listings and track their performance."
      >
        <Button asChild className="btn-gradient-primary">
          <Link href="/dashboard/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Listing
          </Link>
        </Button>
      </DashboardHeader>

      <ListingsManager initialListings={listings} />
    </DashboardShell>
  );
}