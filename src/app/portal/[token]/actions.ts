"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";

const MAX_FILE_BYTES = 20 * 1024 * 1024;

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

  if (file.size > MAX_FILE_BYTES) {
    redirect(`/portal/${token}?error=${encodeURIComponent("File is too large (20MB max)")}`);
  }

  const service = createServiceClient();
  const path = `${projectId}/${randomBytes(16).toString("hex")}`;

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

export async function uploadForFileRequest(formData: FormData) {
  const token = formData.get("token") as string;
  const requestId = formData.get("request_id") as string;
  const file = formData.get("file") as File;

  const projectId = await getProjectIdForToken(token);
  if (!projectId) {
    redirect(`/portal/${token}?error=${encodeURIComponent("This link is no longer valid")}`);
  }

  if (!file || file.size === 0) {
    redirect(`/portal/${token}?error=${encodeURIComponent("Choose a file first")}`);
  }

  if (file.size > MAX_FILE_BYTES) {
    redirect(`/portal/${token}?error=${encodeURIComponent("File is too large (20MB max)")}`);
  }

  const service = createServiceClient();

  const { data: request } = await service
    .from("file_requests")
    .select("id")
    .eq("id", requestId)
    .eq("project_id", projectId)
    .single();

  if (!request) {
    redirect(`/portal/${token}?error=${encodeURIComponent("File request not found")}`);
  }

  const path = `${projectId}/${randomBytes(16).toString("hex")}`;

  const { error: uploadError } = await service.storage.from("project-files").upload(path, file);

  if (uploadError) {
    redirect(`/portal/${token}?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { error: insertError } = await service.from("project_files").insert({
    project_id: projectId,
    uploaded_by: "client",
    file_path: path,
    filename: file.name,
    file_request_id: requestId,
  });

  if (insertError) {
    redirect(`/portal/${token}?error=${encodeURIComponent(insertError.message)}`);
  }

  await service.from("file_requests").update({ status: "received" }).eq("id", requestId);

  redirect(`/portal/${token}`);
}

export async function deleteClientFile(formData: FormData) {
  const token = formData.get("token") as string;
  const fileId = formData.get("file_id") as string;

  const projectId = await getProjectIdForToken(token);
  if (!projectId) {
    redirect(`/portal/${token}?error=${encodeURIComponent("This link is no longer valid")}`);
  }

  const service = createServiceClient();

  const { data: file } = await service
    .from("project_files")
    .select("file_path, uploaded_by, file_request_id")
    .eq("id", fileId)
    .eq("project_id", projectId)
    .single();

  // Clients can only remove files they uploaded themselves, never files
  // the freelancer sent them.
  if (!file || file.uploaded_by !== "client") {
    redirect(`/portal/${token}?error=${encodeURIComponent("File not found")}`);
  }

  await service.storage.from("project-files").remove([file.file_path]);

  const { error } = await service.from("project_files").delete().eq("id", fileId);

  if (error) {
    redirect(`/portal/${token}?error=${encodeURIComponent(error.message)}`);
  }

  if (file.file_request_id) {
    await service.from("file_requests").update({ status: "pending" }).eq("id", file.file_request_id);
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
