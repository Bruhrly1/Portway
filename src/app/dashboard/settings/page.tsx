import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { updateBranding, uploadLogo } from "./actions";
import { openBillingPortal } from "../upgrade/actions";
import { BrandingPreview } from "./BrandingPreview";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const user = await getAuthenticatedUser();

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
            <BrandingPreview
              initialBusinessName={freelancer?.business_name ?? ""}
              initialAccentColor={freelancer?.accent_color ?? "#18181b"}
              logoUrl={freelancer?.logo_url ?? null}
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
          <h2 className="text-sm font-medium text-zinc-700">Logo</h2>
          {freelancer?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={freelancer.logo_url}
              alt="Current logo"
              className="mt-3 h-16 w-16 rounded-md border border-zinc-200 object-contain"
            />
          ) : (
            <div className="mt-3 flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-zinc-300 text-zinc-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
          <form action={uploadLogo} className="mt-4 flex items-center gap-3">
            <input
              type="file"
              name="logo"
              accept="image/*"
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
          <p className="mt-2 text-xs text-zinc-400">Max file size: 5MB</p>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-700">Plan</h2>
          <p className="mt-2 text-sm text-zinc-600">
            {freelancer?.subscription_status === "active"
              ? "Pro — unlimited projects ($9/month)"
              : "Free — 1 active project"}
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
