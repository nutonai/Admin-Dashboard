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
import { ClientWithStats, fetchClientStats } from "@/lib/supabase-service";
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

export function OverviewTab() {
  const [clientStats, setClientStats] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await fetchClientStats();
        setClientStats(stats);
      } catch (error) {
        console.error("Error loading client stats:", error);
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
  const totalClients = clientStats.length;
  const totalSessions = clientStats.reduce((sum, client) => sum + client.totalSessions, 0);
  const totalRevenue = clientStats.reduce((sum, client) => sum + client.totalRevenue, 0);
  const totalLeads = clientStats.reduce((sum, client) => sum + client.leads, 0);

  // Prepare data for charts
  const revenueByClient = clientStats
    .filter(client => client.totalRevenue > 0)
    .map(client => ({
      name: client.client.client_id,
      revenue: client.totalRevenue,
    }));

  const sessionsByClient = clientStats
    .filter(client => client.totalSessions > 0)
    .map(client => ({
      name: client.client.client_id,
      sessions: client.totalSessions,
    }));

  const leadsByClient = clientStats
    .filter(client => client.leads > 0)
    .map(client => ({
      name: client.client.client_id,
      leads: client.leads,
      score: parseFloat(client.leadScore.toFixed(2)),
    }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
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
            <CardTitle>Revenue by Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByClient}>
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
            <CardTitle>Sessions by Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionsByClient}>
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
          <CardTitle>Client Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client ID</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Lead Score</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientStats.map((stat) => {
                const lastActive = stat.usage.length > 0 
                  ? new Date(Math.max(...stat.usage.map(u => new Date(u.last_active).getTime())))
                  : null;

                return (
                  <TableRow key={stat.client.id}>
                    <TableCell className="font-medium">
                      {stat.client.client_id}
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
                      {lastActive 
                        ? format(lastActive, "PPpp") 
                        : "Never"
                      }
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead Performance by Client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByClient}>
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