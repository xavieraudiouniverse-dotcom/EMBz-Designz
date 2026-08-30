import { createServiceClient } from "@/lib/supabase/server";
import { pushMerchizeOrder } from "@/lib/merchize";

/**
 * Pushes a paid order to Merchize for fulfillment (for any line items that came
 * from a Merchize-linked product) and records the result to
 * order_fulfillment_log. Safe to call more than once for the same order — a
 * repeat call just logs another attempt, which is exactly what "retry" means
 * from the admin Orders page.
 *
 * This is intentionally the ONLY place that talks to Merchize on the order
 * path, so both the Stripe webhook (real payments) and the admin "Retry
 * fulfillment" button (manual re-push) go through identical logic.
 */
export async function fulfillOrder(orderId: string): Promise<{ pushed: boolean; message: string }> {
  const supabase = createServiceClient();

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return { pushed: false, message: "Order not found." };

  const { data: items } = await supabase
    .from("order_items")
    .select("*, products(merchize_product_id)")
    .eq("order_id", orderId);

  const merchizeItems = (items ?? []).filter((i: any) => i.products?.merchize_product_id);

  if (merchizeItems.length === 0) {
    return { pushed: false, message: "No Merchize-linked items on this order." };
  }
  if (!process.env.MERCHIZE_API_KEY) {
    return { pushed: false, message: "MERCHIZE_API_KEY is not set." };
  }

  try {
    const result = await pushMerchizeOrder({
      externalOrderId: order.id,
      customer: { name: order.customer_name, email: order.customer_email, phone: order.phone ?? undefined },
      shippingAddress: {
        line1: order.address_line1,
        line2: order.address_line2 ?? undefined,
        city: order.city,
        postalCode: order.postal_code,
        country: order.country,
      },
      items: merchizeItems.map((i: any) => ({
        merchizeProductId: i.products.merchize_product_id,
        quantity: i.quantity,
      })),
    });
    const message = `Pushed to Merchize (merchize order ${result.merchizeOrderId ?? "unknown"})`;
    await supabase.from("order_fulfillment_log").insert({ order_id: orderId, status: "sent", message });
    return { pushed: true, message };
  } catch (err: any) {
    const message = err?.message ?? "Unknown error pushing to Merchize";
    await supabase.from("order_fulfillment_log").insert({ order_id: orderId, status: "failed", message });
    return { pushed: false, message };
  }
}

/**
 * Marks an order paid and kicks off fulfillment. Called from the Stripe
 * webhook once a Checkout Session actually completes — never from the
 * browser, so there's no way to mark an order paid without Stripe itself
 * confirming it.
 */
export async function markOrderPaidAndFulfill(opts: {
  orderId: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
}): Promise<void> {
  const supabase = createServiceClient();

  const { data: order } = await supabase.from("orders").select("payment_status").eq("id", opts.orderId).maybeSingle();
  if (!order) return;

  // Idempotency: Stripe can and does redeliver webhook events. If we've already
  // marked this order paid, don't double-log or double-push to Merchize.
  if (order.payment_status === "paid") return;

  await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      stripe_session_id: opts.stripeSessionId,
      stripe_payment_intent_id: opts.stripePaymentIntentId,
    })
    .eq("id", opts.orderId);

  await supabase.from("order_status_events").insert({
    order_id: opts.orderId,
    status: "pending",
    note: "Payment received via Stripe — order confirmed",
  });

  await fulfillOrder(opts.orderId);
}
