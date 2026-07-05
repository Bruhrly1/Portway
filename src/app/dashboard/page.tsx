import { createClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
          <form action={signOut}>
            <button className="text-sm text-zinc-500 hover:text-zinc-900">Sign out</button>
          </form>
        </div>
        <p className="mt-2 text-sm text-zinc-600">Signed in as {user?.email}</p>
        <p className="mt-8 text-sm text-zinc-400">Projects will show up here.</p>
      </div>
    </div>
  );
}
