"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, DollarSign, CreditCard } from "lucide-react";
import { BarChart } from "@/components/ui/chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export function OverviewTab() {
  const userGrowthData = [
    { name: "Jan", value: 3200 },
    { name: "Feb", value: 2100 },
    { name: "Mar", value: 4500 },
    { name: "Apr", value: 5200 },
    { name: "May", value: 6800 },
    { name: "Jun", value: 1400 },
    { name: "Jul", value: 2500 },
    { name: "Aug", value: 5600 },
    { name: "Sep", value: 6700 },
    { name: "Oct", value: 4300 },
    { name: "Nov", value: 3800 },
    { name: "Dec", value: 3900 },
  ];

  const revenueData = [
    { name: "Jan", value: 3500 },
    { name: "Feb", value: 2200 },
    { name: "Mar", value: 5100 },
    { name: "Apr", value: 5000 },
    { name: "May", value: 6200 },
    { name: "Jun", value: 1800 },
    { name: "Jul", value: 3100 },
    { name: "Aug", value: 5800 },
    { name: "Sep", value: 6300 },
    { name: "Oct", value: 4800 },
    { name: "Nov", value: 3700 },
    { name: "Dec", value: 3500 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500">+20.1%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500">+201</span> since last hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500">+19%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500">+180.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Monthly User Growth</CardTitle>
            <CardDescription>
              New user registrations over the past year
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <BarChart 
              data={userGrowthData}
              index="name"
              categories={["value"]}
              colors={["chart-1"]}
              valueFormatter={(value) => `${value.toLocaleString()}`}
              yAxisWidth={48}
              height={350}
            />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>
              Revenue generated over the past year
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <BarChart 
              data={revenueData}
              index="name"
              categories={["value"]}
              colors={["chart-2"]}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              yAxisWidth={48}
              height={350}
            />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest sign-ups and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivity />
        </CardContent>
      </Card>
    </div>
  );
}