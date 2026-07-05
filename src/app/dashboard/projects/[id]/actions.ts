"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const TOKEN_TTL_DAYS = 365;

export async function generateClientLink(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const supabase = await createClient();

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("client_access_tokens").insert({
    project_id: projectId,
    token,
    expires_at: expiresAt,
  });

  if (error) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/dashboard/projects/${projectId}`);
}
