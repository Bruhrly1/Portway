import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";

const STAGE_STYLES: Record<string, string> = {
  Kickoff: "bg-blue-50 text-blue-700",
  "In Progress": "bg-amber-50 text-amber-700",
  Review: "bg-purple-50 text-purple-700",
  Revisions: "bg-orange-50 text-orange-700",
  Complete: "bg-green-50 text-green-700",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, client_name, client_email, stage, created_at")
    .order("created_at", { ascending: true });

  const active = (projects ?? []).filter((p) => p.stage !== "Complete");
  const complete = (projects ?? []).filter((p) => p.stage === "Complete");
  const sorted = [...active, ...complete];

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-500">Signed in as {user?.email}</p>
          </div>
          <form action={signOut}>
            <button className="text-sm text-zinc-500 hover:text-zinc-900">Sign out</button>
          </form>
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

        {sorted.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">No projects yet. Create your first one.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
            {sorted.map((project) => (
              <li key={project.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{project.client_name}</p>
                  <p className="text-xs text-zinc-500">{project.client_email}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STAGE_STYLES[project.stage] ?? "bg-zinc-100 text-zinc-700"}`}
                >
                  {project.stage}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
