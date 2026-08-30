import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured, siteUrl } from "@/lib/stripe";

/**
 * Creates a Stripe Checkout Session for an order that already exists (created
 * unpaid, at checkout submit time) and returns the hosted Checkout URL for
 * the browser to redirect to. The order is only ever marked "paid" later, by
 * the Stripe webhook — never here — so there's no way to fake a payment by
 * just hitting this endpoint.
 */
export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments aren't configured yet. Add STRIPE_SECRET_KEY to your environment variables." },
      { status: 503 },
    );
  }

  const { orderId } = await req.json().catch(() => ({}));
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  // Session-aware client: RLS means this only returns the order if the caller
  // is signed in as its owner (or is an admin) — this IS the auth check.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.payment_status === "paid") {
    return NextResponse.json({ url: `${siteUrl()}/account/orders/${orderId}` });
  }

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Order has no items" }, { status: 400 });
  }

  const stripe = getStripe();
  const currency = (order.currency || "AUD").toLowerCase();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customer_email || undefined,
      line_items: items.map((item: any) => ({
        quantity: item.quantity,
        price_data: {
          currency,
          unit_amount: Math.round(Number(item.unit_price) * 100),
          product_data: { name: item.product_name },
        },
      })),
      success_url: `${siteUrl()}/account/orders/${orderId}?paid=1`,
      cancel_url: `${siteUrl()}/account/orders/${orderId}?canceled=1`,
      metadata: { orderId },
      payment_intent_data: { metadata: { orderId } },
    });

    // Record the session id so the webhook (and the order page) can cross-reference it.
    // Uses the service client since this column update isn't covered by the customer's
    // own RLS update policy (only admins can update orders).
    const service = createServiceClient();
    await service.from("orders").update({ stripe_session_id: session.id }).eq("id", orderId);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Could not start checkout" }, { status: 500 });
  }
}
