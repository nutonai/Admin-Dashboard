import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Common interfaces
export interface ChatbotClient {
  id: string;
  client_id: string;
  domains: string[];
  created_at: string;
  namespace: string;
  calendly_link: string;
  user_id: string;
}

export interface UserWithStats {
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

export interface ChatbotUsage {
  id: string;
  client_id: string;
  domain: string;
  session_count: number;
  last_active: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  subscription_id: string;
  stripe_invoice_id: string;
  amount: number;
  status: string;
  payment_date: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  plan_id: string;
  name: string;
  monthly_price: number;
  yearly_price: number;
  message_limit: number;
  document_limit: number;
  features: any;
  lead_scoring_tier: string;
  report_frequency: string;
  support_tier: string;
}

export interface ChatSession {
  id: string;
  chatbot_id: string;
  context: any;
  started_at: string;
  created_at: string;
  session_id: string;
  namespace: string;
}

export interface Message {
  id: string;
  session_id: string;
  content: string;
  is_bot: boolean;
  sent_at: string;
  topic: string;
  event: string;
}

export interface Lead {
  id: string;
  session_id: string;
  name: string;
  email: string;
  phone: string;
  lead_score: number;
  created_at: string;
}

// Merged data interfaces
export interface ClientWithStats {
  client: ChatbotClient;
  usage: ChatbotUsage[];
  totalSessions: number;
  payments: PaymentHistory[];
  totalRevenue: number;
  sessions: ChatSession[];
  messageCount: number;
  leads: number;
  leadScore: number;
}

// Data fetching functions
export async function fetchChatbotClients() {
  const { data, error } = await supabase
    .from("chatbot_clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }

  return data || [];
}

export async function fetchChatbotUsage() {
  const { data, error } = await supabase
    .from("chatbot_usage")
    .select("*")
    .order("last_active", { ascending: false });

  if (error) {
    console.error("Error fetching usage:", error);
    return [];
  }

  return data || [];
}

export async function fetchPaymentHistory() {
  const { data, error } = await supabase
    .from("payment_history")
    .select("*")
    .order("payment_date", { ascending: false });

  if (error) {
    console.error("Error fetching payments:", error);
    return [];
  }

  return data || [];
}

export async function fetchSubscriptionPlans() {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("monthly_price", { ascending: true });

  if (error) {
    console.error("Error fetching plans:", error);
    return [];
  }

  return data || [];
}

export async function fetchChatSessions() {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }

  return data || [];
}

export async function fetchMessages() {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data || [];
}

export async function fetchLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
    return [];
  }

  return data || [];
}

export async function fetchContactForms() {
  const { data, error } = await supabase
    .from("contact_form")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contact forms:", error);
    return [];
  }

  return data || [];
}

// Merged data functions
export async function fetchClientStats(): Promise<ClientWithStats[]> {
  try {
    // Fetch all necessary data
    const clients = await fetchChatbotClients();
    const usageData = await fetchChatbotUsage();
    const payments = await fetchPaymentHistory();
    const sessions = await fetchChatSessions();
    const leads = await fetchLeads();
    
    // Create merged data structure
    return clients.map(client => {
      // Get client-specific data
      const clientUsage = usageData.filter(u => u.client_id === client.client_id);
      const clientPayments = payments.filter(p => p.user_id === client.user_id);
      const clientSessions = sessions.filter(s => s.chatbot_id === client.client_id);
      const clientLeads = leads.filter(l => l.user_id === client.user_id);
      
      // Calculate metrics
      const totalSessions = clientUsage.reduce((sum, u) => sum + u.session_count, 0);
      const totalRevenue = clientPayments
        .filter(p => p.status === "succeeded")
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const messageCount = clientSessions.length;
      const leadCount = clientLeads.length;
      const avgLeadScore = clientLeads.length > 0 
        ? clientLeads.reduce((sum, l) => sum + Number(l.lead_score), 0) / clientLeads.length 
        : 0;
      
      return {
        client,
        usage: clientUsage,
        totalSessions,
        payments: clientPayments,
        totalRevenue,
        sessions: clientSessions,
        messageCount,
        leads: leadCount,
        leadScore: avgLeadScore
      };
    });
  } catch (error) {
    console.error("Error fetching client stats:", error);
    return [];
  }
}

