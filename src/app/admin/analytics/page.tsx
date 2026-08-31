import { createServiceClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/currency";
import StatTile from "@/components/admin/StatTile";
import BarChart from "@/components/admin/BarChart";
import LineChart from "@/components/admin/LineChart";

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

export default async function AdminAnalyticsPage() {
  const supabase = createServiceClient();

  const [{ data: orders }, { data: orderItems }] = await Promise.all([
    supabase.from("orders").select("id, user_id, total, created_at"),
    // product_id is null on shipping/tax line items, so this embed only
    // resolves a category for real product lines.
    supabase.from("order_items").select("product_id, unit_price, quantity, products(name, categories(name))"),
  ]);

  const ordersList = orders ?? [];
  const items = (orderItems ?? []) as any[];

  const orderCount = ordersList.length;
  const revenue = ordersList.reduce((sum, o: any) => sum + Number(o.total), 0);
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  const productLines = items.filter((i) => i.product_id);
  const itemsSold = productLines.reduce((sum, i) => sum + Number(i.quantity), 0);
  const avgItemsPerOrder = orderCount > 0 ? itemsSold / orderCount : 0;

  const buyerCounts = new Map<string, number>();
  ordersList.forEach((o: any) => {
    if (!o.user_id) return;
    buyerCounts.set(o.user_id, (buyerCounts.get(o.user_id) ?? 0) + 1);
  });
  const repeatBuyers = [...buyerCounts.values()].filter((n) => n > 1).length;
  const repeatRate = buyerCounts.size > 0 ? (repeatBuyers / buyerCounts.size) * 100 : 0;

  const revenueByCategory = new Map<string, number>();
  productLines.forEach((i) => {
    const category = i.products?.categories?.name ?? "Uncategorised";
    revenueByCategory.set(category, (revenueByCategory.get(category) ?? 0) + Number(i.unit_price) * i.quantity);
  });
  const categoryData = [...revenueByCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value, formattedValue: formatPrice(value, "AUD", 1) }));

  const days = lastNDays(30);
  const ordersByDay = new Map(days.map((d) => [d, 0]));
  ordersList.forEach((o: any) => {
    const day = o.created_at.slice(0, 10);
    if (ordersByDay.has(day)) ordersByDay.set(day, (ordersByDay.get(day) ?? 0) + 1);
  });
  const orderSeries = days.map((d) => ({ label: shortDate(d), value: ordersByDay.get(d) ?? 0 }));

  return (
    <div>
      <div className="cc-header">
        <div>
          <small>SALES PERFORMANCE</small>
          <h1>ANALYTICS</h1>
        </div>
      </div>

      <div className="cc-kpis">
        <StatTile label="Avg order value" value={formatPrice(avgOrderValue, "AUD", 1)} />
        <StatTile label="Items per order" value={avgItemsPerOrder.toFixed(1)} />
        <StatTile label="Items sold" value={itemsSold} />
        <StatTile label="Repeat customer rate" value={`${repeatRate.toFixed(0)}%`} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="cc-card">
          <h2 className="mb-4 text-sm text-muted-foreground">Orders — last 30 days</h2>
          <LineChart data={orderSeries} color={CHART_TEAL} formatValue={(v) => `${v} order${v === 1 ? "" : "s"}`} />
        </div>
        <div className="cc-card">
          <h2 className="mb-4 text-sm text-muted-foreground">Revenue by category</h2>
          <BarChart data={categoryData} color={CHART_PURPLE} emptyLabel="No sales yet" />
        </div>
      </div>
    </div>
  );
}
