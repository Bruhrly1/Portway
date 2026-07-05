"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const TOKEN_TTL_DAYS = 365;

async function assertOwnsProject(projectId: string) {
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .single();

  if (!project) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent("Not found or not authorized")}`);
  }
}

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

const STAGES = ["Kickoff", "In Progress", "Review", "Revisions", "Complete"];

export async function updateStage(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const stage = formData.get("stage") as string;

  if (!STAGES.includes(stage)) {
    throw new Error("Invalid stage");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ stage }).eq("id", projectId);

  if (error) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/dashboard/projects/${projectId}`);
}

export async function uploadFreelancerFile(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const file = formData.get("file") as File;

  await assertOwnsProject(projectId);

  if (!file || file.size === 0) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent("Choose a file first")}`);
  }

  const service = createServiceClient();
  const path = `${projectId}/${randomBytes(8).toString("hex")}-${file.name}`;

  const { error: uploadError } = await service.storage
    .from("project-files")
    .upload(path, file);

  if (uploadError) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { error: insertError } = await service.from("project_files").insert({
    project_id: projectId,
    uploaded_by: "freelancer",
    file_path: path,
    filename: file.name,
  });

  if (insertError) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(insertError.message)}`);
  }

  redirect(`/dashboard/projects/${projectId}`);
}
