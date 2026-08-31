import { createServiceClient } from "@/lib/supabase/server";
import StatTile from "@/components/admin/StatTile";
import InteractiveGlobe, { type GlobePoint } from "@/components/InteractiveGlobe";
import OrdersTable from "../orders/OrdersTable";
import { latLonForCountry } from "@/lib/geo";
import type { Order } from "@/types/database";

export const revalidate = 0;

const ACTIVE_STATUSES = ["processing", "shipped", "in_transit", "out_for_delivery"] as const;

export default async function AdminShipmentsPage() {
  const supabase = createServiceClient();

  const { data: activeOrders } = await supabase
    .from("orders")
    .select("*")
    .in("shipping_status", ACTIVE_STATUSES)
    .order("created_at", { ascending: false });

  const { data: exceptionOrders } = await supabase
    .from("orders")
    .select("id")
    .eq("shipping_status", "exception");

  const orders = (activeOrders as Order[] | null) ?? [];
  const inTransit = orders.filter((o) => o.shipping_status === "in_transit" || o.shipping_status === "shipped").length;
  const outForDelivery = orders.filter((o) => o.shipping_status === "out_for_delivery").length;
  const exceptions = exceptionOrders?.length ?? 0;

  // One marker per distinct destination country currently in transit — an
  // operational snapshot, not a literal live-GPS feed.
  const countries = [...new Set(orders.map((o) => o.country).filter(Boolean))].slice(0, 8);
  const points: GlobePoint[] = countries.map((c) => {
    const p = latLonForCountry(c);
    return { lat: p.lat, lon: p.lon, label: c, tone: "cyan" };
  });

  return (
    <div>
      <div className="cc-header">
        <div>
          <small>GLOBAL OPERATIONS</small>
          <h1>SHIPMENTS</h1>
        </div>
      </div>

      <div className="cc-kpis" style={{ marginTop: 24 }}>
        <StatTile label="Active shipments" value={orders.length} />
        <StatTile label="In transit" value={inTransit} />
        <StatTile label="Out for delivery" value={outForDelivery} />
        <StatTile label="Exceptions" value={exceptions} tone={exceptions > 0 ? "critical" : "default"} />
      </div>

      <div className="cc-card" style={{ marginTop: 12 }}>
        <div className="card-title"><b>WHERE SHIPMENTS ARE RIGHT NOW</b><small>LIVE</small></div>
        {points.length > 0 ? (
          <InteractiveGlobe points={points} />
        ) : (
          <div className="empty-live"><div>◇</div><b>NO ACTIVE SHIPMENTS</b><p>Destinations appear here once orders are in fulfilment.</p></div>
        )}
      </div>

      <div className="cc-card large-card" style={{ marginTop: 12 }}>
        <div className="card-title">
          <b>ACTIVE ORDERS</b>
          <small>IN FULFILMENT</small>
        </div>
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
