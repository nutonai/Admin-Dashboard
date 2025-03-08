"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";

const usageData = [
  { date: "2023-08-01", messages: 12500, sessions: 4300, activeUsers: 2100 },
  { date: "2023-08-02", messages: 13200, sessions: 4500, activeUsers: 2200 },
  { date: "2023-08-03", messages: 14100, sessions: 4800, activeUsers: 2300 },
  { date: "2023-08-04", messages: 13800, sessions: 4600, activeUsers: 2250 },
  { date: "2023-08-05", messages: 14500, sessions: 4900, activeUsers: 2400 },
  { date: "2023-08-06", messages: 15200, sessions: 5100, activeUsers: 2500 },
  { date: "2023-08-07", messages: 15800, sessions: 5300, activeUsers: 2600 },
  { date: "2023-08-08", messages: 16400, sessions: 5500, activeUsers: 2700 },
  { date: "2023-08-09", messages: 16900, sessions: 5700, activeUsers: 2800 },
  { date: "2023-08-10", messages: 17500, sessions: 5900, activeUsers: 2900 },
  { date: "2023-08-11", messages: 18100, sessions: 6100, activeUsers: 3000 },
  { date: "2023-08-12", messages: 18700, sessions: 6300, activeUsers: 3100 },
  { date: "2023-08-13", messages: 19300, sessions: 6500, activeUsers: 3200 },
  { date: "2023-08-14", messages: 19900, sessions: 6700, activeUsers: 3300 },
];

const engagementData = [
  { metric: "Session Duration", value: 8.5, target: 10, unit: "minutes" },
  { metric: "Messages per Session", value: 12.3, target: 15, unit: "messages" },
  { metric: "Daily Active Users", value: 2350, target: 3000, unit: "users" },
  { metric: "Retention Rate", value: 68, target: 75, unit: "percent" },
];

const performanceData = [
  { metric: "Response Time", value: 120, target: 100, unit: "ms" },
  { metric: "API Latency", value: 85, target: 80, unit: "ms" },
  { metric: "Error Rate", value: 0.8, target: 1, unit: "percent" },
  { metric: "Uptime", value: 99.98, target: 99.95, unit: "percent" },
];

export function AnalyticsTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>
            Track messages, sessions, and active users over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="messages" className="space-y-4">
            <TabsList>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="activeUsers">Active Users</TabsTrigger>
            </TabsList>
            <TabsContent value="messages">
              <LineChart
                data={usageData}
                index="date"
                categories={["messages"]}
                colors={["chart-1"]}
                valueFormatter={(value) => `${value.toLocaleString()}`}
                yAxisWidth={60}
                height={350}
              />
            </TabsContent>
            <TabsContent value="sessions">
              <LineChart
                data={usageData}
                index="date"
                categories={["sessions"]}
                colors={["chart-2"]}
                valueFormatter={(value) => `${value.toLocaleString()}`}
                yAxisWidth={60}
                height={350}
              />
            </TabsContent>
            <TabsContent value="activeUsers">
              <LineChart
                data={usageData}
                index="date"
                categories={["activeUsers"]}
                colors={["chart-3"]}
                valueFormatter={(value) => `${value.toLocaleString()}`}
                yAxisWidth={60}
                height={350}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>
              Key metrics for user engagement and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {engagementData.map((item) => (
                <div key={item.metric} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{item.metric}</p>
                      <p className="text-xs text-muted-foreground">
                        Target: {item.target} {item.unit}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {item.value} {item.unit}
                    </p>
                  </div>
                  <Progress
                    value={(item.value / item.target) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>
              Technical performance metrics and benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {performanceData.map((item) => (
                <div key={item.metric} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{item.metric}</p>
                      <p className="text-xs text-muted-foreground">
                        Target: {item.target} {item.unit}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {item.value} {item.unit}
                    </p>
                  </div>
                  <Progress
                    value={
                      item.metric === "Error Rate"
                        ? 100 - (item.value / item.target) * 100
                        : (item.value / item.target) * 100
                    }
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}