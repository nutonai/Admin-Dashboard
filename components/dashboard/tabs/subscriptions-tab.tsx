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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase-service";
import { PauseCircle, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardUserData {
  id: string;
  name: string;
  email: string;
  planType: string;
  planId: string;
  messagesCount: number;
  leadsCount: number;
  avgLeadScore: number;
  status: 'Active' | 'Disabled';
  website: string;
  dateSignedUp: string;
  lastActive: string | null;
  totalRevenue: number;
}

export function SubscriptionsTab() {
  const [userData, setUserData] = useState<DashboardUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

    useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        console.log("Fetching subscription data from Supabase...");
  
        // 1. Fetch data from the users table - this has email and created_at
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, created_at');
  
        if (usersError) {
          console.error("Users data error:", usersError);
          throw usersError;
        }
        
        console.log(`Users data: ${usersData?.length || 0} records found`);
        
        if (!usersData || usersData.length === 0) {
          console.log("No users found");
          setUserData([]);
          setLoading(false);
          return;
        }
  
        // Extract user IDs for subsequent queries
        const userIds = usersData.map(user => user.id);
        console.log(`Found ${userIds.length} users`);
  
        // 2. Fetch user_subscriptions data to get active subscriptions
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('user_subscriptions')
          .select('id, user_id, plan_id, status')
          .in('user_id', userIds);
          
        if (subscriptionsError) {
          console.error("Subscriptions data error:", subscriptionsError);
          throw subscriptionsError;
        }
        
        console.log(`Subscriptions data: ${subscriptionsData?.length || 0} records found`);
  
        // Create map for subscription status and plan IDs
        const subscriptionMap = new Map<string, {status: string, planId: string}>();
        if (subscriptionsData && subscriptionsData.length > 0) {
          subscriptionsData.forEach(sub => {
            subscriptionMap.set(sub.user_id, {
              status: sub.status,
              planId: sub.plan_id
            });
          });
        }
  
        // 3. Fetch subscription plans data
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('id, plan_id, name, monthly_price, yearly_price');
  
        if (planError) {
          console.error("Plan data error:", planError);
          throw planError;
        }
        
        console.log(`Plan data: ${planData?.length || 0} records found`);
  
        // Create maps to store plan information and prices
        const plansMap = new Map<string, string>();
        const planPriceMap = new Map<string, number>();
        
        if (planData && planData.length > 0) {
          planData.forEach(plan => {
            plansMap.set(plan.plan_id, plan.name);
            // Use monthly price as default price indicator
            planPriceMap.set(plan.plan_id, Number(plan.monthly_price));
          });
        }
  
        // 4. Fetch crawl_records data for website URLs
        const { data: crawlData, error: crawlError } = await supabase
          .from('crawl_records')
          .select('id, user_id, url')
          .in('user_id', userIds);
  
        if (crawlError) {
          console.error("Crawl records error:", crawlError);
          throw crawlError;
        }
        
        console.log(`Crawl records: ${crawlData?.length || 0} records found`);
  
        // Create map for website URLs
        const websiteMap = new Map<string, string>();
        
        if (crawlData && crawlData.length > 0) {
          // Group by user_id and take the most recent crawl record
          const userCrawls = new Map();
          
          crawlData.forEach(crawl => {
            if (!userCrawls.has(crawl.user_id) || 
                (crawl.id > userCrawls.get(crawl.user_id).id)) {
              userCrawls.set(crawl.user_id, crawl);
            }
          });
          
          // Set the URL for each user
          userCrawls.forEach((crawl, userId) => {
            if (crawl.url) {
              websiteMap.set(userId, crawl.url);
            }
          });
        }
  
        // 5. Fetch session data for last active
        const { data: sessionData, error: sessionError } = await supabase
          .from('session')
          .select('id, user_id, last_active')
          .in('user_id', userIds);
  
        if (sessionError) {
          console.error("Session data error:", sessionError);
          throw sessionError;
        }
        
        console.log(`Session data: ${sessionData?.length || 0} records found`);
  
        // Create map of session IDs to user IDs and track last active date
        const sessionIdToUserIdMap = new Map<string, string>();
        const lastActiveMap = new Map<string, string>();
        
        if (sessionData && sessionData.length > 0) {
          // Group sessions by user
          const userSessions = new Map<string, Array<{id: string, last_active: string}>>();
          
          sessionData.forEach(session => {
            sessionIdToUserIdMap.set(session.id, session.user_id);
            
            if (!userSessions.has(session.user_id)) {
              userSessions.set(session.user_id, []);
            }
            
            userSessions.get(session.user_id)!.push({
              id: session.id,
              last_active: session.last_active
            });
          });
          
          // Find most recent last active date per user
          userSessions.forEach((sessions, userId) => {
            const mostRecentSession = sessions.reduce((latest, current) => {
              if (!latest.last_active) return current;
              if (!current.last_active) return latest;
              return new Date(current.last_active) > new Date(latest.last_active) ? current : latest;
            }, { id: '', last_active: '' });
            
            if (mostRecentSession.last_active) {
              lastActiveMap.set(userId, mostRecentSession.last_active);
            }
          });
        }
  
        // 6. Get chat_sessions and link them to sessions and users
        const { data: chatSessionsData, error: chatSessionsError } = await supabase
          .from('chat_sessions')
          .select('id, session_id');
  
        if (chatSessionsError) {
          console.error("Chat sessions error:", chatSessionsError);
          throw chatSessionsError;
        }
  
        console.log(`Chat sessions data: ${chatSessionsData?.length || 0} records found`);
  
        // Create map of chat session IDs to user IDs
        const chatSessionIdToUserIdMap = new Map<string, string>();
        
        if (chatSessionsData && chatSessionsData.length > 0) {
          chatSessionsData.forEach(chatSession => {
            const userId = sessionIdToUserIdMap.get(chatSession.session_id);
            if (userId) {
              chatSessionIdToUserIdMap.set(chatSession.id, userId);
            }
          });
        }
  
        // 7. Fetch and count messages per user using the correct relationships
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select('id, session_id');
  
        if (messageError) {
          console.error("Message data error:", messageError);
          throw messageError;
        }
        
        console.log(`Message data: ${messageData?.length || 0} records found`);
  
        // Count messages per user
        const messageCountMap = new Map<string, number>();
        if (messageData && messageData.length > 0) {
          messageData.forEach(msg => {
            const userId = chatSessionIdToUserIdMap.get(msg.session_id);
            if (userId) {
              messageCountMap.set(userId, (messageCountMap.get(userId) || 0) + 1);
            }
          });
        }
  
        // 8. Fetch leads data and calculate lead counts and scores
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('id, user_id, lead_score');
  
        if (leadsError) {
          console.error("Leads data error:", leadsError);
          throw leadsError;
        }
        
        console.log(`Leads data: ${leadsData?.length || 0} records found`);
  
        // Group leads by user_id and calculate metrics
        const userLeadsMap = new Map<string, Array<number>>();
        const leadCountMap = new Map<string, number>();
        
        if (leadsData && leadsData.length > 0) {
          leadsData.forEach(lead => {
            const userId = lead.user_id;
            
            // Count leads per user
            leadCountMap.set(userId, (leadCountMap.get(userId) || 0) + 1);
            
            // Store lead scores for calculating averages
            if (lead.lead_score) {
              if (!userLeadsMap.has(userId)) {
                userLeadsMap.set(userId, []);
              }
              userLeadsMap.get(userId)!.push(lead.lead_score);
            }
          });
        }
  
        // Calculate average lead scores
        const avgLeadScoreMap = new Map<string, number>();
        userLeadsMap.forEach((scores, userId) => {
          if (scores.length > 0) {
            const sum = scores.reduce((a, b) => a + b, 0);
            avgLeadScoreMap.set(userId, Math.round(sum / scores.length));
          }
        });
  
        // 9. Fetch payment history for revenue calculation
        const { data: payments, error: paymentError } = await supabase
          .from('payment_history')
          .select('*')
          .in('user_id', userIds)
          .eq('status', 'succeeded');
  
        if (paymentError) {
          console.error("Payment history error:", paymentError);
          throw paymentError;
        }
        
        console.log(`Payment data: ${payments?.length || 0} records found`);
  
        // Calculate total revenue per user
        const revenueMap = new Map<string, number>();
        if (payments && payments.length > 0) {
          payments.forEach(payment => {
            revenueMap.set(payment.user_id, 
              (revenueMap.get(payment.user_id) || 0) + Number(payment.amount));
          });
        }
  
        // 10. Combine all data into the final dashboard format
        const combinedData: DashboardUserData[] = usersData.map(user => {
          const subscription = subscriptionMap.get(user.id);
          const planId = subscription?.planId || 'free';
          
          // Get revenue from payments or use the plan price as a fallback
          let userRevenue = revenueMap.get(user.id) || 0;
          
          // If revenue is 0 but user has an active subscription, use the plan price
          if (userRevenue === 0 && subscription?.status === 'active') {
            userRevenue = planPriceMap.get(planId) || 0;
          }
          
          return {
            id: user.id,
            name: user.email?.split('@')[0] || `User ${user.id.substring(0, 8)}`,
            email: user.email || `user-${user.id.substring(0, 5)}@example.com`,
            website: websiteMap.get(user.id) || "",
            dateSignedUp: user.created_at || "",
            planType: plansMap.get(planId) || "Free Plan",
            planId: planId,
            messagesCount: messageCountMap.get(user.id) || 0,
            leadsCount: leadCountMap.get(user.id) || 0,
            avgLeadScore: avgLeadScoreMap.get(user.id) || 0,
            status: subscription?.status === 'active' ? 'Active' : 'Disabled',
            lastActive: lastActiveMap.get(user.id) || null,
            totalRevenue: userRevenue
          };
        });
        
        console.log(`Final dashboard data compiled for ${combinedData.length} users`);
  
        setUserData(combinedData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setUserData([]);
        
        toast({
          title: "Error",
          description: "Failed to fetch subscription data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  
    fetchDashboardData();
  }, [toast]);

  const activeUsers = userData.filter(user => user.status === 'Active').length;
  const totalMessages = userData.reduce((sum, user) => sum + user.messagesCount, 0);
  const totalLeads = userData.reduce((sum, user) => sum + user.leadsCount, 0);
  const totalRevenue = userData.reduce((sum, user) => sum + user.totalRevenue, 0);

  const handleToggleStatus = async (userId: string) => {
    try {
      // Get current status
      const currentUser = userData.find(user => user.id === userId);
      if (!currentUser) return;
      
      const newStatus = currentUser.status === 'Active' ? 'Disabled' : 'Active';

      // Update subscription status in database
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: newStatus === 'Active' ? 'active' : 'inactive' })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUserData(userData.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus } 
          : user
      ));

      toast({
        title: "Status Changed",
        description: `User subscription has been ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription status.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading subscription data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {userData.length === 0 ? (
        <div className="py-8 text-center">
          <h3 className="text-lg font-medium mb-2">No subscription data found</h3>
          <p className="text-muted-foreground">No users have been found in the database.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">User Subscriptions</h3>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Date Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-center">Messages</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="text-center">Lead Score</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userData.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.website}</TableCell>
                    <TableCell>
                      {user.dateSignedUp ? format(new Date(user.dateSignedUp), "yyyy-MM-dd") : ""}
                    </TableCell>
                    <TableCell>
                      {user.lastActive ? format(new Date(user.lastActive), "yyyy-MM-dd") : "Never"}
                    </TableCell>
                    <TableCell>{user.planType}</TableCell>
                    <TableCell className="text-center">{user.messagesCount}</TableCell>
                    <TableCell className="text-center">{user.leadsCount}</TableCell>
                    <TableCell className="text-center">{user.avgLeadScore}</TableCell>
                    <TableCell className="text-right">${user.totalRevenue.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.status === 'Active' ? 'default' : 'secondary'}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggleStatus(user.id)}
                      >
                        {user.status === 'Active' ? (
                          <PauseCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <PlayCircle className="h-4 w-4 mr-2" />
                        )}
                        {user.status === 'Active' ? 'Disable' : 'Enable'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}