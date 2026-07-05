import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateBranding, uploadLogo } from "./actions";
import { openBillingPortal } from "../upgrade/actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: freelancer } = await supabase
    .from("freelancers")
    .select("business_name, accent_color, logo_url, subscription_status")
    .eq("id", user!.id)
    .single();

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900">Branding</h1>
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900">
            Back to dashboard
          </Link>
        </div>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-700">Business name & accent color</h2>
          <form action={updateBranding} className="mt-4 flex flex-col gap-4">
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-zinc-700">
                Business name
              </label>
              <input
                id="business_name"
                name="business_name"
                type="text"
                defaultValue={freelancer?.business_name ?? ""}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="accent_color" className="block text-sm font-medium text-zinc-700">
                Accent color
              </label>
              <input
                id="accent_color"
                name="accent_color"
                type="color"
                defaultValue={freelancer?.accent_color ?? "#18181b"}
                className="mt-1 h-10 w-16 rounded-md border border-zinc-300"
              />
            </div>
            <button
              type="submit"
              className="w-fit rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Save
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-700">Logo</h2>
          {freelancer?.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={freelancer.logo_url}
              alt="Current logo"
              className="mt-3 h-16 w-16 rounded-md border border-zinc-200 object-contain"
            />
          )}
          <form action={uploadLogo} className="mt-4 flex items-center gap-3">
            <input type="file" name="logo" accept="image/*" required className="text-sm" />
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Upload
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-700">Plan</h2>
          <p className="mt-2 text-sm text-zinc-600">
            {freelancer?.subscription_status === "active" ? "Pro" : "Free (1 active project)"}
          </p>
          {freelancer?.subscription_status === "active" ? (
            <form action={openBillingPortal} className="mt-4">
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Manage billing
              </button>
            </form>
          ) : (
            <Link
              href="/dashboard/upgrade"
              className="mt-4 inline-block rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
