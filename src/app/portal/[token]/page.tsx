import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STAGES = ["Kickoff", "In Progress", "Review", "Revisions", "Complete"];

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("get_portal_project", { p_token: token })
    .single();

  if (error || !data) {
    notFound();
  }

  const project = data as {
    project_id: string;
    client_name: string;
    stage: string;
    business_name: string | null;
    accent_color: string | null;
  };

  const accent = project.accent_color ?? "#18181b";
  const currentStageIndex = STAGES.indexOf(project.stage);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
      <div className="mx-auto max-w-2xl p-8">
        <p className="text-sm text-zinc-500">{project.business_name ?? "Your freelancer"}</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">{project.client_name}</h1>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-700">Project status</h2>
          <ol className="mt-4 flex flex-wrap gap-2">
            {STAGES.map((stage, i) => (
              <li
                key={stage}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  i <= currentStageIndex
                    ? "text-white"
                    : "bg-zinc-100 text-zinc-500"
                }`}
                style={i <= currentStageIndex ? { backgroundColor: accent } : undefined}
              >
                {stage}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-700">Files</h2>
          <p className="mt-2 text-sm text-zinc-400">File sharing is coming soon.</p>
        </div>
      </div>
    </div>
  );
}
