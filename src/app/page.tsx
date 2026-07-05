import Link from "next/link";

const FEATURES = [
  {
    title: "One branded link per client",
    description:
      "No client logins, no passwords. Send a single link and your client sees project status, files, and what's needed from them.",
  },
  {
    title: "Stop chasing approvals",
    description:
      "Clients approve work or request changes right from the portal — no more \"did you see my email?\" follow-ups.",
  },
  {
    title: "Files, both directions",
    description:
      "Upload and receive files in one place instead of scattered across email threads and chat apps.",
  },
  {
    title: "Automatic nudges",
    description:
      "If a client sits on a pending review for a few days, Portway emails them a reminder — you don't have to.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight text-zinc-900">Portway</span>
        <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          Log in
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-12 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          A client portal that replaces the email back-and-forth
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-600">
          Give every client one clean, branded page to track status, exchange files, and approve
          work — instead of chasing them for the tenth time.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Get started free
          </Link>
        </div>
        <p className="mt-3 text-sm text-zinc-400">
          Free for 1 active client. $9/month for unlimited.
        </p>
      </main>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-zinc-200 bg-white p-6 text-left"
            >
              <h2 className="text-base font-semibold text-zinc-900">{feature.title}</h2>
              <p className="mt-2 text-sm text-zinc-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-400">
        Portway — built for freelancers juggling multiple clients.
      </footer>
    </div>
  );
}