export async function fetchActiveUserStats(): Promise<UserWithStats[]> {
  try {
    // Get paying users from user_subscription table
    const { data: activeSubscriptions, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('user_id, status')
      .eq('status', 'active');

    if (subscriptionError) {
      console.error("Error fetching active subscriptions:", subscriptionError);
      throw subscriptionError;
    }

    if (!activeSubscriptions || activeSubscriptions.length === 0) {
      return [];
    }

    // Get user IDs of active subscribers
    const activeUserIds = activeSubscriptions.map(sub => sub.user_id);

    // Fetch user info
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .in('id', activeUserIds);

    if (userError) {
      console.error("Error fetching users:", userError);
      throw userError;
    }

    // Fetch sessions for these users
    const { data: sessions, error: sessionError } = await supabase
      .from('session')
      .select('*')
      .in('user_id', activeUserIds);

    if (sessionError) {
      console.error("Error fetching sessions:", sessionError);
      throw sessionError;
    }

    // Fetch leads for these users
    const { data: leads, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .in('user_id', activeUserIds);

    if (leadError) {
      console.error("Error fetching leads:", leadError);
      throw leadError;
    }

    // Fetch payment history for revenue calculation
    const { data: payments, error: paymentError } = await supabase
      .from('payment_history')
      .select('*')
      .in('user_id', activeUserIds)
      .eq('status', 'succeeded');

    if (paymentError) {
      console.error("Error fetching payment history:", paymentError);
      throw paymentError;
    }

    // First, get all session IDs from the sessions we fetched
    const sessionIds = sessions.map(session => session.id);
    
    // Only proceed with messages query if we have session IDs
    let messages = [];
    if (sessionIds.length > 0) {
      const { data: messagesData, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .in('session_id', sessionIds);

      if (messageError) {
        console.error("Error fetching messages:", messageError);
        throw messageError;
      }
      
      messages = messagesData || [];
    }

    // Compile stats for each user
    const userStats: UserWithStats[] = users.map(user => {
      // Get all sessions for this user
      const userSessions = sessions.filter(session => session.user_id === user.id);
      
      // Get all leads for this user
      const userLeads = leads.filter(lead => lead.user_id === user.id);
      
      // Get payment history for this user
      const userPayments = payments.filter(payment => payment.user_id === user.id);
      
      // Calculate total revenue
      const totalRevenue = userPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      
      // Calculate lead score (average if there are leads)
      const leadScores = userLeads.map(lead => lead.lead_score).filter(Boolean);
      const avgLeadScore = leadScores.length > 0 
        ? leadScores.reduce((sum, score) => sum + score, 0) / leadScores.length
        : 0;
      
      // Find messages associated with this user's sessions
      const sessionIdsForUser = userSessions.map(session => session.id);
      const userMessages = messages.filter(msg => sessionIdsForUser.includes(msg.session_id));
      
      // Find last active timestamp
      const lastActiveDates = userSessions
        .filter(session => session.last_active)
        .map(session => new Date(session.last_active));
      
      const lastActive = lastActiveDates.length > 0
        ? new Date(Math.max(...lastActiveDates.map(date => date.getTime())))
        : null;
      
      return {
        user: {
          id: user.id,
          email: user.email
        },
        totalSessions: userSessions.length,
        totalRevenue,
        messageCount: userMessages.length,
        leads: userLeads.length,
        leadScore: avgLeadScore,
        lastActive
      };
    });

    return userStats;
  } catch (error) {
    console.error("Error in fetchActiveUserStats:", error);
    throw error;
  }
}