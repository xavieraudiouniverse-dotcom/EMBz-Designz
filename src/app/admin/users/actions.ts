"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data } = await supabase.rpc("is_admin");
  if (!data) throw new Error("Admin only");
}

export async function toggleSuspend(formData: FormData) {
  await requireAdmin();
  const service = createServiceClient();
  const userId = String(formData.get("user_id"));
  const suspend = formData.get("suspend") === "true";
  await service.from("profiles").update({ is_suspended: suspend }).eq("id", userId);
  revalidatePath("/admin/users");
}
