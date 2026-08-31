import { createServiceClient } from "@/lib/supabase/server";
import type { Order } from "@/types/database";
import OrdersTable from "./OrdersTable";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const supabase = createServiceClient();
  const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="cc-header">
        <div>
          <small>ORDER MANAGEMENT</small>
          <h1>ORDERS &amp; LOGISTICS</h1>
        </div>
      </div>
      <div className="cc-card large-card">
        <div className="card-title">
          <b>ALL ORDERS</b>
          <small>LIVE FROM SUPABASE</small>
        </div>
        <OrdersTable orders={(orders as Order[] | null) ?? []} />
      </div>
    </div>
  );
}
