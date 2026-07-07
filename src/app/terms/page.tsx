import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Back
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Last updated 2026-07-06. This is a starting point describing how Portway actually
          works today, not a substitute for legal advice.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-700">
          <section>
            <h2 className="text-base font-semibold text-zinc-900">The service</h2>
            <p className="mt-2">
              Portway lets freelancers share project status, files, and approval requests with
              their clients through a private link, without requiring the client to create an
              account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">Plans and billing</h2>
            <p className="mt-2">
              The Free plan supports 1 active project. The Pro plan is $9/month for unlimited
              active projects, billed and processed through Stripe. You can cancel anytime from
              your billing settings; access continues until the end of the current billing
              period.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">Your responsibilities</h2>
            <p className="mt-2">
              You&apos;re responsible for the content you and your clients upload through your
              account, and for only sharing client portal links with the intended recipient.
              Don&apos;t use Portway to upload or distribute content you don&apos;t have the
              right to share.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">No warranty</h2>
            <p className="mt-2">
              Portway is provided &ldquo;as is,&rdquo; without uptime guarantees or warranties of
              any kind. As an early-stage product, features and pricing may change.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">Contact</h2>
            <p className="mt-2">
              Questions about these terms? Email{" "}
              <a href="mailto:kaleopkailiuli@gmail.com" className="underline">
                kaleopkailiuli@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
