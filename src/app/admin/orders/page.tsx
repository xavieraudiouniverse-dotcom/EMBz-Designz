import { createServiceClient } from "@/lib/supabase/server";
import type { Order } from "@/types/database";
import OrdersTable from "./OrdersTable";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const supabase = createServiceClient();
  const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p className="eyebrow">ORDER MANAGEMENT</p>
        <h1>ORDERS</h1>
      </div>
      <OrdersTable orders={(orders as Order[] | null) ?? []} />
    </div>
  );
}
