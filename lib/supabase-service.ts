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