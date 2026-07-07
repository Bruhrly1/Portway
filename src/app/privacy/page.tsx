import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Back
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Last updated 2026-07-06. This is a starting point describing what Portway actually
          does today, not a substitute for legal advice.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-700">
          <section>
            <h2 className="text-base font-semibold text-zinc-900">What we collect</h2>
            <p className="mt-2">
              When you sign up, we collect your email and password (handled by Supabase Auth).
              When you use Portway, we store the data you enter: your business name, accent
              color, logo image, and the projects you create — including the client name, client
              email, and any files you or your clients upload.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">Who we share it with</h2>
            <p className="mt-2">
              We don&apos;t sell your data or your clients&apos; data to anyone. We use a small
              number of service providers to run Portway:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Supabase — database, authentication, and file storage.</li>
              <li>Stripe — payment processing for the Pro plan subscription. Portway never sees or stores your card details.</li>
              <li>Resend — sending transactional emails (e.g. review reminders).</li>
              <li>Vercel — hosting the application.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">Client portal links</h2>
            <p className="mt-2">
              Clients access their project through a private link you generate — they don&apos;t
              create an account. Anyone with that link can view the associated project, so treat
              it like a password and only share it with your intended client.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">Data deletion</h2>
            <p className="mt-2">
              Portway does not yet have a self-serve account deletion feature. To request
              deletion of your account or data, email us at{" "}
              <a href="mailto:kaleopkailiuli@gmail.com" className="underline">
                kaleopkailiuli@gmail.com
              </a>{" "}
              and we&apos;ll process it manually.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">Changes</h2>
            <p className="mt-2">
              If this policy changes in a way that materially affects how your data is handled,
              we&apos;ll update this page and note the new date above.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">Contact</h2>
            <p className="mt-2">
              Questions about this policy? Email{" "}
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
