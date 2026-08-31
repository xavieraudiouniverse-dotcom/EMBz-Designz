/**
 * Supabase credentials, resolved from either naming scheme.
 *
 * Supabase renamed its API keys: "anon" -> "publishable", "service_role" ->
 * "secret". The Vercel integration now installs the NEW names, while hand-added
 * vars (and older setups) use the OLD ones. Reading both means the app works
 * whichever way the project was configured, instead of failing the build.
 */

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  "";

export const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";

/** True when the public credentials needed to talk to Supabase are present. */
export const hasSupabaseEnv = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
