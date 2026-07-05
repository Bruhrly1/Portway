import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateClientLink, updateStage, uploadFreelancerFile } from "./actions";

const STAGES = ["Kickoff", "In Progress", "Review", "Revisions", "Complete"];

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, client_name, client_email, stage")
    .eq("id", id)
    .single();

  if (!project) {
    notFound();
  }

  const { data: tokens } = await supabase
    .from("client_access_tokens")
    .select("token, expires_at")
    .eq("project_id", id)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  const activeToken = tokens?.[0];
  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const portalUrl = activeToken ? `${protocol}://${host}/portal/${activeToken.token}` : null;

  const { data: files } = await supabase
    .from("project_files")
    .select("id, filename, uploaded_by, file_path, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const service = createServiceClient();
  const filesWithUrls = await Promise.all(
    (files ?? []).map(async (file) => {
      const { data: signed } = await service.storage
        .from("project-files")
        .createSignedUrl(file.file_path, 3600);
      return { ...file, signedUrl: signed?.signedUrl ?? null };
    }),
  );

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-xl font-semibold text-zinc-900">{project.client_name}</h1>
        <p className="mt-1 text-sm text-zinc-500">{project.client_email}</p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-700">Stage</h2>
          <form action={updateStage} className="mt-3 flex items-center gap-3">
            <input type="hidden" name="project_id" value={project.id} />
            <select
              name="stage"
              defaultValue={project.stage}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Update
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-700">Client portal link</h2>
          {portalUrl ? (
            <p className="mt-2 break-all rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
              {portalUrl}
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-zinc-500">
                No link yet. Generate one to share with your client — no account needed on
                their end.
              </p>
              <form action={generateClientLink} className="mt-4">
                <input type="hidden" name="project_id" value={project.id} />
                <button
                  type="submit"
                  className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Generate client link
                </button>
              </form>
            </>
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
                    {file.uploaded_by === "client" ? "from client" : "you"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <form action={uploadFreelancerFile} className="mt-4 flex items-center gap-3">
            <input type="hidden" name="project_id" value={project.id} />
            <input type="file" name="file" required className="text-sm" />
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Upload
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
