import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createProject, deleteTemplate } from "./actions";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from("project_templates")
    .select("id, name, file_request_labels")
    .eq("freelancer_id", user!.id)
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">New project</h1>
        <p className="mt-1 text-sm text-zinc-500">Kicks off in the &quot;Kickoff&quot; stage.</p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <form action={createProject} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="project_name" className="block text-sm font-medium text-zinc-700">
              Project name
            </label>
            <input
              id="project_name"
              name="project_name"
              type="text"
              required
              placeholder="e.g. Logo Redesign"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="client_name" className="block text-sm font-medium text-zinc-700">
              Client name
            </label>
            <input
              id="client_name"
              name="client_name"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="client_email" className="block text-sm font-medium text-zinc-700">
              Client email
            </label>
            <input
              id="client_email"
              name="client_email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>
          {templates && templates.length > 0 && (
            <div>
              <label htmlFor="template_id" className="block text-sm font-medium text-zinc-700">
                Start from template (optional)
              </label>
              <select
                id="template_id"
                name="template_id"
                defaultValue=""
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="">No template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.file_request_labels.length} file request
                    {template.file_request_labels.length === 1 ? "" : "s"})
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Create project
          </button>
        </form>

        {templates && templates.length > 0 && (
          <div className="mt-6 border-t border-zinc-100 pt-4">
            <h2 className="text-xs font-medium text-zinc-500">Your templates</h2>
            <ul className="mt-2 divide-y divide-zinc-100">
              {templates.map((template) => (
                <li key={template.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-zinc-700">{template.name}</span>
                  <form action={deleteTemplate}>
                    <input type="hidden" name="template_id" value={template.id} />
                    <button type="submit" className="text-xs text-red-500 hover:text-red-700">
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
