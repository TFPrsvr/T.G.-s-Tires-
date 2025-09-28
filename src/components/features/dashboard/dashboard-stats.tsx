"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, ShoppingBag, DollarSign, Eye, TrendingUp, Loader2 } from "lucide-react";

interface DashboardStatsData {
  totalListings: { value: number; change: string; trend: string };
  activeListings: { value: number; change: string; trend: string };
  totalViews: { value: number; change: string; trend: string };
  soldItems: { value: number; change: string; trend: string };
  yardSaleItems: { value: number; change: string; trend: string };
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // First sync user to ensure they exist in database
        await fetch('/api/auth/sync-user', { method: 'POST' });

        // Then fetch stats
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="product-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Active Tire Listings",
      value: stats?.activeListings?.value?.toString() || "0",
      change: stats?.activeListings?.change || "No change",
      icon: Car,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Yard Sale Items",
      value: stats?.yardSaleItems?.value?.toString() || "0",
      change: stats?.yardSaleItems?.change || "No change",
      icon: ShoppingBag,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Views",
      value: stats?.totalViews?.value?.toLocaleString() || "0",
      change: stats?.totalViews?.change || "No change",
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Items Sold",
      value: stats?.soldItems?.value?.toString() || "0",
      change: stats?.soldItems?.change || "No change",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {dashboardStats.map((stat, index) => {
        const IconComponent = stat.icon;

        return (
          <Card key={index} className="product-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-md`}>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-contrast-aa">{stat.value}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <p className="text-xs text-gray-600">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}