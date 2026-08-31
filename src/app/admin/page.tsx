import { createServiceClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/currency";
import BarChart from "@/components/admin/BarChart";
import LineChart from "@/components/admin/LineChart";
import InteractiveGlobe from "@/components/InteractiveGlobe";
import { SHIPPING_STATUS_LABELS, SHIPPING_STATUS_ORDER } from "@/lib/tracking";
import { CITY_LATLON } from "@/lib/geo";

export const revalidate = 0;

const CHART_PURPLE = "#b24fff";
const CHART_TEAL = "#5feab1";

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

/** NEXUS KPI tile. */
function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="cc-card kpi">
      <small>{label}</small>
      <strong>{value}</strong>
      <em>{detail}</em>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const supabase = createServiceClient();

  const [{ data: orders }, { data: profiles }, { data: products }, { data: orderItems }, { data: fulfillmentLog }, { data: recentOrders }] =
    await Promise.all([
      supabase.from("orders").select("id, total, display_currency, display_total, shipping_status, country, created_at"),
      supabase.from("profiles").select("id, created_at"),
      supabase.from("products").select("id, name, stock, is_active"),
      supabase.from("order_items").select("product_name, unit_price, quantity"),
      supabase
        .from("order_fulfillment_log")
        .select("id, order_id, status, message, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("orders")
        .select("id, customer_name, country, display_total, display_currency, shipping_status, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
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

  // Distinct destination countries actually seen in real orders.
  const markets = [...new Set(ordersList.map((o: any) => o.country).filter(Boolean))];

  function relativeTime(iso: string) {
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}hr ago`;
    return `${Math.round(hrs / 24)}d ago`;
  }

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

  const statusCounts = new Map<string, number>();
  ordersList.forEach((o: any) => statusCounts.set(o.shipping_status, (statusCounts.get(o.shipping_status) ?? 0) + 1));
  const allStatuses = [...SHIPPING_STATUS_ORDER, "exception"] as const;
  const statusData = allStatuses.map((s) => ({ label: SHIPPING_STATUS_LABELS[s], value: statusCounts.get(s) ?? 0 }));

  const revenueByProduct = new Map<string, number>();
  (orderItems ?? []).forEach((i: any) => {
    revenueByProduct.set(i.product_name, (revenueByProduct.get(i.product_name) ?? 0) + Number(i.unit_price) * i.quantity);
  });
  const topProducts = [...revenueByProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value, formattedValue: formatPrice(value, "AUD", 1) }));

  const nodes = markets.slice(0, 6).map((c: string, i) => {
    const key = c.toLowerCase();
    const city = CITY_LATLON[key] ?? CITY_LATLON.sydney;
    return { ...city, label: c, tone: (i % 2 === 0 ? "cyan" : "purple") as "cyan" | "purple" };
  });

  return (
    <>
      <div className="cc-header">
        <div>
          <small>GLOBAL OPERATIONS</small>
          <h1>NEXUS COMMAND CENTRE</h1>
        </div>
        <div className="cc-actions">
          <b>● LIVE — SUPABASE</b>
          <span>
            {markets.length} <small>MARKETS</small>
          </span>
        </div>
      </div>

      <div className="cc-kpis">
        <Metric label="TOTAL REVENUE" value={formatPrice(revenue, "AUD", 1)} detail="FROM LIVE ORDERS" />
        <Metric label="ORDERS" value={orderCount} detail="TRANSACTIONS RECORDED" />
        <Metric label="AVERAGE ORDER" value={formatPrice(avgOrderValue, "AUD", 1)} detail="AUTOMATICALLY CALCULATED" />
        <Metric label="CUSTOMERS" value={customerCount} detail="IDENTITIES REGISTERED" />
        <Metric label="ACTIVE SHIPMENTS" value={activeShipments} detail="IN FULFILMENT" />
      </div>

      <div className="cc-grid two">
        <div className="cc-card">
          <div className="card-title">
            <b>REVENUE — LAST 30 DAYS</b>
            <small>LIVE ORDERS</small>
          </div>
          <div className="live-chart">
            <LineChart data={revenueSeries} color={CHART_PURPLE} formatValue={(v) => formatPrice(v, "AUD", 1)} />
          </div>
        </div>

        <div className="cc-card">
          <div className="card-title">
            <b>SIGNALS</b>
            <small>SYSTEM STATUS</small>
          </div>
          {lowStock.length > 0 && (
            <div className="signal warn">
              <b>LOW STOCK</b>
              <small>{lowStock.map((p: any) => p.name).join(", ")}</small>
              <span>{lowStock.length}</span>
            </div>
          )}
          {(fulfillmentLog ?? []).map((log: any) => (
            <div key={log.id} className={`signal ${log.status === "failed" ? "warn" : "good"}`}>
              <b>{log.status === "failed" ? "FULFILMENT FAILED" : "FULFILMENT"}</b>
              <small>{log.message}</small>
              <span>{relativeTime(log.created_at)}</span>
            </div>
          ))}
          {lowStock.length === 0 && (fulfillmentLog ?? []).length === 0 && (
            <div className="empty-live">
              <div>◌</div>
              <b>NO SIGNALS</b>
              <p>Stock levels are healthy and no fulfilment events have been logged yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="cc-grid two">
        <div className="cc-card">
          <div className="card-title">
            <b>GLOBAL ACTIVITY</b>
            <small>DESTINATION MARKETS</small>
          </div>
          {nodes.length > 0 ? (
            <InteractiveGlobe points={nodes} small />
          ) : (
            <div className="empty-live">
              <div>◇</div>
              <b>NO MARKET SIGNALS</b>
              <p>Destination markets appear here once orders start coming in.</p>
            </div>
          )}
        </div>

        <div className="cc-card">
          <div className="card-title">
            <b>SIGNUPS — LAST 30 DAYS</b>
            <small>REGISTERED IDENTITIES</small>
          </div>
          <div className="live-chart">
            <LineChart data={signupSeries} color={CHART_TEAL} formatValue={(v) => `${v} signup${v === 1 ? "" : "s"}`} />
          </div>
        </div>
      </div>

      <div className="cc-grid two">
        <div className="cc-card">
          <div className="card-title">
            <b>ORDERS BY STATUS</b>
            <small>LOGISTICS</small>
          </div>
          <BarChart data={statusData} color={CHART_TEAL} />
        </div>
        <div className="cc-card">
          <div className="card-title">
            <b>TOP PRODUCTS BY REVENUE</b>
            <small>LIVE SALES</small>
          </div>
          <BarChart data={topProducts} color={CHART_PURPLE} emptyLabel="No sales yet" />
        </div>
      </div>

      <div className="cc-card large-card" style={{ marginTop: 12 }}>
        <div className="card-title">
          <b>RECENT ORDERS</b>
          <small>LIVE FEED</small>
        </div>
        {(recentOrders ?? []).length === 0 ? (
          <div className="empty-live">
            <div>▣</div>
            <b>NO LIVE ORDERS</b>
            <p>Orders appear here the moment a customer checks out.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>MARKET</th>
                <th>STATUS</th>
                <th>TOTAL</th>
                <th>WHEN</th>
              </tr>
            </thead>
            <tbody>
              {(recentOrders ?? []).map((o: any) => (
                <tr key={o.id}>
                  <td style={{ color: "#ca8aff" }}>EMBZ-{o.id.slice(0, 8).toUpperCase()}</td>
                  <td>{o.customer_name || "—"}</td>
                  <td>{o.country || "Unknown"}</td>
                  <td>
                    <span className="tag">{String(o.shipping_status).replace(/_/g, " ").toUpperCase()}</span>
                  </td>
                  <td>{formatPrice(o.display_total, o.display_currency as any, 1)}</td>
                  <td style={{ color: "#76687e" }}>{relativeTime(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
