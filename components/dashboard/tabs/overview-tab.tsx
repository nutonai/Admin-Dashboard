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
import { supabase } from "@/lib/supabase-service";
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

// Define types for our dashboard data
interface UserBaseStats {
  contactLeads: number;
  totalRegisteredUsers: number;
  totalPaidUsers: number;
  conversionRate: number;
}

interface MonthlyGrowthData {
  month: string;
  totalUsers: number;
  paidUsers: number;
}

interface PlanDistribution {
  name: string;
  percentage: number;
  count: number;
}

interface PlanDetails {
  plan: string;
  users: number;
  percentage: number;
  monthlyRevenue: number;
}

interface UserPlanDetail {
  userId: string;
  userName: string;
  planName: string;
}

interface PlanCount {
  planName: string;
  count: number;
}

// Type for nested Supabase response
interface UserSubscriptionWithRelations {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  users: { 
    name: string | null; 
    email: string | null;
  };
  subscription_plans: {
    name: string | null;
  };
}

export function OverviewTab() {
  const [userBaseStats, setUserBaseStats] = useState<UserBaseStats>({
    contactLeads: 0,
    totalRegisteredUsers: 0,
    totalPaidUsers: 0,
    conversionRate: 0,
  });
  const [monthlyGrowth, setMonthlyGrowth] = useState<MonthlyGrowthData[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution[]>([]);
  const [planDetails, setPlanDetails] = useState<PlanDetails[]>([]);
  const [userPlanDetails, setUserPlanDetails] = useState<UserPlanDetail[]>([]);
  const [planCounts, setPlanCounts] = useState<PlanCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        console.log("Fetching dashboard data from Supabase...");
        
        // Test Supabase connection
        const { data: connectionTest, error: connectionError } = await supabase.from('users').select('count');
        
        if (connectionError) {
          console.error("Database connection error:", connectionError);
          setError("Failed to connect to the database. Please check your credentials.");
          setLoading(false);
          return;
        }
        
        console.log("Database connection successful");
        
        // Fetch actual data from Supabase
        await fetchUserBaseStats();
        await fetchMonthlyGrowthData();
        await fetchPlanData();
        await fetchUserPlanDetails();
        await fetchPlanCounts();
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("An error occurred while fetching dashboard data.");
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  async function fetchUserBaseStats() {
    try {
      console.log("Fetching user base statistics...");
      
      // Count contact leads from leads table
      const { count: contactLeads, error: leadsError } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true });
      
      if (leadsError) {
        console.error("Error fetching contact leads:", leadsError);
      }
      
      // Count total registered users
      const { count: totalRegisteredUsers, error: usersError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });
      
      if (usersError) {
        console.error("Error fetching registered users:", usersError);
      }
      
      // Count total paid users (active subscriptions)
      const { count: totalPaidUsers, error: paidUsersError } = await supabase
        .from('user_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');
      
      if (paidUsersError) {
        console.error("Error fetching paid users:", paidUsersError);
      }
      
      // Calculate conversion rate
      const conversionRate = totalRegisteredUsers && totalRegisteredUsers > 0
        ? ((totalPaidUsers || 0) / totalRegisteredUsers) * 100
        : 0;
      
      console.log("User base stats:", {
        contactLeads,
        totalRegisteredUsers,
        totalPaidUsers,
        conversionRate: conversionRate.toFixed(1)
      });
      
      // Update state with real data
      setUserBaseStats({
        contactLeads: contactLeads || 0,
        totalRegisteredUsers: totalRegisteredUsers || 0,
        totalPaidUsers: totalPaidUsers || 0,
        conversionRate: Number(conversionRate.toFixed(1)),
      });
    } catch (error) {
      console.error("Error in fetchUserBaseStats:", error);
    }
  }

  async function fetchMonthlyGrowthData() {
    try {
      console.log("Fetching monthly growth data...");
      
      // Get the current date and calculate 5 months ago
      const now = new Date();
      const fiveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 4, 1);
      
      // Fetch users registered in the last 5 months
      const { data: recentUsers, error: usersError } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', fiveMonthsAgo.toISOString());
      
      if (usersError) {
        console.error("Error fetching users for monthly growth:", usersError);
        return;
      }
      
      // Fetch paid users in the last 5 months
      const { data: recentPaidUsers, error: paidUsersError } = await supabase
        .from('user_subscriptions')
        .select('created_at')
        .eq('status', 'active')
        .gte('created_at', fiveMonthsAgo.toISOString());
      
      if (paidUsersError) {
        console.error("Error fetching paid users for monthly growth:", paidUsersError);
        return;
      }
      
      console.log(`Retrieved ${recentUsers?.length || 0} recent users and ${recentPaidUsers?.length || 0} recent paid users`);
      
      // Prepare monthly data
      const monthNames = ['Mar', 'Apr', 'May', 'Jun', 'Jul']; // Last 5 months
      const growthData: MonthlyGrowthData[] = [];
      
      for (let i = 0; i < 5; i++) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - 4 + i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - 3 + i, 0);
        
        // Count users for this month
        const usersInMonth = recentUsers?.filter(user => {
          const date = new Date(user.created_at);
          return date >= monthStart && date <= monthEnd;
        }).length || 0;
        
        // Count paid users for this month
        const paidUsersInMonth = recentPaidUsers?.filter(user => {
          const date = new Date(user.created_at);
          return date >= monthStart && date <= monthEnd;
        }).length || 0;
        
        growthData.push({
          month: monthNames[i],
          totalUsers: usersInMonth,
          paidUsers: paidUsersInMonth
        });
      }
      
      console.log("Monthly growth data:", growthData);
      
      // Update state with real data
      setMonthlyGrowth(growthData);
    } catch (error) {
      console.error("Error in fetchMonthlyGrowthData:", error);
    }
  }

  async function fetchUserPlanDetails() {
    try {
      console.log("Fetching user plan details...");
      
      // Query with proper join syntax for Supabase
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          user_id,
          plan_id,
          users!user_id(name, email),
          subscription_plans!plan_id(name)
        `)
        .eq('status', 'active');
      
      if (error) {
        console.error("Error fetching user plan details:", error);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log("No user plan details found");
        return;
      }
      
      // Type assertion to help TypeScript understand the structure
      const typedData = data as unknown as UserSubscriptionWithRelations[];
      
      // Transform the data to match our interface
      const userPlanData: UserPlanDetail[] = typedData.map(item => {
        return {
          userId: item.user_id,
          userName: item.users ? (item.users.name || item.users.email || 'Unknown User') : 'Unknown User',
          planName: item.subscription_plans ? item.subscription_plans.name || 'Unknown Plan' : 'Unknown Plan'
        };
      });
      
      console.log(`Fetched ${userPlanData.length} user plan details`);
      setUserPlanDetails(userPlanData);
    } catch (error) {
      console.error("Error in fetchUserPlanDetails:", error);
    }
  }

  async function fetchPlanData() {
    try {
      console.log("Fetching plan data from Supabase directly...");
      
      // Get the three plan types: Starter, Pro, and Ultra
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('id, name, monthly_price')
        .or('name.ilike.%starter%,name.ilike.%pro%,name.ilike.%ultra%')
        .order('monthly_price');
      
      if (plansError) {
        console.error("Error fetching subscription plans:", plansError);
        return;
      }
      
      if (!plans || plans.length === 0) {
        console.error("No subscription plans found in the database");
        return;
      }
      
      console.log("Found plans:", plans.map(p => p.name).join(", "));
      
      // Get direct counts for each plan
      const planResults = await Promise.all(
        plans.map(async (plan) => {
          // Direct count query for this specific plan
          const { count, error } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('plan_id', plan.id)
            .eq('status', 'active');
          
          if (error) {
            console.error(`Error counting users for plan ${plan.name}:`, error);
            return {
              name: plan.name,
              count: 0,
              price: Number(plan.monthly_price) || 0
            };
          }
          
          console.log(`Plan ${plan.name} has ${count} active users`);
          
          return {
            name: plan.name,
            count: count || 0,
            price: Number(plan.monthly_price) || 0
          };
        })
      );
      
      // Calculate total users for percentage
      const totalUsers = planResults.reduce((sum, plan) => sum + plan.count, 0);
      
      // Create the formatted data for display
      const planDetails: PlanDetails[] = planResults.map(plan => ({
        plan: plan.name,
        users: plan.count,
        percentage: totalUsers > 0 ? Math.round((plan.count / totalUsers) * 100) : 0,
        monthlyRevenue: plan.count * plan.price
      }));
      
      const planDistribution: PlanDistribution[] = planResults.map(plan => ({
        name: plan.name,
        count: plan.count,
        percentage: totalUsers > 0 ? Math.round((plan.count / totalUsers) * 100) : 0
      }));
      
      // Sort by user count (highest first)
      planDetails.sort((a, b) => b.users - a.users);
      planDistribution.sort((a, b) => b.count - a.count);
      
      console.log("Final real plan data:", planDetails);
      
      // Update state with the data
      setPlanDetails(planDetails);
      setPlanDistribution(planDistribution);
      
    } catch (error) {
      console.error("Error in fetchPlanData:", error);
    }
  }

  async function fetchPlanCounts() {
    try {
      console.log("Fetching plan counts directly from user_subscriptions...");
      
      // Get the three plans: Starter, Pro, and Ultra
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('id, name')
        .or('name.ilike.%starter%,name.ilike.%pro%,name.ilike.%ultra%');
      
      if (plansError) {
        console.error("Error fetching subscription plans:", plansError);
        return;
      }
      
      if (!plans) {
        console.log("No plans found");
        return;
      }
      
      console.log("Found plans for counting:", plans.map(p => p.name).join(", "));
      
      // Get the exact count for each plan
      const countPromises = plans.map(async (plan) => {
        const { count, error } = await supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('plan_id', plan.id)
          .eq('status', 'active');
        
        if (error) {
          console.error(`Error counting users for plan ${plan.name}:`, error);
          return {
            planName: plan.name,
            count: 0
          };
        }
        
        console.log(`Direct count for ${plan.name}: ${count} users`);
        
        return {
          planName: plan.name,
          count: count || 0
        };
      });
      
      const planCountsData = await Promise.all(countPromises);
      
      // Sort by count for better display
      planCountsData.sort((a, b) => b.count - a.count);
      
      console.log("Final plan counts from direct queries:", planCountsData);
      setPlanCounts(planCountsData);
    } catch (error) {
      console.error("Error in fetchPlanCounts:", error);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <div>Loading dashboard data...</div>
      </div>
    </div>;
  }

  if (error) {
    return <div className="p-4 text-center text-destructive bg-destructive/10 rounded-md">
      <h3 className="font-medium mb-2">Error</h3>
      <p>{error}</p>
      <button 
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBaseStats.contactLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBaseStats.totalRegisteredUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBaseStats.totalPaidUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBaseStats.conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly User Growth</CardTitle>
          <p className="text-sm text-muted-foreground">Total and paid users registered since March 2025</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalUsers" fill="#8884d8" name="Total Users" />
                <Bar dataKey="paidUsers" fill="#82ca9d" name="Paid Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Active users by plan type</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planDistribution.map((plan) => (
                <div key={plan.name} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">{plan.count} users</p>
                  </div>
                  <div className="font-bold">{plan.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
            <p className="text-sm text-muted-foreground">Monthly recurring revenue by plan</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>% of Total</TableHead>
                  <TableHead>Monthly Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planDetails.map((plan) => (
                  <TableRow key={plan.plan}>
                    <TableCell className="font-medium">{plan.plan}</TableCell>
                    <TableCell>{plan.users}</TableCell>
                    <TableCell>{plan.percentage}%</TableCell>
                    <TableCell>${plan.monthlyRevenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

     
      <Card>
        <CardHeader>
          <CardTitle>User Plan Details</CardTitle>
          <p className="text-sm text-muted-foreground">Users with their subscription plans</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userPlanDetails.map((user, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{user.userName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.planName}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
