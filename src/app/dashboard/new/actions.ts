"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function createProject(formData: FormData) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const [{ data: freelancer }, { count }] = await Promise.all([
    supabase.from("freelancers").select("subscription_status").eq("id", user.id).single(),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("freelancer_id", user.id)
      .neq("stage", "Complete"),
  ]);

  if (freelancer?.subscription_status !== "active" && (count ?? 0) >= 1) {
    redirect("/dashboard/upgrade");
  }

  const projectName = formData.get("project_name") as string;
  const clientName = formData.get("client_name") as string;
  const clientEmail = formData.get("client_email") as string;
  const templateId = formData.get("template_id") as string;

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      freelancer_id: user.id,
      project_name: projectName,
      client_name: clientName,
      client_email: clientEmail,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/dashboard/new?error=${encodeURIComponent(error.message)}`);
  }

  await logActivity(project.id, "created", "freelancer");

  if (templateId) {
    const { data: template, error: templateError } = await supabase
      .from("project_templates")
      .select("file_request_labels")
      .eq("id", templateId)
      .eq("freelancer_id", user.id)
      .single();

    if (templateError || !template) {
      console.error("createProject: template lookup failed", templateError?.message ?? "not found");
    }

    const labels = template?.file_request_labels ?? [];

    if (labels.length > 0) {
      const { error: requestError } = await supabase
        .from("file_requests")
        .insert(labels.map((label: string) => ({ project_id: project.id, label })));

      if (requestError) {
        console.error("createProject: failed to copy template file requests", requestError.message);
      } else {
        for (const label of labels) {
          await logActivity(project.id, "file_request_created", "freelancer", { label });
        }
      }
    }
  }

  redirect("/dashboard");
}

export async function deleteTemplate(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const templateId = formData.get("template_id") as string;
  const supabase = await createClient();
  const { data: deleted, error } = await supabase
    .from("project_templates")
    .delete()
    .eq("id", templateId)
    .eq("freelancer_id", user.id)
    .select("id")
    .single();

  if (error || !deleted) {
    redirect(`/dashboard/new?error=${encodeURIComponent("Template not found")}`);
  }

  redirect("/dashboard/new");
}
