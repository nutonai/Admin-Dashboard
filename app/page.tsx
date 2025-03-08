import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 md:px-6">
        <DashboardHeader />
        <DashboardTabs />
      </div>
    </main>
  );
}