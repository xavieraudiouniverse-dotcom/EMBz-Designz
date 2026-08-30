import Stripe from "stripe";

/**
 * Thin wrapper around the official Stripe SDK. Payments made through Checkout
 * Sessions created with this client settle directly into whichever Stripe
 * account owns STRIPE_SECRET_KEY — that's you. There's no intermediary
 * account and nothing further to "link"; Stripe pays out to your bank
 * account on your account's normal payout schedule.
 */

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set — add it to your environment variables.");
  }
  if (!cached) {
    // No apiVersion pin on purpose: the Stripe SDK types the version as a string
    // literal, so hard-coding one breaks the build every time the package updates.
    // Omitting it uses the version this SDK release was built against.
    cached = new Stripe(key);
  }
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Best-effort absolute site URL, for building Stripe redirect URLs server-side. */
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
