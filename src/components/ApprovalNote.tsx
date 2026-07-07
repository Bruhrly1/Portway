import { formatTimestamp } from "@/lib/format";

export function ApprovalNote({
  approvedByName,
  approvedAt,
}: {
  approvedByName: string | null;
  approvedAt: string | null;
}) {
  if (!approvedByName || !approvedAt) return null;

  return (
    <p className="mt-3 text-sm text-zinc-500">
      ✓ Approved by <span className="font-medium text-zinc-700">{approvedByName}</span> on{" "}
      {formatTimestamp(approvedAt)}
    </p>
  );
}
