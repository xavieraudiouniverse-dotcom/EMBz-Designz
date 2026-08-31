import { createServiceClient } from "@/lib/supabase/server";
import type { Order } from "@/types/database";
import OrdersTable from "./OrdersTable";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const supabase = createServiceClient();
  const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-accent">Order management</p>
        <h1 className="font-display text-2xl tracking-wide">Orders</h1>
      </div>
      <OrdersTable orders={(orders as Order[] | null) ?? []} />
    </div>
  );
}
