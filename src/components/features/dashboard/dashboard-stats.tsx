"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, ShoppingBag, DollarSign, Eye, TrendingUp } from "lucide-react";

export function DashboardStats() {
  // In production, these would be fetched from your database
  const stats = [
    {
      title: "Active Tire Listings",
      value: "23",
      change: "+12% from last month",
      icon: Car,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Yard Sale Items",
      value: "8",
      change: "+4 new this week",
      icon: ShoppingBag,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Views",
      value: "1,247",
      change: "+18% this week",
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Revenue",
      value: "$2,450",
      change: "+$340 this month",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
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