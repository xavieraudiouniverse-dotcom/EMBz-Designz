import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Stubbed webhook for Merchize to push fulfillment/tracking updates back to us.
 * Validated with a shared secret (MERCHIZE_WEBHOOK_SECRET) via the
 * `x-webhook-secret` header until we have Merchize's real signing scheme.
 * Expected body (adjust once the real payload shape is known):
 *   { order_id: string, status: string, tracking_number?: string, carrier?: string }
 */
export async function POST(req: Request) {
  const secret = req.headers.get("x-webhook-secret");
  if (!process.env.MERCHIZE_WEBHOOK_SECRET || secret !== process.env.MERCHIZE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.order_id || !body?.status) {
    return NextResponse.json({ error: "order_id and status are required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const update: Record<string, unknown> = { shipping_status: body.status };
  if (body.tracking_number) update.tracking_number = body.tracking_number;
  if (body.carrier) update.carrier = body.carrier;

  await supabase.from("orders").update(update).eq("id", body.order_id);
  await supabase.from("order_status_events").insert({
    order_id: body.order_id,
    status: body.status,
    note: "Update from Merchize",
  });

  return NextResponse.json({ ok: true });
}
