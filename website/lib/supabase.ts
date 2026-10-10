/**
 * Supabase clients — split into server + browser halves so we don't ship
 * the service-role key to the browser.
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY  (server only — never prefix with NEXT_PUBLIC_)
 *
 * Auth model: NextAuth still owns Google sign-in. We pass the user's email
 * (a stable identity) into Supabase as the row identifier — no separate
 * Supabase auth required. RLS is therefore disabled on these tables and
 * all writes go through our server route, which gates on `await auth()`.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _server: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  if (_server) return _server;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env not set — see SUPABASE_SETUP.md (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)",
    );
  }
  _server = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _server;
}
