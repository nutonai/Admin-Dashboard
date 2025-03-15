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
      
      // Get the current date
      const currentDate = new Date();
      
      // Set up month names - use the last 5 months
      const months = [];
      for (let i = 4; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(currentDate.getMonth() - i);
        months.push({
          name: date.toLocaleString('default', { month: 'short' }),
          year: date.getFullYear(),
          month: date.getMonth() + 1, // JavaScript months are 0-indexed
        });
      }

      // Get all users with creation dates
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, created_at');
      
      if (usersError) {
        console.error("Error fetching users for monthly growth:", usersError);
        return;
      }
      
      // Get all subscriptions with creation dates and status
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('user_id, created_at, status');
      
      if (subscriptionsError) {
        console.error("Error fetching subscriptions for monthly growth:", subscriptionsError);
        return;
      }
      
      // Calculate monthly data based on registration dates
      const growthData = months.map(monthData => {
        // Count users registered in this month
        const usersInMonth = users?.filter(user => {
          if (!user.created_at) return false;
          
          const createdAt = new Date(user.created_at);
          return createdAt.getMonth() + 1 === monthData.month && 
                 createdAt.getFullYear() === monthData.year;
        }).length || 0;
        
        // Count paid users registered in this month
        const paidUsersInMonth = subscriptions?.filter(sub => {
          if (!sub.created_at || sub.status !== 'active') return false;
          
          const createdAt = new Date(sub.created_at);
          return createdAt.getMonth() + 1 === monthData.month && 
                 createdAt.getFullYear() === monthData.year;
        }).length || 0;
        
        return {
          month: monthData.name,
          totalUsers: usersInMonth,
          paidUsers: paidUsersInMonth
        };
      });
      
      console.log("Monthly growth data:", growthData);
      
      setMonthlyGrowth(growthData);
    } catch (error) {
      console.error("Error in fetchMonthlyGrowthData:", error);
    }
  }

  async function fetchPlanData() {
    try {
      console.log("Fetching plan data...");
      
      // Step 1: Get all subscription plans
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('id, plan_id, name, monthly_price');
      
      if (plansError) {
        console.error("Error fetching subscription plans:", plansError);
        return;
      }
      
      if (!plans || plans.length === 0) {
        console.log("No subscription plans found");
        return;
      }
      
      console.log(`Found ${plans.length} subscription plans`);
      
      // Step 2: Get user subscriptions and count by plan
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('plan_id')
        .eq('status', 'active');
      
      if (subscriptionsError) {
        console.error("Error fetching user subscriptions:", subscriptionsError);
        return;
      }
      
      // Create a map of plan_id to count
      const planCounts = new Map<string, number>();
      
      subscriptions?.forEach(sub => {
        const currentCount = planCounts.get(sub.plan_id) || 0;
        planCounts.set(sub.plan_id, currentCount + 1);
      });
      
      // Calculate total users for percentage calculation
      const totalActiveUsers = subscriptions?.length || 0;
      
      // Create plan distribution and details arrays
      const planDistributionData: PlanDistribution[] = [];
      const planDetailsData: PlanDetails[] = [];
      
      plans.forEach(plan => {
        const userCount = planCounts.get(plan.plan_id) || 0;
        const percentage = totalActiveUsers > 0 ? 
          Math.round((userCount / totalActiveUsers) * 100) : 0;
        const monthlyRevenue = userCount * Number(plan.monthly_price || 0);
        
        planDistributionData.push({
          name: plan.name || 'Unknown Plan',
          count: userCount,
          percentage
        });
        
        planDetailsData.push({
          plan: plan.name || 'Unknown Plan',
          users: userCount,
          percentage,
          monthlyRevenue
        });
      });
      
      // Sort by user count (highest first)
      planDistributionData.sort((a, b) => b.count - a.count);
      planDetailsData.sort((a, b) => b.users - a.users);
      
      console.log("Plan distribution data:", planDistributionData);
      console.log("Plan details data:", planDetailsData);
      
      setPlanDistribution(planDistributionData);
      setPlanDetails(planDetailsData);
    } catch (error) {
      console.error("Error in fetchPlanData:", error);
    }
  }

  async function fetchUserPlanDetails() {
    try {
      console.log("Fetching user plan details...");
      
      // Get all active subscriptions with user IDs and plan IDs
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('user_id, plan_id')
        .eq('status', 'active');
      
      if (subscriptionsError) {
        console.error("Error fetching user subscriptions:", subscriptionsError);
        return;
      }
      
      if (!subscriptions || subscriptions.length === 0) {
        console.log("No active subscriptions found");
        return;
      }
      
      // Extract unique user IDs and plan IDs
      const userIds = [...new Set(subscriptions.map(sub => sub.user_id))];
      const planIds = [...new Set(subscriptions.map(sub => sub.plan_id))];
      
      // Get users by their IDs
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds);
      
      if (usersError) {
        console.error("Error fetching users:", usersError);
        return;
      }
      
      // Create a map of user IDs to user names (using email as fallback)
      const userMap = new Map<string, string>();
      users?.forEach(user => {
        userMap.set(user.id, user.email || `User ${user.id.substring(0, 8)}`);
      });
      
      // Get plans by their IDs
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('plan_id, name')
        .in('plan_id', planIds);
      
      if (plansError) {
        console.error("Error fetching plans:", plansError);
        return;
      }
      
      // Create a map of plan IDs to plan names
      const planMap = new Map<string, string>();
      plans?.forEach(plan => {
        planMap.set(plan.plan_id, plan.name || `Plan ${plan.plan_id}`);
      });
      
      // Combine the data for display
      const userPlanData: UserPlanDetail[] = subscriptions.map(sub => {
        return {
          userId: sub.user_id,
          userName: userMap.get(sub.user_id) || `User ${sub.user_id.substring(0, 8)}`,
          planName: planMap.get(sub.plan_id) || `Plan ${sub.plan_id}`
        };
      });
      
      console.log(`Found ${userPlanData.length} user-plan relationships`);
      
      setUserPlanDetails(userPlanData);
    } catch (error) {
      console.error("Error in fetchUserPlanDetails:", error);
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
          <p className="text-sm text-muted-foreground">New users and subscriptions in the last 5 months</p>
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
              {userPlanDetails.length > 0 ? (
                userPlanDetails.map((user, index) => (
                  <TableRow key={user.userId + index}>
                    <TableCell className="font-medium">{user.userName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.planName}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                    No active subscriptions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}