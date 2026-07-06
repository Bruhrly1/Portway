import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { respondToReview, uploadClientFile } from "./actions";

const STAGES = ["Kickoff", "In Progress", "Review", "Revisions", "Complete"];

export default async function ClientPortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error: queryError } = await searchParams;
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
    logo_url: string | null;
  };

  const accent = project.accent_color ?? "#18181b";
  const currentStageIndex = STAGES.indexOf(project.stage);

  const service = createServiceClient();
  const { data: files } = await service
    .from("project_files")
    .select("id, filename, uploaded_by, file_path, created_at")
    .eq("project_id", project.project_id)
    .order("created_at", { ascending: false });

  const filesWithUrls = await Promise.all(
    (files ?? []).map(async (file) => {
      const { data: signed } = await service.storage
        .from("project-files")
        .createSignedUrl(file.file_path, 3600);
      return { ...file, signedUrl: signed?.signedUrl ?? null };
    }),
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
      <div className="mx-auto max-w-2xl p-8">
        <div className="flex items-center gap-3">
          {project.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.logo_url}
              alt={project.business_name ?? "Logo"}
              className="h-10 w-10 rounded-md border border-zinc-200 object-contain"
            />
          )}
          <p className="text-sm text-zinc-500">{project.business_name ?? "Your freelancer"}</p>
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">{project.client_name}</h1>

        {queryError && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{queryError}</p>
        )}

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

          {project.stage === "Review" && (
            <div className="mt-5 flex gap-3 border-t border-zinc-100 pt-5">
              <form action={respondToReview}>
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="decision" value="approve" />
                <button
                  type="submit"
                  className="rounded-md px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                  style={{ backgroundColor: accent }}
                >
                  Approve
                </button>
              </form>
              <form action={respondToReview}>
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="decision" value="changes" />
                <button
                  type="submit"
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Request changes
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-700">Files</h2>
          {filesWithUrls.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-400">No files yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100">
              {filesWithUrls.map((file) => (
                <li key={file.id} className="flex items-center justify-between py-2 text-sm">
                  {file.signedUrl ? (
                    <a
                      href={file.signedUrl}
                      className="text-zinc-900 underline hover:no-underline"
                    >
                      {file.filename}
                    </a>
                  ) : (
                    <span>{file.filename}</span>
                  )}
                  <span className="text-xs text-zinc-400">
                    {file.uploaded_by === "client" ? "you" : "from freelancer"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <form action={uploadClientFile} className="mt-4 flex items-center gap-3">
            <input type="hidden" name="token" value={token} />
            <input
              type="file"
              name="file"
              required
              className="text-sm text-zinc-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--file-accent)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
              style={{ "--file-accent": accent } as React.CSSProperties}
            />
            <button
              type="submit"
              className="rounded-md px-3 py-2 text-sm font-medium text-white hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              Upload
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
