import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Order, Profile } from "@/types/database";
import { formatPrice } from "@/lib/currency";
import SignOutButton from "./SignOutButton";

export const revalidate = 0;

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const p = profile as Profile | null;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">My Account</h1>
          <p className="text-sm text-muted-foreground">{p?.full_name || user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <div>
        <h2 className="mb-4 text-lg">Order history</h2>
        {!orders || orders.length === 0 ? (
          <p className="text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {(orders as Order[]).map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="edge-glow flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary"
              >
                <div>
                  <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()} · {order.shipping_status.replace(/_/g, " ")}
                  </p>
                </div>
                <p className="text-accent">{formatPrice(order.display_total, order.display_currency as any, 1)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
