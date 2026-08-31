import { createServiceClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/currency";
import InteractiveGlobe, { type GlobePoint } from "@/components/InteractiveGlobe";
import { latLonForCountry } from "@/lib/geo";

export const revalidate = 0;

/**
 * Market intelligence, derived entirely from real orders. Every figure here is
 * computed from the orders table — there are no illustrative numbers.
 */
export default async function AdminMarketsPage() {
  const supabase = createServiceClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, country, total, display_total, display_currency, created_at, shipping_status");

  const list = orders ?? [];

  const byCountry = new Map<string, { orders: number; revenue: number; last: string }>();
  list.forEach((o: any) => {
    const key = (o.country || "Unknown").trim();
    const cur = byCountry.get(key) ?? { orders: 0, revenue: 0, last: o.created_at };
    cur.orders += 1;
    cur.revenue += Number(o.total || 0);
    if (o.created_at > cur.last) cur.last = o.created_at;
    byCountry.set(key, cur);
  });

  const markets = [...byCountry.entries()]
    .map(([country, v]) => ({ country, ...v, aov: v.orders ? v.revenue / v.orders : 0 }))
    .sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = markets.reduce((s, m) => s + m.revenue, 0);

  const points: GlobePoint[] = markets.slice(0, 12).map((m, i) => {
    const p = latLonForCountry(m.country);
    return { lat: p.lat, lon: p.lon, label: m.country, tone: i % 2 === 0 ? "cyan" : "purple" };
  });

  return (
    <>
      <div className="cc-header">
        <div>
          <small>WHERE THE MOVEMENT IS</small>
          <h1>MARKET INTELLIGENCE</h1>
        </div>
        <div className="cc-actions">
          <b>● LIVE — SUPABASE</b>
        </div>
      </div>

      <div className="cc-kpis" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="cc-card kpi">
          <small>MARKETS REACHED</small>
          <strong>{markets.length}</strong>
          <em>COUNTRIES WITH ORDERS</em>
        </div>
        <div className="cc-card kpi">
          <small>TOP MARKET</small>
          <strong>{markets[0]?.country ?? "—"}</strong>
          <em>{markets[0] ? `${((markets[0].revenue / totalRevenue) * 100).toFixed(0)}% OF REVENUE` : "AWAITING DATA"}</em>
        </div>
        <div className="cc-card kpi">
          <small>TOTAL REVENUE</small>
          <strong>{formatPrice(totalRevenue, "AUD", 1)}</strong>
          <em>ACROSS ALL MARKETS</em>
        </div>
      </div>

      <div className="cc-grid two">
        <div className="cc-card">
          <div className="card-title">
            <b>DESTINATION MAP</b>
            <small>REAL GEOGRAPHY</small>
          </div>
          {points.length > 0 ? (
            <InteractiveGlobe points={points} small />
          ) : (
            <div className="empty-live">
              <div>◇</div>
              <b>NO MARKET SIGNALS</b>
              <p>Countries appear here as soon as real orders come in.</p>
            </div>
          )}
        </div>

        <div className="cc-card">
          <div className="card-title">
            <b>MARKETS DETECTED</b>
            <small>BY REVENUE</small>
          </div>
          {markets.length === 0 ? (
            <div className="empty-live">
              <div>◌</div>
              <b>AWAITING MARKET DATA</b>
              <p>No orders recorded yet.</p>
            </div>
          ) : (
            <div className="country-cloud">
              {markets.slice(0, 14).map((m) => (
                <span key={m.country}>{m.country}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="cc-card large-card" style={{ marginTop: 12 }}>
        <div className="card-title">
          <b>MARKET BREAKDOWN</b>
          <small>EVERY COUNTRY WITH AN ORDER</small>
        </div>
        {markets.length === 0 ? (
          <div className="empty-live">
            <div>▥</div>
            <b>NO DATA YET</b>
            <p>This table fills itself from your orders — nothing to import.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>MARKET</th>
                <th>ORDERS</th>
                <th>REVENUE</th>
                <th>AVG ORDER</th>
                <th>SHARE</th>
                <th>LAST ORDER</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((m) => (
                <tr key={m.country}>
                  <td style={{ color: "#ca8aff" }}>{m.country}</td>
                  <td>{m.orders}</td>
                  <td>{formatPrice(m.revenue, "AUD", 1)}</td>
                  <td>{formatPrice(m.aov, "AUD", 1)}</td>
                  <td>{totalRevenue ? `${((m.revenue / totalRevenue) * 100).toFixed(1)}%` : "—"}</td>
                  <td style={{ color: "#76687e" }}>{new Date(m.last).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
