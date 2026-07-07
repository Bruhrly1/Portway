import Link from "next/link";
import { startCheckout } from "./actions";

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900">Upgrade to Pro</h1>
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900">
            Back
          </Link>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-600">
            The Free plan includes 1 active project. Upgrade to Pro for unlimited active
            projects.
          </p>
          <p className="mt-4 text-2xl font-semibold text-zinc-900">
            $9<span className="text-sm font-normal text-zinc-500">/month</span>
          </p>
          <form action={startCheckout} className="mt-6">
            <button
              type="submit"
              className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
