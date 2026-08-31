import { createServiceClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/currency";
import StatTile from "@/components/admin/StatTile";
import BarChart from "@/components/admin/BarChart";
import LineChart from "@/components/admin/LineChart";
import InteractiveGlobe from "@/components/InteractiveGlobe";
import { SHIPPING_STATUS_LABELS, SHIPPING_STATUS_ORDER } from "@/lib/tracking";
import { CITY_LATLON } from "@/lib/geo";

export const revalidate = 0;

const CHART_PURPLE = "#9b5cf0";
const CHART_TEAL = "#0aa39c";

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function AdminOverviewPage() {
  const supabase = createServiceClient();

  const [{ data: orders }, { data: profiles }, { data: products }, { data: orderItems }, { data: fulfillmentLog }, { data: recentOrders }] =
    await Promise.all([
      supabase.from("orders").select("id, total, display_currency, display_total, shipping_status, created_at"),
      supabase.from("profiles").select("id, created_at"),
      supabase.from("products").select("id, name, stock, is_active"),
      supabase.from("order_items").select("product_name, unit_price, quantity"),
      supabase
        .from("order_fulfillment_log")
        .select("id, order_id, status, message, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("orders")
        .select("id, customer_name, country, display_total, display_currency, shipping_status, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  const ordersList = orders ?? [];
  const revenue = ordersList.reduce((sum, o: any) => sum + Number(o.total), 0);
  const orderCount = ordersList.length;
  const customerCount = (profiles ?? []).length;
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;
  const lowStock = (products ?? []).filter((p: any) => p.is_active && p.stock < 10);
  const activeShipments = ordersList.filter((o: any) =>
    ["processing", "shipped", "in_transit", "out_for_delivery"].includes(o.shipping_status),
  ).length;

  function relativeTime(iso: string) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.round(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}hr ago`;
    return `${Math.round(hrs / 24)}d ago`;
  }

  // Revenue + signups over the last 30 days
  const days = lastNDays(30);
  const revenueByDay = new Map(days.map((d) => [d, 0]));
  ordersList.forEach((o: any) => {
    const day = o.created_at.slice(0, 10);
    if (revenueByDay.has(day)) revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + Number(o.total));
  });
  const revenueSeries = days.map((d) => ({ label: shortDate(d), value: Number((revenueByDay.get(d) ?? 0).toFixed(2)) }));

  const signupsByDay = new Map(days.map((d) => [d, 0]));
  (profiles ?? []).forEach((p: any) => {
    const day = p.created_at?.slice(0, 10);
    if (day && signupsByDay.has(day)) signupsByDay.set(day, (signupsByDay.get(day) ?? 0) + 1);
  });
  const signupSeries = days.map((d) => ({ label: shortDate(d), value: signupsByDay.get(d) ?? 0 }));

  // Orders by shipping status (including exceptions, which the customer-facing
  // timeline order deliberately omits)
  const statusCounts = new Map<string, number>();
  ordersList.forEach((o: any) => statusCounts.set(o.shipping_status, (statusCounts.get(o.shipping_status) ?? 0) + 1));
  const allStatuses = [...SHIPPING_STATUS_ORDER, "exception"] as const;
  const statusData = allStatuses.map((s) => ({
    label: SHIPPING_STATUS_LABELS[s],
    value: statusCounts.get(s) ?? 0,
  }));

  // Top products by revenue
  const revenueByProduct = new Map<string, number>();
  (orderItems ?? []).forEach((i: any) => {
    revenueByProduct.set(i.product_name, (revenueByProduct.get(i.product_name) ?? 0) + Number(i.unit_price) * i.quantity);
  });
  const topProducts = [...revenueByProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value, formattedValue: formatPrice(value, "AUD", 1) }));

  // Currency split
  const currencyTotals = new Map<string, number>();
  ordersList.forEach((o: any) => currencyTotals.set(o.display_currency, (currencyTotals.get(o.display_currency) ?? 0) + 1));
  const currencyData = [...currencyTotals.entries()].map(([label, value]) => ({ label, value }));

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Global operations</p>
          <h1 className="font-display text-2xl tracking-wide">EMBZ Command Centre</h1>
        </div>
        <span className="status-pill">
          <span className="live-dot" />
          Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Total orders" value={orderCount} />
        <StatTile label="Total revenue" value={formatPrice(revenue, "AUD", 1)} />
        <StatTile label="Active customers" value={customerCount} />
        <StatTile label="Active shipments" value={activeShipments} />
      </div>

      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div className="panel-metal edge-glow relative overflow-hidden rounded-2xl p-4">
          <h2 className="mb-2 px-1 text-sm text-muted-foreground">Global activity</h2>
          <div className="aspect-[2/1] w-full">
            {(() => {
              const nodes = [
                { ...CITY_LATLON.sydney, label: "Sydney", tone: "cyan" as const },
                { ...CITY_LATLON["new york"], label: "New York", tone: "purple" as const },
                { ...CITY_LATLON.london, label: "London", tone: "cyan" as const },
                { ...CITY_LATLON.tokyo, label: "Tokyo", tone: "purple" as const },
                { ...CITY_LATLON.singapore, label: "Singapore", tone: "cyan" as const },
              ];
              const routes = [
                { from: nodes[0], to: nodes[1], tone: "purple" as const },
                { from: nodes[0], to: nodes[2], tone: "cyan" as const },
                { from: nodes[1], to: nodes[3], tone: "purple" as const },
                { from: nodes[2], to: nodes[4], tone: "cyan" as const },
              ];
              return <InteractiveGlobe points={nodes} routes={routes} small />;
            })()}
          </div>
        </div>
        <div className="panel-metal rounded-2xl p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="live-dot" /> Live feed
          </h2>
          <ul className="space-y-3 text-xs">
            {(recentOrders ?? []).length === 0 && <li className="text-muted-foreground">No orders yet.</li>}
            {(recentOrders ?? []).map((o: any) => (
              <li key={o.id} className="border-b border-border pb-3 last:border-0">
                <p className="text-foreground">
                  New order <span className="text-accent">EMBZ-{o.id.slice(0, 8).toUpperCase()}</span>
                </p>
                <p className="mt-0.5 flex justify-between text-muted-foreground">
                  <span>{o.country || "Unknown"}</span>
                  <span>{relativeTime(o.created_at)}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/5 p-4">
          <p className="text-sm text-yellow-400">
            {lowStock.length} product{lowStock.length > 1 ? "s" : ""} low on stock: {lowStock.map((p: any) => p.name).join(", ")}
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="panel-metal rounded-xl p-5">
          <h2 className="mb-4 text-sm text-muted-foreground">Revenue — last 30 days</h2>
          <LineChart data={revenueSeries} color={CHART_PURPLE} formatValue={(v) => formatPrice(v, "AUD", 1)} />
        </div>
        <div className="panel-metal rounded-xl p-5">
          <h2 className="mb-4 text-sm text-muted-foreground">Signups — last 30 days</h2>
          <LineChart data={signupSeries} color={CHART_TEAL} formatValue={(v) => `${v} signup${v === 1 ? "" : "s"}`} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="panel-metal rounded-xl p-5">
          <h2 className="mb-4 text-sm text-muted-foreground">Orders by status</h2>
          <BarChart data={statusData} color={CHART_TEAL} />
        </div>
        <div className="panel-metal rounded-xl p-5">
          <h2 className="mb-4 text-sm text-muted-foreground">Top products by revenue</h2>
          <BarChart data={topProducts} color={CHART_PURPLE} emptyLabel="No sales yet" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="panel-metal rounded-xl p-5">
          <h2 className="mb-4 text-sm text-muted-foreground">Orders by currency</h2>
          <BarChart data={currencyData} color={CHART_PURPLE} />
        </div>
        <div className="panel-metal rounded-xl p-5">
          <h2 className="mb-4 text-sm text-muted-foreground">Recent Merchize fulfillment activity</h2>
          {!fulfillmentLog || fulfillmentLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing logged yet.</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {fulfillmentLog.map((log: any) => (
                <li key={log.id} className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0">
                  <span className="text-muted-foreground">{log.message}</span>
                  <span className={log.status === "failed" ? "text-destructive" : "text-accent"}>{log.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
