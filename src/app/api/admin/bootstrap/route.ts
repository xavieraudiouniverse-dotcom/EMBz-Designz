import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * First-run admin bootstrap.
 *
 * Promotes the CURRENTLY SIGNED-IN user to admin, but only while the store has
 * no admin at all. The moment one exists this route refuses everyone, so it
 * cannot be used to escalate privileges later — it exists purely to solve the
 * chicken-and-egg of the first admin, without needing database access.
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in first, then try again." }, { status: 401 });
  }

  const service = createServiceClient();

  const { count, error: countError } = await service
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "An admin already exists. This one-time setup is closed — grant further admins from the database." },
      { status: 403 },
    );
  }

  const { error } = await service
    .from("user_roles")
    .insert({ user_id: user.id, role: "admin" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email: user.email });
}
