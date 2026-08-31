import { createServiceClient } from "@/lib/supabase/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY } from "@/lib/supabase/env";

export const revalidate = 0;

/**
 * Configuration health. Checks only whether each secret is PRESENT — values are
 * never read into the page. Had this existed earlier it would have answered
 * "which key is missing?" in one glance instead of a build log.
 */
type Check = { name: string; detail: string; ok: boolean; required: boolean; blocks: string };

export default async function AdminIntegrationsPage() {
  const has = (v?: string | null) => Boolean(v && v.length > 0);

  // Live round-trip to Supabase — proves the service key actually works,
  // not just that a string is present.
  let supabaseLive = false;
  try {
    const { error } = await createServiceClient().from("products").select("id").limit(1);
    supabaseLive = !error;
  } catch {
    supabaseLive = false;
  }

  const checks: Check[] = [
    { name: "SUPABASE — DATABASE URL", detail: "NEXT_PUBLIC_SUPABASE_URL", ok: has(SUPABASE_URL), required: true, blocks: "Everything" },
    { name: "SUPABASE — PUBLIC KEY", detail: "ANON / PUBLISHABLE KEY", ok: has(SUPABASE_ANON_KEY), required: true, blocks: "Sign in, cart, checkout" },
    { name: "SUPABASE — SERVICE KEY", detail: "SERVICE_ROLE / SECRET KEY", ok: has(SUPABASE_SERVICE_KEY), required: true, blocks: "This admin panel" },
    { name: "SUPABASE — LIVE CONNECTION", detail: "Real query round-trip", ok: supabaseLive, required: true, blocks: "Everything" },
    { name: "STRIPE — SECRET KEY", detail: "STRIPE_SECRET_KEY", ok: has(process.env.STRIPE_SECRET_KEY), required: true, blocks: "Taking payment" },
    { name: "STRIPE — WEBHOOK SECRET", detail: "STRIPE_WEBHOOK_SECRET", ok: has(process.env.STRIPE_WEBHOOK_SECRET), required: true, blocks: "Marking orders paid" },
    { name: "MERCHIZE — API KEY", detail: "MERCHIZE_API_KEY", ok: has(process.env.MERCHIZE_API_KEY), required: true, blocks: "Fulfilment + product import" },
    { name: "MERCHIZE — API BASE", detail: "MERCHIZE_API_BASE", ok: has(process.env.MERCHIZE_API_BASE), required: false, blocks: "Uses default endpoint" },
    { name: "MERCHIZE — WEBHOOK SECRET", detail: "MERCHIZE_WEBHOOK_SECRET", ok: has(process.env.MERCHIZE_WEBHOOK_SECRET), required: false, blocks: "Automatic tracking updates" },
    { name: "SITE URL", detail: "NEXT_PUBLIC_SITE_URL", ok: has(process.env.NEXT_PUBLIC_SITE_URL), required: false, blocks: "Stripe returns to the vercel.app URL" },
    { name: "AI ASSISTANT", detail: "GEMINI_API_KEY", ok: has(process.env.GEMINI_API_KEY), required: false, blocks: "The assistant widget" },
  ];

  const missingRequired = checks.filter((c) => c.required && !c.ok);
  const configured = checks.filter((c) => c.ok).length;

  return (
    <>
      <div className="cc-header">
        <div>
          <small>SYSTEM CONFIGURATION</small>
          <h1>INTEGRATIONS</h1>
        </div>
        <div className="cc-actions">
          <b>{missingRequired.length === 0 ? "● ALL SYSTEMS GO" : `● ${missingRequired.length} BLOCKING`}</b>
          <span>
            {configured}/{checks.length} <small>CONFIGURED</small>
          </span>
        </div>
      </div>

      {missingRequired.length > 0 && (
        <div className="cc-card" style={{ marginBottom: 12, borderColor: "#6b3a2a" }}>
          <div className="card-title">
            <b>BLOCKING ISSUES</b>
            <small>STORE CANNOT FULLY OPERATE</small>
          </div>
          {missingRequired.map((c) => (
            <div key={c.name} className="signal warn">
              <b>{c.name}</b>
              <small>Blocks: {c.blocks} — set {c.detail} in Vercel</small>
              <span>MISSING</span>
            </div>
          ))}
        </div>
      )}

      <div className="cc-card large-card">
        <div className="card-title">
          <b>CONFIGURATION STATUS</b>
          <small>PRESENCE ONLY — VALUES ARE NEVER READ</small>
        </div>
        <table>
          <thead>
            <tr>
              <th>INTEGRATION</th>
              <th>VARIABLE</th>
              <th>STATUS</th>
              <th>IF MISSING</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((c) => (
              <tr key={c.name}>
                <td style={{ color: "#ca8aff" }}>{c.name}</td>
                <td style={{ color: "#76687e" }}>{c.detail}</td>
                <td>
                  <span className="tag" style={{ color: c.ok ? "#5feab1" : c.required ? "#ff6b9c" : "#f2bd5b", borderColor: "currentColor" }}>
                    {c.ok ? "CONFIGURED" : c.required ? "MISSING" : "OPTIONAL"}
                  </span>
                </td>
                <td style={{ color: "#76687e" }}>{c.blocks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
