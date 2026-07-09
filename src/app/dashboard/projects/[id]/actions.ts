"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getAuthenticatedUser } from "@/lib/auth";
import { STAGES } from "@/lib/stages";
import { logActivity } from "@/lib/activity";

const TOKEN_TTL_DAYS = 365;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

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

export async function updateStage(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const stage = formData.get("stage") as string;

  if (!STAGES.includes(stage)) {
    throw new Error("Invalid stage");
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("projects")
    .select("stage")
    .eq("id", projectId)
    .single();

  // Resubmitting the same stage (e.g. a stray double-click) isn't a real
  // transition - leave stage_updated_at and the approval trail untouched.
  if (current?.stage === stage) {
    redirect(`/dashboard/projects/${projectId}`);
  }

  const { error } = await supabase
    .from("projects")
    .update({
      stage,
      stage_updated_at: new Date().toISOString(),
      last_reminder_sent_at: null,
      // A real stage change means whatever approval happened previously no
      // longer reflects the project's current state.
      approved_by_name: null,
      approved_at: null,
    })
    .eq("id", projectId);

  if (error) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  await logActivity(projectId, "stage_changed", "freelancer", { stage });

  redirect(`/dashboard/projects/${projectId}`);
}

export async function updateProjectDetails(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const projectName = (formData.get("project_name") as string)?.trim();
  const clientName = (formData.get("client_name") as string)?.trim();
  const clientEmail = (formData.get("client_email") as string)?.trim();

  await assertOwnsProject(projectId);

  if (!projectName || !clientName || !clientEmail) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent("All fields are required")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ project_name: projectName, client_name: clientName, client_email: clientEmail })
    .eq("id", projectId);

  if (error) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  await logActivity(projectId, "details_updated", "freelancer");

  redirect(`/dashboard/projects/${projectId}`);
}

export async function updateNotes(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const notes = formData.get("notes") as string;

  await assertOwnsProject(projectId);

  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ notes }).eq("id", projectId);

  if (error) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/dashboard/projects/${projectId}`);
}

export async function createFileRequest(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const label = (formData.get("label") as string)?.trim();

  await assertOwnsProject(projectId);

  if (!label) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent("Enter a name for the file request")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("file_requests").insert({ project_id: projectId, label });

  if (error) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  await logActivity(projectId, "file_request_created", "freelancer", { label });

  redirect(`/dashboard/projects/${projectId}`);
}

export async function deleteFileRequest(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const requestId = formData.get("request_id") as string;

  await assertOwnsProject(projectId);

  const supabase = await createClient();
  const { data: deleted, error } = await supabase
    .from("file_requests")
    .delete()
    .eq("id", requestId)
    .eq("project_id", projectId)
    .select("label")
    .single();

  if (error) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  await logActivity(projectId, "file_request_removed", "freelancer", { label: deleted.label });

  redirect(`/dashboard/projects/${projectId}`);
}

export async function saveAsTemplate(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const name = (formData.get("template_name") as string)?.trim();

  await assertOwnsProject(projectId);

  if (!name) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent("Enter a name for the template")}`);
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("file_requests")
    .select("label")
    .eq("project_id", projectId);

  const labels = (requests ?? []).map((r) => r.label);

  if (labels.length === 0) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent("Add at least one file request before saving a template")}`);
  }

  const { error } = await supabase.from("project_templates").insert({
    freelancer_id: user.id,
    name,
    file_request_labels: labels,
  });

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

  if (file.size > MAX_FILE_BYTES) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent("File is too large (20MB max)")}`);
  }

  const service = createServiceClient();
  const path = `${projectId}/${randomBytes(16).toString("hex")}`;

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

  await logActivity(projectId, "file_uploaded", "freelancer", { filename: file.name });

  redirect(`/dashboard/projects/${projectId}`);
}

export async function deleteFile(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const fileId = formData.get("file_id") as string;

  await assertOwnsProject(projectId);

  const service = createServiceClient();

  const { data: file } = await service
    .from("project_files")
    .select("file_path, filename, file_request_id")
    .eq("id", fileId)
    .eq("project_id", projectId)
    .single();

  if (!file) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent("File not found")}`);
  }

  await service.storage.from("project-files").remove([file.file_path]);

  const { error } = await service.from("project_files").delete().eq("id", fileId);

  if (error) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  if (file.file_request_id) {
    await service.from("file_requests").update({ status: "pending" }).eq("id", file.file_request_id);
  }

  await logActivity(projectId, "file_removed", "freelancer", { filename: file.filename });

  redirect(`/dashboard/projects/${projectId}`);
}

export async function deleteProject(formData: FormData) {
  const projectId = formData.get("project_id") as string;

  await assertOwnsProject(projectId);

  const service = createServiceClient();

  const { data: files } = await service
    .from("project_files")
    .select("file_path")
    .eq("project_id", projectId);

  if (files && files.length > 0) {
    await service.storage.from("project-files").remove(files.map((f) => f.file_path));
  }

  // file_requests and activity_log rows cascade-delete automatically via
  // their FK to projects(id); project_files and client_access_tokens are
  // cleaned up explicitly here since their cascade behavior isn't relied on.
  const { error: filesDeleteError } = await service
    .from("project_files")
    .delete()
    .eq("project_id", projectId);

  if (filesDeleteError) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(filesDeleteError.message)}`);
  }

  const { error: tokensDeleteError } = await service
    .from("client_access_tokens")
    .delete()
    .eq("project_id", projectId);

  if (tokensDeleteError) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(tokensDeleteError.message)}`);
  }

  const { error } = await service.from("projects").delete().eq("id", projectId);

  if (error) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}
