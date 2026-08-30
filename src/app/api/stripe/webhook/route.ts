import { NextResponse } from "next/server";
import Stripe from "stripe";
import { markOrderPaidAndFulfill } from "@/lib/order-fulfillment";
import { getStripe } from "@/lib/stripe";

/**
 * Stripe webhook handler. Called whenever a Stripe event happens (we've
 * configured the webhook endpoint to only send checkout.session.completed
 * events, but the handler is generic and ignores unknown types).
 *
 * This is the ONLY place that marks an order as paid and triggers Merchize
 * fulfillment — never from the browser or the create-session route. This
 * means there is no way to fake a payment.
 *
 * Stripe can and will retry webhook deliveries if we don't return a 2xx
 * response, so we try hard to handle every request (even if it's a dupe)
 * without throwing.
 */
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    console.warn("Stripe webhook received but STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err?.message);
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  // We only care about checkout.session.completed events (the ones where the
  // customer successfully paid). Other event types are acknowledged but ignored.
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId || session.client_reference_id;

  if (!orderId) {
    console.warn("checkout.session.completed event has no orderId in metadata or client_reference_id");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    await markOrderPaidAndFulfill({
      orderId,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent ? String(session.payment_intent) : null,
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("Failed to mark order paid:", err?.message);
    // Return 5xx so Stripe retries, since the error was on our end, not the
    // event itself. If the error is transient (DB outage, network hiccup), the
    // retry will likely succeed.
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
