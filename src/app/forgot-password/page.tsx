import { requestPasswordReset } from "./actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Reset your password</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {message && (
          <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>
        )}

        <form action={requestPasswordReset} className="mt-6 flex flex-col gap-4">
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
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
          <a href="/login" className="underline hover:text-zinc-700">
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  );
}
