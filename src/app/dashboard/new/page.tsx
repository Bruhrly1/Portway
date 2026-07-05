import { createProject } from "./actions";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Create project
          </button>
        </form>
      </div>
    </div>
  );
}
