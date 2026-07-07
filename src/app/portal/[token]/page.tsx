import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getReadableTextColor } from "@/lib/color";
import { formatFileSize, formatTimestamp, isImageFilename } from "@/lib/format";
import { STAGES } from "@/lib/stages";
import { deleteClientFile, respondToReview, uploadClientFile } from "./actions";

const STAGE_DESCRIPTIONS: Record<string, string> = {
  Kickoff: "We're getting your project set up and will begin work shortly.",
  "In Progress": "Work is actively underway on your project.",
  Review: "Ready for your review — approve it or request changes below.",
  Revisions: "We're making the changes you requested.",
  Complete: "This project is complete. Thanks for working with us!",
};

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
  const accentText = getReadableTextColor(accent);
  const accentButtonStyle = {
    backgroundColor: accent,
    color: accentText,
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
  };
  const currentStageIndex = STAGES.indexOf(project.stage);

  const service = createServiceClient();
  const [{ data: files }, { data: projectRow }, { data: storageObjects }] = await Promise.all([
    service
      .from("project_files")
      .select("id, filename, uploaded_by, file_path, created_at")
      .eq("project_id", project.project_id)
      .order("created_at", { ascending: false }),
    service.from("projects").select("freelancers(email)").eq("id", project.project_id).single(),
    service.storage.from("project-files").list(project.project_id, { limit: 1000 }),
  ]);

  const freelancersData = projectRow?.freelancers as { email: string } | { email: string }[] | null | undefined;
  const freelancerEmail = (Array.isArray(freelancersData) ? freelancersData[0] : freelancersData)?.email ?? null;

  const sizeByObjectName = new Map(
    (storageObjects ?? []).map((obj) => [obj.name, obj.metadata?.size ?? null]),
  );

  const { data: signedUrls } = files && files.length > 0
    ? await service.storage
        .from("project-files")
        .createSignedUrls(files.map((f) => f.file_path), 3600)
    : { data: [] };
  const signedUrlByPath = new Map((signedUrls ?? []).map((s) => [s.path, s.signedUrl]));

  const filesWithUrls = (files ?? []).map((file) => {
    const objectName = file.file_path.split("/").pop() ?? "";
    return {
      ...file,
      signedUrl: signedUrlByPath.get(file.file_path) ?? null,
      size: sizeByObjectName.get(objectName) ?? null,
    };
  });

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
        {freelancerEmail && (
          <p className="mt-1 text-sm text-zinc-500">
            Questions?{" "}
            <a href={`mailto:${freelancerEmail}`} className="underline hover:no-underline">
              Contact {project.business_name ?? "your freelancer"}
            </a>
          </p>
        )}

        {queryError && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{queryError}</p>
        )}

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-700">Project status</h2>
          <ol className="mt-4 flex flex-wrap gap-2">
            {STAGES.map((stage, i) => {
              const isCompleted = i < currentStageIndex;
              const isCurrent = i === currentStageIndex;

              if (isCompleted) {
                return (
                  <li key={stage} className="rounded-full px-3 py-1 text-xs font-medium" style={accentButtonStyle}>
                    ✓ {stage}
                  </li>
                );
              }

              if (isCurrent) {
                return (
                  <li
                    key={stage}
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold"
                    style={{
                      color: accent,
                      boxShadow: `inset 0 0 0 2px ${accent}`,
                    }}
                  >
                    {stage} (current)
                  </li>
                );
              }

              return (
                <li
                  key={stage}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500"
                >
                  {stage}
                </li>
              );
            })}
          </ol>

          {STAGE_DESCRIPTIONS[project.stage] && (
            <p className="mt-3 text-sm text-zinc-600">{STAGE_DESCRIPTIONS[project.stage]}</p>
          )}

          {project.stage === "Review" && (
            <div className="mt-5 flex gap-3 border-t border-zinc-100 pt-5">
              <form action={respondToReview}>
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="decision" value="approve" />
                <button
                  type="submit"
                  className="rounded-md px-3 py-2 text-sm font-medium hover:opacity-90"
                  style={accentButtonStyle}
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
                <li key={file.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    {file.signedUrl && isImageFilename(file.filename) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={file.signedUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-md border border-zinc-200 object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      {file.signedUrl ? (
                        <a
                          href={file.signedUrl}
                          className="block truncate text-zinc-900 underline hover:no-underline"
                        >
                          {file.filename}
                        </a>
                      ) : (
                        <span className="block truncate">{file.filename}</span>
                      )}
                      <p className="text-xs text-zinc-400">
                        {formatTimestamp(file.created_at)}
                        {file.size !== null && ` · ${formatFileSize(file.size)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-zinc-400">
                      {file.uploaded_by === "client" ? "you" : "from freelancer"}
                    </span>
                    {file.uploaded_by === "client" && (
                      <form action={deleteClientFile}>
                        <input type="hidden" name="token" value={token} />
                        <input type="hidden" name="file_id" value={file.id} />
                        <button
                          type="submit"
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </form>
                    )}
                  </div>
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
              className="text-sm text-zinc-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--file-accent)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--file-text)] file:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)] hover:file:opacity-90"
              style={
                {
                  "--file-accent": accent,
                  "--file-text": accentText,
                } as React.CSSProperties
              }
            />
            <button
              type="submit"
              className="rounded-md px-3 py-2 text-sm font-medium hover:opacity-90"
              style={accentButtonStyle}
            >
              Upload
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
