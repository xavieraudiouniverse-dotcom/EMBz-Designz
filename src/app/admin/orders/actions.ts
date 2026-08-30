"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { fulfillOrder } from "@/lib/order-fulfillment";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data } = await supabase.rpc("is_admin");
  if (!data) throw new Error("Admin only");
}

export async function updateShipping(formData: FormData) {
  await requireAdmin();
  const service = createServiceClient();
  const orderId = String(formData.get("order_id"));
  const status = String(formData.get("shipping_status"));
  const carrier = String(formData.get("carrier") || "") || null;
  const tracking = String(formData.get("tracking_number") || "") || null;

  await service.from("orders").update({ shipping_status: status, carrier, tracking_number: tracking }).eq("id", orderId);
  await service.from("order_status_events").insert({
    order_id: orderId,
    status,
    note: "Updated by admin",
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/account/orders/${orderId}`);
}

export async function retryFulfillment(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("order_id"));
  await fulfillOrder(orderId);
  revalidatePath("/admin/orders");
}

export async function retryFulfillment(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("order_id"));
  const { fulfillOrder } = await import("@/lib/order-fulfillment");
  await fulfillOrder(orderId);
  revalidatePath("/admin/orders");
}
