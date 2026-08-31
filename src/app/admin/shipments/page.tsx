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
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-accent">Global operations</p>
        <h1 className="font-display text-2xl tracking-wide">Shipments</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Active shipments" value={orders.length} />
        <StatTile label="In transit" value={inTransit} />
        <StatTile label="Out for delivery" value={outForDelivery} />
        <StatTile label="Exceptions" value={exceptions} tone={exceptions > 0 ? "critical" : "default"} />
      </div>

      <div className="panel-metal edge-glow relative overflow-hidden rounded-2xl p-4">
        <h2 className="mb-2 px-1 text-sm text-muted-foreground">Where shipments are right now</h2>
        <div className="aspect-[2/1] w-full">
          {points.length > 0 ? (
            <InteractiveGlobe points={points} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No active shipments to plot yet.
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm text-muted-foreground">Active orders</h2>
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
