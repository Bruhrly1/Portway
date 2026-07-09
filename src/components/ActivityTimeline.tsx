import { formatTimestamp } from "@/lib/format";
import type { ActivityActor, ActivityEventType } from "@/lib/activity";

type ActivityEvent = {
  id: string;
  event_type: ActivityEventType;
  actor: ActivityActor;
  detail: Record<string, unknown> | null;
  created_at: string;
};

function describe(event: ActivityEvent, viewerIsClient: boolean): string {
  const isViewersOwnAction = (event.actor === "client") === viewerIsClient;
  const who = isViewersOwnAction ? "You" : viewerIsClient ? "Your freelancer" : "The client";

  const detail = event.detail ?? {};

  switch (event.event_type) {
    case "created":
      return "Project created";
    case "stage_changed":
      return `${who} moved this to ${detail.stage}`;
    case "changes_requested":
      return detail.note ? `${who} requested changes: "${detail.note}"` : `${who} requested changes`;
    case "approved":
      return `Approved by ${detail.name}`;
    case "file_uploaded":
      return detail.requestLabel
        ? `${who} uploaded ${detail.filename} (fulfilling "${detail.requestLabel}")`
        : `${who} uploaded ${detail.filename}`;
    case "file_removed":
      return `${who} removed ${detail.filename}`;
    case "file_request_created":
      return `${who} requested "${detail.label}"`;
    case "file_request_removed":
      return `${who} removed the request for "${detail.label}"`;
    default:
      return event.event_type;
  }
}

export function ActivityTimeline({
  events,
  viewerIsClient,
}: {
  events: ActivityEvent[];
  viewerIsClient: boolean;
}) {
  if (events.length === 0) return null;

  return (
    <ul className="mt-3 space-y-2">
      {events.map((event) => (
        <li key={event.id} className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="break-words text-zinc-700">{describe(event, viewerIsClient)}</span>
          <span className="shrink-0 text-xs text-zinc-400">{formatTimestamp(event.created_at)}</span>
        </li>
      ))}
    </ul>
  );
}
