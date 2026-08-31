import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY } from "./env";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // called from a Server Component; middleware refreshes sessions instead
          }
        },
      },
    },
  );
}

/** Server-only client using the service role key — bypasses RLS. Never import from client code. */
export function createServiceClient() {
  return createSupabaseClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } },
  );
}
