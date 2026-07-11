import { signUp } from "../login/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Portway</h1>
        <p className="mt-1 text-sm text-zinc-500">Create your freelancer account</p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {message && (
          <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>
        )}

        <form action={signUp} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Create account
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-400">
          By signing up, you agree to our{" "}
          <a href="/terms" className="underline hover:text-zinc-600">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-zinc-600">
            Privacy Policy
          </a>
          .
        </p>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <a href="/login" className="underline hover:text-zinc-700">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
