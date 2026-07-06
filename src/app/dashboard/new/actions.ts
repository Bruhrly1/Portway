"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function createProject(formData: FormData) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const [{ data: freelancer }, { count }] = await Promise.all([
    supabase.from("freelancers").select("subscription_status").eq("id", user.id).single(),
    supabase.from("projects").select("id", { count: "exact", head: true }).neq("stage", "Complete"),
  ]);

  if (freelancer?.subscription_status !== "active" && (count ?? 0) >= 1) {
    redirect("/dashboard/upgrade");
  }

  const clientName = formData.get("client_name") as string;
  const clientEmail = formData.get("client_email") as string;

  const { error } = await supabase.from("projects").insert({
    freelancer_id: user.id,
    client_name: clientName,
    client_email: clientEmail,
  });

  if (error) {
    redirect(`/dashboard/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}
