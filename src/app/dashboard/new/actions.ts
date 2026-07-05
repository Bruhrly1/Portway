"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createProject(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
