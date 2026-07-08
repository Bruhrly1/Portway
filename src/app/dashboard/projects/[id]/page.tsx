import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { STAGES } from "@/lib/stages";
import { ApprovalNote } from "@/components/ApprovalNote";
import { StatusBadge } from "@/components/StatusBadge";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { CopyLinkButton } from "./CopyLinkButton";
import {
  createFileRequest,
  deleteFile,
  deleteFileRequest,
  generateClientLink,
  updateNotes,
  updateStage,
  uploadFreelancerFile,
} from "./actions";

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

  const [{ data: project }, { data: tokens }, { data: files }, { data: fileRequests }, { data: activity }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, client_name, client_email, stage, notes, approved_by_name, approved_at")
        .eq("id", id)
        .single(),
      supabase
        .from("client_access_tokens")
        .select("token, expires_at")
        .eq("project_id", id)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("project_files")
        .select("id, filename, uploaded_by, file_path, created_at")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("file_requests")
        .select("id, label, status")
        .eq("project_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("activity_log")
        .select("id, event_type, actor, detail, created_at")
        .eq("project_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  if (!project) {
    notFound();
  }

  const activeToken = tokens?.[0];
  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const portalUrl = activeToken ? `${protocol}://${host}/portal/${activeToken.token}` : null;

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
          <ApprovalNote approvedByName={project.approved_by_name} approvedAt={project.approved_at} />
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-700">Client portal link</h2>
          {portalUrl ? (
            <div className="mt-2 flex items-center gap-3">
              <p className="min-w-0 flex-1 break-all rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                {portalUrl}
              </p>
              <CopyLinkButton url={portalUrl} />
            </div>
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
          <h2 className="text-sm font-medium text-zinc-700">Notes</h2>
          <p className="mt-1 text-xs text-zinc-400">Private — only visible to you, never to the client.</p>
          <form action={updateNotes} className="mt-3 flex flex-col gap-3">
            <input type="hidden" name="project_id" value={project.id} />
            <textarea
              name="notes"
              rows={3}
              defaultValue={project.notes ?? ""}
              placeholder="e.g. need another day because the client changed scope"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-fit rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Save
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-700">File requests</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Ask for specific items — your client sees each one as a pending item to fulfill.
          </p>
          {fileRequests && fileRequests.length > 0 && (
            <ul className="mt-3 divide-y divide-zinc-100">
              {fileRequests.map((request) => (
                <li key={request.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{request.label}</span>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={request.status} />
                    <form action={deleteFileRequest}>
                      <input type="hidden" name="project_id" value={project.id} />
                      <input type="hidden" name="request_id" value={request.id} />
                      <button type="submit" className="text-xs text-red-500 hover:text-red-700">
                        Remove
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <form action={createFileRequest} className="mt-4 flex items-center gap-3">
            <input type="hidden" name="project_id" value={project.id} />
            <input
              type="text"
              name="label"
              required
              placeholder="e.g. Logo files"
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Add request
            </button>
          </form>
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
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400">
                      {file.uploaded_by === "client" ? "from client" : "you"}
                    </span>
                    <form action={deleteFile}>
                      <input type="hidden" name="project_id" value={project.id} />
                      <input type="hidden" name="file_id" value={file.id} />
                      <button
                        type="submit"
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <form action={uploadFreelancerFile} className="mt-4 flex items-center gap-3">
            <input type="hidden" name="project_id" value={project.id} />
            <input
              type="file"
              name="file"
              required
              className="text-sm text-zinc-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
            />
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Upload
            </button>
          </form>
        </div>

        {activity && activity.length > 0 && (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-sm font-medium text-zinc-700">Activity</h2>
            <ActivityTimeline events={activity} viewerIsClient={false} />
          </div>
        )}
      </div>
    </div>
  );
}
