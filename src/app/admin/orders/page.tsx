import { createServiceClient } from "@/lib/supabase/server";
import type { Order } from "@/types/database";
import { formatPrice } from "@/lib/currency";
import { updateShipping, retryFulfillment } from "./actions";

export const revalidate = 0;

const STATUSES = ["pending", "processing", "shipped", "in_transit", "out_for_delivery", "delivered", "exception"];

function paymentStatusBadge(status: string) {
  const styles: Record<string, string> = {
    unpaid: "bg-amber-900/30 text-amber-300",
    paid: "bg-emerald-900/30 text-emerald-300",
    refunded: "bg-blue-900/30 text-blue-300",
    failed: "bg-red-900/30 text-red-300",
  };
  const label: Record<string, string> = {
    unpaid: "Unpaid",
    paid: "Paid",
    refunded: "Refunded",
    failed: "Failed",
  };
  return <span className={`rounded px-2 py-1 text-xs font-medium ${styles[status] || styles.unpaid}`}>{label[status] || status}</span>;
}

export default async function AdminOrdersPage() {
  const supabase = createServiceClient();
  const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl">Orders</h1>
      <div className="space-y-3">
        {(orders as Order[] | null)?.map((o) => (
          <details key={o.id} className="rounded-lg border border-border bg-card p-4">
            <summary className="cursor-pointer text-sm">
              #{o.id.slice(0, 8)} — {o.customer_name} — {formatPrice(o.display_total, o.display_currency as any, 1)} — {paymentStatusBadge(o.payment_status)} —{" "}
              {o.shipping_status.replace(/_/g, " ")}
            </summary>
            <form action={updateShipping} className="mt-4 flex flex-wrap items-end gap-3">
              <input type="hidden" name="order_id" value={o.id} />
              <div>
                <label className="block text-xs text-muted-foreground">Status</label>
                <select name="shipping_status" defaultValue={o.shipping_status} className="rounded border border-border bg-background px-3 py-2 text-sm">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">Carrier</label>
                <input name="carrier" defaultValue={o.carrier ?? ""} placeholder="e.g. Australia Post" className="rounded border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">Tracking #</label>
                <input name="tracking_number" defaultValue={o.tracking_number ?? ""} className="rounded border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <button className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
                Update shipping
              </button>
            </form>
            {o.payment_status === "paid" && (
              <form action={retryFulfillment} className="mt-3">
                <input type="hidden" name="order_id" value={o.id} />
                <button className="text-xs text-accent hover:underline">Retry Merchize fulfillment →</button>
              </form>
            )}

            {o.payment_status === "paid" && (
              <form action={retryFulfillment} className="mt-3">
                <input type="hidden" name="order_id" value={o.id} />
                <button className="rounded-full border border-accent px-5 py-2 text-xs font-semibold text-accent hover:bg-accent/10">
                  Retry Merchize fulfillment
                </button>
              </form>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}
