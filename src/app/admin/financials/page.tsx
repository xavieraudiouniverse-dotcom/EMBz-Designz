import { createServiceClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/currency";
import StatTile from "@/components/admin/StatTile";
import BarChart from "@/components/admin/BarChart";

export const revalidate = 0;

const CHART_PURPLE = "#9b5cf0";

export default async function AdminFinancialsPage() {
  const supabase = createServiceClient();

  const [{ data: orders }, { data: orderItems }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, payment_status, total, display_total, display_currency, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("order_items").select("product_name, unit_price, quantity"),
  ]);

  const ordersList = orders ?? [];
  const items = orderItems ?? [];

  const paid = ordersList.filter((o: any) => o.payment_status === "paid");
  const unpaid = ordersList.filter((o: any) => o.payment_status === "unpaid");
  const refunded = ordersList.filter((o: any) => o.payment_status === "refunded");

  const totalRevenue = paid.reduce((sum, o: any) => sum + Number(o.total), 0);
  const pendingRevenue = unpaid.reduce((sum, o: any) => sum + Number(o.total), 0);
  const refundedAmount = refunded.reduce((sum, o: any) => sum + Number(o.total), 0);

  const gstCollected = items
    .filter((i: any) => i.product_name?.toLowerCase().startsWith("gst"))
    .reduce((sum: number, i: any) => sum + Number(i.unit_price) * i.quantity, 0);

  const currencyRevenue = new Map<string, number>();
  paid.forEach((o: any) => {
    currencyRevenue.set(o.display_currency, (currencyRevenue.get(o.display_currency) ?? 0) + Number(o.display_total));
  });
  const currencyData = [...currencyRevenue.entries()].map(([label, value]) => ({
    label,
    value,
    formattedValue: formatPrice(value, label === "NZD" ? "NZD" : "AUD", 1),
  }));

  const recent = ordersList.slice(0, 10);

  return (
    <div>
      <div className="cc-header">
        <div>
          <small>MONEY IN, MONEY OUT</small>
          <h1>REPORTS</h1>
        </div>
      </div>

      <div className="cc-kpis">
        <StatTile label="Total revenue (paid)" value={formatPrice(totalRevenue, "AUD", 1)} />
        <StatTile label="Pending revenue" value={formatPrice(pendingRevenue, "AUD", 1)} tone="warning" />
        <StatTile label="Refunded" value={formatPrice(refundedAmount, "AUD", 1)} tone={refundedAmount > 0 ? "critical" : "default"} />
        <StatTile label="GST collected" value={formatPrice(gstCollected, "AUD", 1)} />
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <div className="cc-card">
          <h2 className="mb-4 text-sm text-muted-foreground">Revenue by currency</h2>
          <BarChart data={currencyData} color={CHART_PURPLE} emptyLabel="No paid orders yet" />
        </div>

        <div className="cc-card">
          <h2 className="mb-4 text-sm text-muted-foreground">Recent transactions</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="pb-2 pr-3">Order</th>
                    <th className="pb-2 pr-3">Date</th>
                    <th className="pb-2 pr-3">Status</th>
                    <th className="pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o: any) => (
                    <tr key={o.id} className="border-t border-border">
                      <td className="py-2 pr-3 font-mono text-xs text-accent">EMBZ-{o.id.slice(0, 8).toUpperCase()}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="py-2 pr-3 capitalize">
                        <span
                          className={
                            o.payment_status === "paid"
                              ? "text-emerald-400"
                              : o.payment_status === "refunded"
                                ? "text-destructive"
                                : "text-yellow-400"
                          }
                        >
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="py-2">{formatPrice(o.display_total, o.display_currency, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
