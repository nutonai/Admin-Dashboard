"use client";

import { createClient } from "@supabase/supabase-js";
import { ContactFormTable } from "@/components/contact-form-table";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ContactFormData {
  id: string;
  name: string;
  email: string;
  company: string;
  phone_number: string;
  how_can_we_help: string;
  created_at: string;
  updated_at: string;
}

export function ContactSubmissionsTab() {
  const [submissions, setSubmissions] = useState<ContactFormData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const { data, error } = await supabase
          .from("contact_form")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching contact form submissions:", error);
          return;
        }

        setSubmissions(data || []);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, []);

  if (loading) {
    return <div>Loading submissions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <ContactFormTable data={submissions} />
      </div>
    </div>
  );
} 