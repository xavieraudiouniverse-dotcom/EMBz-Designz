import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusTimeline from "@/components/StatusTimeline";
import { trackingUrl } from "@/lib/tracking";
import { formatPrice } from "@/lib/currency";
import type { Order, OrderItem } from "@/types/database";

export const revalidate = 0;

function paymentStatusBadge(status: string) {
  const styles: Record<string, string> = {
    unpaid: "bg-amber-900/30 text-amber-300 border-amber-700",
    paid: "bg-emerald-900/30 text-emerald-300 border-emerald-700",
    refunded: "bg-blue-900/30 text-blue-300 border-blue-700",
    failed: "bg-red-900/30 text-red-300 border-red-700",
  };
  const label: Record<string, string> = {
    unpaid: "Payment pending",
    paid: "Payment received",
    refunded: "Refunded",
    failed: "Payment failed",
  };
  return (
    <span className={`inline-block rounded border px-2 py-1 text-xs font-medium ${styles[status] || styles.unpaid}`}>
      {label[status] || status}
    </span>
  );
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", params.id).maybeSingle();
  if (error || !order) notFound();

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", params.id);

  const o = order as Order;
  const url = trackingUrl(o.carrier, o.tracking_number);

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_1fr]">
      <div>
        <h1 className="text-2xl">Order #{o.id.slice(0, 8)}</h1>
        <p className="mb-2 text-sm text-muted-foreground">
          Placed {new Date(o.created_at).toLocaleString()}
        </p>
        <div className="mb-6">{paymentStatusBadge(o.payment_status)}</div>

        {o.payment_status === "unpaid" && (
          <div className="mb-6 rounded-lg border border-amber-700 bg-amber-900/20 p-4">
            <p className="mb-3 text-sm text-amber-200">This order hasn't been paid yet.</p>
            <Link href={`/checkout`} className="inline-block rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Pay now →
            </Link>
          </div>
        )}

        <StatusTimeline current={o.shipping_status} />
        {o.carrier && o.tracking_number && (
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <p>
              Carrier: <span className="text-foreground">{o.carrier}</span>
            </p>
            <p>
              Tracking #: <span className="text-foreground">{o.tracking_number}</span>
            </p>
            {url && (
              <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-accent hover:underline">
                Track package →
              </a>
            )}
          </div>
        )}
      </div>
      <div className="panel-metal h-fit rounded-xl p-6">
        <h2 className="mb-4 text-lg">Items</h2>
        {(items as OrderItem[] | null)?.map((item) => (
          <div key={item.id} className="flex justify-between py-1 text-sm">
            <span>
              {item.product_name} × {item.quantity}
            </span>
            <span>{formatPrice(item.unit_price * item.quantity, o.display_currency as any, 1)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold">
          <span>Total</span>
          <span className="text-accent">{formatPrice(o.display_total, o.display_currency as any, 1)}</span>
        </div>
        <div className="mt-6 space-y-1 text-xs text-muted-foreground">
          <p>{o.customer_name}</p>
          <p>{o.address_line1}{o.address_line2 ? `, ${o.address_line2}` : ""}</p>
          <p>{o.city}, {o.postal_code}</p>
          <p>{o.country}</p>
        </div>
      </div>
    </div>
  );
}

function PaymentButton({ orderId }: { orderId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        // This is a small SSR-gated form action that just fetches the session URL
        // and returns it for a client redirect. The order ownership is enforced
        // server-side by create-session (RLS check).
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/checkout/create-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const json = await res.json();
        if (json.url) {
          // Redirect to Stripe Checkout.
          // (Can't do this from a Server Action directly; would need to hand the URL back to client.)
        }
      }}
      className="mt-3"
    >
      <button
        type="submit"
        className="sweep glow-hover rounded-full bg-accent px-6 py-2 text-sm font-semibold text-accent-foreground"
      >
        Pay now
      </button>
    </form>
  );
}
