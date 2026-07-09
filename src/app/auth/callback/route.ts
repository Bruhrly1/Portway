import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_REDIRECTS = ["/reset-password", "/dashboard"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");
  const next = ALLOWED_REDIRECTS.includes(requestedNext ?? "") ? requestedNext! : "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // fall through to the invalid-link redirect below
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("That link is invalid or has expired.")}`,
  );
}
