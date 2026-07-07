import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/format";
import { STAGES } from "@/lib/stages";
import { signOut } from "../login/actions";

const STAGE_STYLES: Record<string, string> = {
  Kickoff: "bg-blue-50 text-blue-700",
  "In Progress": "bg-amber-50 text-amber-700",
  Review: "bg-purple-50 text-purple-700",
  Revisions: "bg-orange-50 text-orange-700",
  Complete: "bg-green-50 text-green-700",
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "complete", label: "Complete" },
];

const SORTS = [
  { value: "activity", label: "Recent activity" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "status", label: "Status" },
];

function buildHref(filter: string, sort: string, overrides: { filter?: string; sort?: string }) {
  const params = new URLSearchParams({ filter, sort, ...overrides });
  return `/dashboard?${params.toString()}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; sort?: string }>;
}) {
  const { filter: rawFilter, sort: rawSort } = await searchParams;
  const filter = FILTERS.some((f) => f.value === rawFilter) ? rawFilter! : "all";
  const sort = SORTS.some((s) => s.value === rawSort) ? rawSort! : "activity";

  const supabase = await createClient();
  const user = await getAuthenticatedUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, client_name, client_email, stage, created_at, stage_updated_at")
    .order("created_at", { ascending: true });

  const projectIds = (projects ?? []).map((p) => p.id);
  const { data: files } =
    projectIds.length > 0
      ? await supabase
          .from("project_files")
          .select("project_id, uploaded_by, created_at")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  const lastFileByProject = new Map<string, { created_at: string; uploaded_by: string }>();
  for (const file of files ?? []) {
    if (!lastFileByProject.has(file.project_id)) {
      lastFileByProject.set(file.project_id, file);
    }
  }

  const withActivity = (projects ?? []).map((project) => {
    const lastFile = lastFileByProject.get(project.id);
    const lastFileAt = lastFile?.created_at ?? null;
    const stageUpdatedAt = project.stage_updated_at ?? project.created_at;
    const isNewerFileActivity = lastFileAt !== null && lastFileAt > stageUpdatedAt;
    const lastActivityAt = isNewerFileActivity ? lastFileAt : stageUpdatedAt;
    const isClientActivity = isNewerFileActivity && lastFile?.uploaded_by === "client";
    return { ...project, lastActivityAt, isClientActivity };
  });

  const filtered = withActivity.filter((p) => {
    if (filter === "active") return p.stage !== "Complete";
    if (filter === "complete") return p.stage === "Complete";
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "newest") return b.created_at.localeCompare(a.created_at);
    if (sort === "oldest") return a.created_at.localeCompare(b.created_at);
    if (sort === "status") return STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage);
    // "activity" (default): active projects always rank above completed ones,
    // most-recent activity first within each group.
    const aComplete = a.stage === "Complete" ? 1 : 0;
    const bComplete = b.stage === "Complete" ? 1 : 0;
    if (aComplete !== bComplete) return aComplete - bComplete;
    return b.lastActivityAt.localeCompare(a.lastActivityAt);
  });

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-500">Signed in as {user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/settings" className="text-sm text-zinc-500 hover:text-zinc-900">
              Branding
            </Link>
            <form action={signOut}>
              <button className="text-sm text-zinc-500 hover:text-zinc-900">Sign out</button>
            </form>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-700">Projects</h2>
          <Link
            href="/dashboard/new"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New project
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-md border border-zinc-200 bg-white p-1">
            {FILTERS.map((f) => (
              <Link
                key={f.value}
                href={buildHref(filter, sort, { filter: f.value })}
                className={`rounded px-2.5 py-1 text-xs font-medium ${
                  filter === f.value ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            Sort:
            <div className="flex gap-1 rounded-md border border-zinc-200 bg-white p-1">
              {SORTS.map((s) => (
                <Link
                  key={s.value}
                  href={buildHref(filter, sort, { sort: s.value })}
                  className={`rounded px-2.5 py-1 text-xs font-medium ${
                    sort === s.value ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {sorted.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            {projects && projects.length > 0
              ? "No projects match this filter."
              : "No projects yet. Create your first one."}
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
            {sorted.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{project.client_name}</p>
                    <p className="text-xs text-zinc-500">{project.client_email}</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {project.isClientActivity && (
                        <span className="mr-1 font-medium text-amber-600">Client uploaded a file ·</span>
                      )}
                      Active {formatRelativeTime(project.lastActivityAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STAGE_STYLES[project.stage] ?? "bg-zinc-100 text-zinc-700"}`}
                  >
                    {project.stage}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
