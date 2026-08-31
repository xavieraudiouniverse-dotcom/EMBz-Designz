import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Public order-tracking lookup. Anyone with the order id/short-code can look
 * up shipping status — that's the point of a tracking page — but this route
 * deliberately returns only shipping-relevant fields, never the customer's
 * email, address, or phone. It uses the service client because the `orders`
 * RLS policy requires an authenticated owner/admin session, which an
 * anonymous visitor on a public tracking page never has.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("id") || "").trim();
  if (!raw) return NextResponse.json({ error: "Order number required" }, { status: 400 });

  // Accept a full UUID or the short "EMBZ-XXXXXXXX" style code shown across
  // the site (the first 8 hex chars of the id).
  const code = raw.replace(/^EMBZ-/i, "").replace(/-/g, "").toLowerCase();

  const supabase = createServiceClient();
  const isFullUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);

  const query = supabase
    .from("orders")
    .select("id, shipping_status, carrier, tracking_number, city, country, created_at, customer_name");

  const { data, error } = isFullUuid
    ? await query.eq("id", raw).maybeSingle()
    : await query.ilike("id", `${code}%`).limit(1).maybeSingle();

  if (error || !data) return NextResponse.json({ error: "No order found with that number" }, { status: 404 });

  return NextResponse.json({
    id: data.id,
    code: `EMBZ-${data.id.slice(0, 8).toUpperCase()}`,
    shipping_status: data.shipping_status,
    carrier: data.carrier,
    tracking_number: data.tracking_number,
    // First name only, plus destination country — enough to reassure the
    // looker-upper this is their order, without leaking a full address.
    first_name: (data.customer_name || "").split(" ")[0] || null,
    destination_country: data.country,
    created_at: data.created_at,
  });
}
