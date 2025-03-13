"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchActiveUserStats } from "@/lib/supabase-service";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Define the type for user stats
interface UserWithStats {
  user: {
    id: string;
    email: string;
  };
  totalSessions: number;
  totalRevenue: number;
  messageCount: number;
  leads: number;
  leadScore: number;
  lastActive: Date | null;
}

export function OverviewTab() {
  const [userStats, setUserStats] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await fetchActiveUserStats();
        setUserStats(stats);
      } catch (error) {
        console.error("Error loading user stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div>Loading overview data...</div>;
  }

  // Calculate aggregate metrics
  const totalUsers = userStats.length;
  const totalSessions = userStats.reduce((sum, user) => sum + user.totalSessions, 0);
  const totalRevenue = userStats.reduce((sum, user) => sum + user.totalRevenue, 0);
  const totalLeads = userStats.reduce((sum, user) => sum + user.leads, 0);

  // Prepare data for charts
  const revenueByUser = userStats
    .filter(user => user.totalRevenue > 0)
    .map(user => ({
      name: user.user.email.split('@')[0],  // Use first part of email for privacy
      revenue: user.totalRevenue,
    }));

  const sessionsByUser = userStats
    .filter(user => user.totalSessions > 0)
    .map(user => ({
      name: user.user.email.split('@')[0],
      sessions: user.totalSessions,
    }));

  const leadsByUser = userStats
    .filter(user => user.leads > 0)
    .map(user => ({
      name: user.user.email.split('@')[0],
      leads: user.leads,
      score: parseFloat(user.leadScore.toFixed(2)),
    }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paying Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue by User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByUser}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sessions by User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionsByUser}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#82ca9d" name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Lead Score</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userStats.map((stat) => (
                <TableRow key={stat.user.id}>
                  <TableCell className="font-medium">
                    {stat.user.email}
                  </TableCell>
                  <TableCell>{stat.totalSessions}</TableCell>
                  <TableCell>${stat.totalRevenue.toFixed(2)}</TableCell>
                  <TableCell>{stat.messageCount}</TableCell>
                  <TableCell>{stat.leads}</TableCell>
                  <TableCell>
                    <Badge variant={stat.leadScore > 7 ? "default" : stat.leadScore > 4 ? "secondary" : "outline"}>
                      {stat.leadScore.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {stat.lastActive 
                      ? format(stat.lastActive, "PPpp") 
                      : "Never"
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead Performance by User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByUser}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="leads" fill="#8884d8" name="Leads Count" />
                <Bar yAxisId="right" dataKey="score" fill="#82ca9d" name="Avg Lead Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}