"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";

async function getProjectIdForToken(token: string) {
  const service = createServiceClient();
  const { data } = await service
    .from("client_access_tokens")
    .select("project_id, expires_at")
    .eq("token", token)
    .single();

  if (!data || new Date(data.expires_at) <= new Date()) {
    return null;
  }

  return data.project_id as string;
}

export async function uploadClientFile(formData: FormData) {
  const token = formData.get("token") as string;
  const file = formData.get("file") as File;

  const projectId = await getProjectIdForToken(token);
  if (!projectId) {
    redirect(`/portal/${token}?error=${encodeURIComponent("This link is no longer valid")}`);
  }

  if (!file || file.size === 0) {
    redirect(`/portal/${token}?error=${encodeURIComponent("Choose a file first")}`);
  }

  const service = createServiceClient();
  const path = `${projectId}/${randomBytes(8).toString("hex")}-${file.name}`;

  const { error: uploadError } = await service.storage.from("project-files").upload(path, file);

  if (uploadError) {
    redirect(`/portal/${token}?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { error: insertError } = await service.from("project_files").insert({
    project_id: projectId,
    uploaded_by: "client",
    file_path: path,
    filename: file.name,
  });

  if (insertError) {
    redirect(`/portal/${token}?error=${encodeURIComponent(insertError.message)}`);
  }

  redirect(`/portal/${token}`);
}

export async function respondToReview(formData: FormData) {
  const token = formData.get("token") as string;
  const decision = formData.get("decision") as string;

  const projectId = await getProjectIdForToken(token);
  if (!projectId) {
    redirect(`/portal/${token}?error=${encodeURIComponent("This link is no longer valid")}`);
  }

  const service = createServiceClient();
  const { data: project } = await service
    .from("projects")
    .select("stage")
    .eq("id", projectId)
    .single();

  if (project?.stage !== "Review") {
    redirect(`/portal/${token}?error=${encodeURIComponent("This project isn't awaiting review")}`);
  }

  const nextStage = decision === "approve" ? "Complete" : "Revisions";

  const { error } = await service
    .from("projects")
    .update({
      stage: nextStage,
      stage_updated_at: new Date().toISOString(),
      last_reminder_sent_at: null,
    })
    .eq("id", projectId);

  if (error) {
    redirect(`/portal/${token}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/portal/${token}`);
}
