"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/dashboard/tabs/overview-tab";
import { UsersTab } from "@/components/dashboard/tabs/users-tab";
import { PaymentsTab } from "@/components/dashboard/tabs/payments-tab";
import { AnalyticsTab } from "@/components/dashboard/tabs/analytics-tab";

export function DashboardTabs() {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 md:w-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <OverviewTab />
      </TabsContent>
      <TabsContent value="users" className="space-y-4">
        <UsersTab />
      </TabsContent>
      <TabsContent value="payments" className="space-y-4">
        <PaymentsTab />
      </TabsContent>
      <TabsContent value="analytics" className="space-y-4">
        <AnalyticsTab />
      </TabsContent>
    </Tabs>
  );
}