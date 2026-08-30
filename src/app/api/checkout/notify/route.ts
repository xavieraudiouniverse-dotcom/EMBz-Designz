import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * DEPRECATED: This route is no longer called from checkout. It was the old
 * fire-and-forget endpoint called immediately after order creation, before
 * Stripe payments were added. Now that Stripe is in place, fulfillment only
 * happens after the webhook confirms payment actually succeeded.
 *
 * Left here for backwards compatibility / manual testing only. The real flow:
 * 1. Order created unpaid in checkout form.
 * 2. Stripe Checkout Session created and browser redirected to Stripe.
 * 3. Customer pays on Stripe's page.
 * 4. Stripe webhook hits /api/stripe/webhook, marks order paid, triggers fulfillment.
 *
 * Future use: could be repurposed as a manual admin "retry fulfillment" endpoint,
 * but the server action retryFulfillment in admin/orders/actions.ts already
 * handles that via the fulfillOrder() lib function.
 */
export async function POST(req: Request) {
  const { orderId } = await req.json().catch(() => ({}));
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const supabase = createServiceClient();
  const { data: order } = await supabase.from("orders").select("payment_status").eq("id", orderId).maybeSingle();

  if (!order) return NextResponse.json({ ok: true });
  if (order.payment_status !== "paid") {
    // Don't process unpaid orders — this endpoint is now only supposed to be
    // called after payment is confirmed by the Stripe webhook.
    return NextResponse.json({ ok: true });
  }

  const { fulfillOrder } = await import("@/lib/order-fulfillment");
  await fulfillOrder(orderId);
  return NextResponse.json({ ok: true });
}
