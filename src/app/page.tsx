import Link from "next/link";

const FEATURES = [
  {
    title: "One branded link per client",
    description:
      "No client logins, no passwords. Send a single link and your client sees project status, files, and what's needed from them.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 10.5 21 3m0 0h-5.25M21 3v5.25M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"
      />
    ),
  },
  {
    title: "Stop chasing approvals",
    description:
      "Clients approve work or request changes right from the portal — no more \"did you see my email?\" follow-ups.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />,
  },
  {
    title: "Files, both directions",
    description:
      "Upload and receive files in one place instead of scattered across email threads and chat apps.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    ),
  },
  {
    title: "Automatic nudges",
    description:
      "If a client sits on a pending review for a few days, Portway emails them a reminder — you don't have to.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    ),
  },
];

const FAQS = [
  {
    q: "Does my client need to create an account?",
    a: "No. Each client gets a single private link tied to their project. They can view status, approve work, and exchange files without signing up for anything.",
  },
  {
    q: "What happens after my free active project?",
    a: "The Free plan covers 1 active project at a time. Once you need more running simultaneously, the Pro plan ($9/month) removes that limit. You can cancel anytime from your billing settings.",
  },
  {
    q: "Where are my files and client data stored?",
    a: "Files and project data are stored with Supabase, and subscription payments are handled by Stripe. Portway itself never stores your card details.",
  },
  {
    q: "Can I use my own branding?",
    a: "Yes — set a business name, accent color, and logo once in Settings, and every client portal link automatically reflects your brand.",
  },
];

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-5 w-5"
      >
        {children}
      </svg>
    </div>
  );
}

function PortalMockup() {
  return (
    <div className="mx-auto mt-12 max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50">
      <div className="flex items-center gap-1.5 border-b border-zinc-100 bg-zinc-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        <span className="ml-3 truncate rounded bg-white px-2 py-0.5 text-xs text-zinc-400">
          portway-three.vercel.app/portal/••••••••
        </span>
      </div>
      <div className="p-5 text-left">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-indigo-600" />
          <p className="text-sm text-zinc-500">Acme Design Co.</p>
        </div>
        <p className="mt-2 text-lg font-semibold text-zinc-900">Q3 Rebrand Project</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]">
            ✓ Kickoff
          </span>
          <span
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-600"
            style={{ boxShadow: "inset 0 0 0 2px #4f46e5" }}
          >
            In Progress (current)
          </span>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
            Review
          </span>
        </div>

        <div className="mt-4 rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
          logo_final_v3.png · 1.2 MB
        </div>

        <button className="mt-4 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white">
          Approve
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-zinc-50">
      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight text-zinc-900">Portway</span>
        <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          Log in
        </Link>
      </header>

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-120px] -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl"
        />

        <main className="mx-auto max-w-3xl px-6 pb-16 pt-12 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            A client portal that replaces the email back-and-forth
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-600">
            Give every client one clean, branded page to track status, exchange files, and
            approve work — instead of chasing them for the tenth time.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/login?mode=signup"
              className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Get started free
            </Link>
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            Free plan: 1 active client. Pro plan: $9/month for unlimited clients. No credit
            card required to start.
          </p>

          <PortalMockup />
        </main>
      </div>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-zinc-200 bg-white p-6 text-left"
            >
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <h2 className="mt-4 text-base font-semibold text-zinc-900">{feature.title}</h2>
              <p className="mt-2 text-sm text-zinc-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-white py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="text-lg text-zinc-700">
            &ldquo;I built Portway because I was tired of digging through email threads to figure
            out if a client had actually seen my last message. Now I send one link and move
            on.&rdquo;
          </p>
          <p className="mt-4 text-sm font-medium text-zinc-500">— Kaleo, creator of Portway</p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-24">
        <h2 className="text-center text-2xl font-semibold text-zinc-900">
          Frequently asked questions
        </h2>
        <div className="mt-8 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
          {FAQS.map((item) => (
            <div key={item.q} className="p-6">
              <h3 className="text-sm font-semibold text-zinc-900">{item.q}</h3>
              <p className="mt-2 text-sm text-zinc-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-400">
        <p>Portway — built for freelancers juggling multiple clients.</p>
        <div className="mt-3 flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-zinc-600">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-zinc-600">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
