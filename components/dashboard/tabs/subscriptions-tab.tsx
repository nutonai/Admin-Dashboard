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
  phone: string;
  website: string;
  dateSignedUp: string;
  planType: string;
  messagesCount: number;
  leadsCount: number;
  avgLeadScore: number;
  status: 'Active' | 'Disabled';
}

export function SubscriptionsTab() {
  const [userData, setUserData] = useState<DashboardUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [planNameMap, setPlanNameMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        console.log("Fetching subscription data from Supabase...");

        // 1. Fetch data from the users table - this has name, email, phone, and created_at
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, phone, created_at');

        if (usersError) {
          console.error("Users data error:", usersError);
          throw usersError;
        }
        
        console.log(`Users data: ${usersData?.length || 0} records found`);
        
        if (!usersData || usersData.length === 0) {
          console.log("No users found - adding sample test data");
          
          // Add sample test data for UI testing if no real data exists
          const testData: DashboardUserData[] = [
            {
              id: "test-1",
              name: "John Smith",
              email: "john@example.com",
              phone: "555-123-4567",
              website: "example.com",
              dateSignedUp: new Date().toISOString(),
              planType: "Pro Plan",
              messagesCount: 243,
              leadsCount: 18,
              avgLeadScore: 72,
              status: 'Active',
            },
            {
              id: "test-2",
              name: "Jane Doe",
              email: "jane@acmecorp.com",
              phone: "555-987-6543",
              website: "acmecorp.com",
              dateSignedUp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              planType: "Basic Plan",
              messagesCount: 119,
              leadsCount: 7,
              avgLeadScore: 65,
              status: 'Disabled',
            }
          ];
          
          setUserData(testData);
          return;
        }

        // Extract user IDs for subsequent queries
        const userIds = usersData.map(user => user.id);
        console.log(`Found ${userIds.length} users`);

        // 2. Fetch crawl_records data for website URLs
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
        
        console.log(`Website URLs found for ${websiteMap.size} users`);

        // 3. Fetch subscription plans data
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('id, name');

        if (planError) {
          console.error("Plan data error:", planError);
          throw planError;
        }
        
        console.log(`Plan data: ${planData?.length || 0} records found`);

        // Create a map to store plan information
        const plansMap = new Map<string, string>();
        
        if (planData && planData.length > 0) {
          planData.forEach(plan => {
            plansMap.set(plan.id, plan.name);
          });
        }
        
        console.log(`Plan types mapped: ${plansMap.size} plans found`);
        setPlanNameMap(plansMap);

        // 4. Fetch session data to link messages to users
        const { data: sessionData, error: sessionError } = await supabase
          .from('session')
          .select('id, user_id');

        if (sessionError) {
          console.error("Session data error:", sessionError);
          throw sessionError;
        }
        
        console.log(`Session data: ${sessionData?.length || 0} records found`);

        // Create a map of session IDs to user IDs
        const sessionToUserMap = new Map<string, string>();
        if (sessionData && sessionData.length > 0) {
          sessionData.forEach(session => {
            sessionToUserMap.set(session.id, session.user_id);
          });
        }

        // 5. Fetch and count messages per user
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
            const userId = sessionToUserMap.get(msg.session_id);
            if (userId) {
              messageCountMap.set(userId, (messageCountMap.get(userId) || 0) + 1);
            }
          });
        }
        
        console.log(`Message counts calculated for ${messageCountMap.size} users`);

        // 6. Fetch leads data and calculate lead counts and scores
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
        
        console.log(`Lead counts calculated for ${leadCountMap.size} users`);

        // Calculate average lead scores
        const avgLeadScoreMap = new Map<string, number>();
        userLeadsMap.forEach((scores, userId) => {
          if (scores.length > 0) {
            const sum = scores.reduce((a, b) => a + b, 0);
            avgLeadScoreMap.set(userId, Math.round(sum / scores.length));
          }
        });
        
        console.log(`Average lead scores calculated for ${avgLeadScoreMap.size} users`);

        // 7. Fetch lead confirmations for status
        const { data: confirmationData, error: confirmationError } = await supabase
          .from('lead_confirmations')
          .select('session_id, confirmed')
          .eq('confirmed', true);

        if (confirmationError) {
          console.error("Lead confirmation error:", confirmationError);
          throw confirmationError;
        }
        
        console.log(`Lead confirmation data: ${confirmationData?.length || 0} records found`);

        // Map confirmed sessions to users
        const confirmedUserIds = new Set<string>();
        if (confirmationData && confirmationData.length > 0) {
          confirmationData.forEach(confirmation => {
            const userId = sessionToUserMap.get(confirmation.session_id);
            if (userId) {
              confirmedUserIds.add(userId);
            }
          });
        }
        
        console.log(`Confirmed users: ${confirmedUserIds.size}`);

        // 8. Combine all data into the final dashboard format
        const combinedData: DashboardUserData[] = usersData.map(user => {
          return {
            id: user.id,
            name: user.name || `User ${user.id.substring(0, 8)}`,
            email: user.email || `user-${user.id.substring(0, 5)}@example.com`,
            phone: user.phone || "",
            website: websiteMap.get(user.id) || "",
            dateSignedUp: user.created_at || "",
            planType: "Free", // Default value, will be updated if subscription data exists
            messagesCount: messageCountMap.get(user.id) || 0,
            leadsCount: leadCountMap.get(user.id) || 0,
            avgLeadScore: avgLeadScoreMap.get(user.id) || 0,
            status: confirmedUserIds.has(user.id) ? 'Active' : 'Disabled',
          };
        });
        
        console.log(`Final dashboard data compiled for ${combinedData.length} users`);

        setUserData(combinedData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        
        // Add test users in case of errors
        const testData: DashboardUserData[] = [
          {
            id: "error-test-1",
            name: "Debug User 1",
            email: "debug1@example.com",
            phone: "555-DEBUG-1",
            website: "debug1.example.com",
            dateSignedUp: new Date().toISOString(),
            planType: "Error Fallback Basic",
            messagesCount: 35,
            leadsCount: 4,
            avgLeadScore: 60,
            status: 'Active',
          },
          {
            id: "error-test-2",
            name: "Debug User 2",
            email: "debug2@example.com",
            phone: "555-DEBUG-2",
            website: "debug2.example.com",
            dateSignedUp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            planType: "Error Fallback Pro",
            messagesCount: 128,
            leadsCount: 11,
            avgLeadScore: 72,
            status: 'Disabled',
          }
        ];
        
        console.log("Setting fallback debug data due to error");
        setUserData(testData);
        
        toast({
          title: "Error",
          description: "Failed to fetch subscription data. Using test data for debugging.",
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

  const handleToggleStatus = async (userId: string) => {
    try {
      // Get current status
      const currentUser = userData.find(user => user.id === userId);
      if (!currentUser) return;
      
      const newStatus = currentUser.status === 'Active' ? 'Disabled' : 'Active';
      
      // Find a session for this user to create a lead confirmation
      const { data: sessionData } = await supabase
        .from('session')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      
      if (!sessionData || sessionData.length === 0) {
        throw new Error("No session found for this user");
      }
      
      // Update lead_confirmations status
      const { error } = await supabase
        .from('lead_confirmations')
        .upsert([
          {
            session_id: sessionData[0].id,
            potential_name: currentUser.name,
            confirmed: newStatus === 'Active'
          }
        ]);
      
      if (error) throw error;
      
      // Update local state
      setUserData(userData.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus } 
          : user
      ));

      toast({
        title: "Status Changed",
        description: `User status has been ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading subscription data...</div>;
  }

  return (
    <div className="space-y-6">
      {userData.length === 0 ? (
        <div className="py-8 text-center">
          <h3 className="text-lg font-medium mb-2">No subscription data found</h3>
          <p className="text-muted-foreground">No users have been found in the database.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">User Dashboard</h3>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Date Signed Up</TableHead>
                  <TableHead>Plan Type</TableHead>
                  <TableHead className="text-center">Messages</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="text-center">Avg. Lead Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userData.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.website}</TableCell>
                    <TableCell>
                      {user.dateSignedUp ? format(new Date(user.dateSignedUp), "yyyy-MM-dd") : ""}
                    </TableCell>
                    <TableCell>{user.planType}</TableCell>
                    <TableCell className="text-center">{user.messagesCount}</TableCell>
                    <TableCell className="text-center">{user.leadsCount}</TableCell>
                    <TableCell className="text-center">{user.avgLeadScore}</TableCell>
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