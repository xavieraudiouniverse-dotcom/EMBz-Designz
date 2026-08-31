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

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">GLOBAL OPERATIONS</p>
          <h1>EMBZ COMMAND CENTRE</h1>
        </div>
        <span className="status-pill">
          <span className="live-dot" />
          Live
        </span>
      </div>

      <div className="metrics" style={{ marginTop: 24 }}>
        <StatTile label="Total orders" value={orderCount} />
        <StatTile label="Total revenue" value={formatPrice(revenue, "AUD", 1)} />
        <StatTile label="Active customers" value={customerCount} />
        <StatTile label="Active shipments" value={activeShipments} />
      </div>

      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]" style={{ marginTop: 24 }}>
        <div className="admin-map" style={{ flexDirection: "column", padding: 16 }}>
          <p className="smallcaps" style={{ alignSelf: "flex-start" }}>
            GLOBAL ACTIVITY
          </p>
          <InteractiveGlobe points={nodes} routes={routes} small />
        </div>
        <div className="panel">
          <h2 className="smallcaps" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span className="live-dot" /> LIVE FEED
          </h2>
          <div>
            {(recentOrders ?? []).length === 0 && <p className="smallcaps">No orders yet.</p>}
            {(recentOrders ?? []).map((o: any) => (
              <div key={o.id} style={{ borderBottom: "1px solid #241430", padding: "10px 0", fontSize: 11 }}>
                <p style={{ color: "#eee" }}>
                  New order <span style={{ color: "#c96aff" }}>EMBZ-{o.id.slice(0, 8).toUpperCase()}</span>
                </p>
                <p style={{ marginTop: 2, display: "flex", justifyContent: "space-between", color: "#8e8497" }}>
                  <span>{o.country || "Unknown"}</span>
                  <span>{relativeTime(o.created_at)}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div style={{ marginTop: 24, border: "1px solid rgba(234,179,8,.4)", background: "rgba(234,179,8,.05)", padding: 16 }}>
          <p style={{ fontSize: 12, color: "#ffcf6b" }}>
            {lowStock.length} product{lowStock.length > 1 ? "s" : ""} low on stock: {lowStock.map((p: any) => p.name).join(", ")}
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2" style={{ marginTop: 24 }}>
        <div className="panel">
          <h2 className="smallcaps" style={{ marginBottom: 16 }}>
            REVENUE — LAST 30 DAYS
          </h2>
          <LineChart data={revenueSeries} color={CHART_PURPLE} formatValue={(v) => formatPrice(v, "AUD", 1)} />
        </div>
        <div className="panel">
          <h2 className="smallcaps" style={{ marginBottom: 16 }}>
            SIGNUPS — LAST 30 DAYS
          </h2>
          <LineChart data={signupSeries} color={CHART_TEAL} formatValue={(v) => `${v} signup${v === 1 ? "" : "s"}`} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2" style={{ marginTop: 24 }}>
        <div className="panel">
          <h2 className="smallcaps" style={{ marginBottom: 16 }}>
            ORDERS BY STATUS
          </h2>
          <BarChart data={statusData} color={CHART_TEAL} />
        </div>
        <div className="panel">
          <h2 className="smallcaps" style={{ marginBottom: 16 }}>
            TOP PRODUCTS BY REVENUE
          </h2>
          <BarChart data={topProducts} color={CHART_PURPLE} emptyLabel="No sales yet" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2" style={{ marginTop: 24, marginBottom: 24 }}>
        <div className="panel">
          <h2 className="smallcaps" style={{ marginBottom: 16 }}>
            ORDERS BY CURRENCY
          </h2>
          <BarChart data={currencyData} color={CHART_PURPLE} />
        </div>
        <div className="panel">
          <h2 className="smallcaps" style={{ marginBottom: 16 }}>
            RECENT MERCHIZE FULFILLMENT ACTIVITY
          </h2>
          {!fulfillmentLog || fulfillmentLog.length === 0 ? (
            <p className="smallcaps">Nothing logged yet.</p>
          ) : (
            <div>
              {fulfillmentLog.map((log: any) => (
                <div key={log.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid #241430", padding: "8px 0", fontSize: 11 }}>
                  <span style={{ color: "#8e8497" }}>{log.message}</span>
                  <span style={{ color: log.status === "failed" ? "#ff6b9c" : "#3ee6e0" }}>{log.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
