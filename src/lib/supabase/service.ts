import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Full-privilege client that bypasses Row Level Security. Only ever call
 * this after your own code has verified the caller is authorized (owns
 * the project, or holds a valid unexpired client portal token) - this
 * client itself enforces nothing.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
