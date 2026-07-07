export function StatusBadge({ status }: { status: "pending" | "received" }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        status === "received" ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {status === "received" ? "Received" : "Pending"}
    </span>
  );
}
