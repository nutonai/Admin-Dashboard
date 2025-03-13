import { createClient } from "@supabase/supabase-js";
import { ContactFormTable } from "@/components/contact-form-table";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 0;

async function getContactFormSubmissions() {
  const { data, error } = await supabase
    .from("contact_form")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contact form submissions:", error);
    return [];
  }

  return data;
}

export default async function ContactSubmissionsPage() {
  const submissions = await getContactFormSubmissions();

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contact Form Submissions</h1>
      </div>
      <ContactFormTable data={submissions} />
    </div>
  );
} 