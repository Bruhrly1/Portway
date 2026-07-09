import { createServiceClient } from "@/lib/supabase/service";

export type ActivityEventType =
  | "created"
  | "stage_changed"
  | "changes_requested"
  | "approved"
  | "file_uploaded"
  | "file_removed"
  | "file_request_created"
  | "file_request_removed"
  | "details_updated";

export type ActivityActor = "freelancer" | "client";

// Best-effort logging: a failure here must never take down the primary
// action (upload, approval, stage change) it's decorating.
export async function logActivity(
  projectId: string,
  eventType: ActivityEventType,
  actor: ActivityActor,
  detail?: Record<string, unknown>,
) {
  try {
    const service = createServiceClient();
    const { error } = await service.from("activity_log").insert({
      project_id: projectId,
      event_type: eventType,
      actor,
      detail: detail ?? null,
    });
    if (error) {
      console.error("logActivity insert failed:", error.message);
    }
  } catch (err) {
    console.error("logActivity threw:", err);
  }
}
