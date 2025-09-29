"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Eye, TrendingUp, Loader2 } from "lucide-react";

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
      icon: "tire",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Yard Sale Items",
      value: stats?.yardSaleItems?.value?.toString() || "0",
      change: stats?.yardSaleItems?.change || "No change",
      icon: "yardSale",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Views",
      value: stats?.totalViews?.value?.toLocaleString() || "0",
      change: stats?.totalViews?.change || "No change",
      icon: "eyeView",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Items Sold",
      value: stats?.soldItems?.value?.toString() || "0",
      change: stats?.soldItems?.change || "No change",
      icon: "dollarSign",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-0.5 gap-y-6">
      {dashboardStats.map((stat, index) => {
        const renderIcon = () => {
          if (stat.icon === "tire") {
            return (
              <div
                className={`h-10 w-10 ${stat.color}`}
                style={{
                  mask: "url('/icons/tire.svg') no-repeat center",
                  maskSize: '95%',
                  backgroundColor: 'currentColor'
                }}
              />
            );
          } else if (stat.icon === "yardSale") {
            return (
              <div
                className={`h-8 w-8 ${stat.color}`}
                style={{
                  mask: "url('/icons/sign.svg') no-repeat center",
                  maskSize: '80%',
                  backgroundColor: 'currentColor'
                }}
              />
            );
          } else if (stat.icon === "eyeView") {
            return (
              <div
                className={`h-8 w-8 ${stat.color}`}
                style={{
                  mask: "url('/icons/eyeView.svg') no-repeat center",
                  maskSize: '80%',
                  backgroundColor: 'currentColor'
                }}
              />
            );
          } else if (stat.icon === "dollarSign") {
            return <DollarSign className={`h-8 w-8 ${stat.color}`} />;
          } else if (typeof stat.icon === 'function') {
            const IconComponent = stat.icon;
            return <IconComponent className={`h-8 w-8 ${stat.color}`} />;
          }
          return null;
        };

        return (
          <Card key={index} className="product-card max-w-[280px] hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-3 py-0.5">
              <CardTitle className="text-xs font-medium text-gray-600 leading-none">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-sm`}>
                {renderIcon()}
              </div>
            </CardHeader>
            <CardContent className="px-3 py-0.5 pt-0">
              <div className="flex items-center justify-between">
                <div className="text-base font-bold text-contrast-aa leading-none relative -top-0.5 ml-2">{stat.value}</div>
                <div className="flex items-center relative -top-0.5 mr-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-gray-600 leading-none">{stat.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}