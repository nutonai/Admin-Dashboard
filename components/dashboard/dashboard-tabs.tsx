"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/dashboard/tabs/overview-tab";
import { ContactSubmissionsTab } from "@/components/dashboard/tabs/contact-submissions-tab";
import { SubscriptionsTab } from "@/components/dashboard/tabs/subscriptions-tab";

export function DashboardTabs() {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3 md:w-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="contacts">Subscriptions</TabsTrigger>
        <TabsTrigger value="subscriptions">Contacts</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <OverviewTab />
      </TabsContent>
      <TabsContent value="contacts" className="space-y-4">
        <SubscriptionsTab />
      </TabsContent>
      <TabsContent value="subscriptions" className="space-y-4">
        <ContactSubmissionsTab />
      </TabsContent>
    </Tabs>
  );
}