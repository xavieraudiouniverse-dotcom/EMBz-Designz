import { createServiceClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { toggleSuspend } from "./actions";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabase = createServiceClient();
  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  const { data: roles } = await supabase.from("user_roles").select("user_id, role");

  const adminIds = new Set((roles ?? []).filter((r: any) => r.role === "admin").map((r: any) => r.user_id));

  return (
    <div>
      <div className="cc-header">
        <div>
          <small>IDENTITIES</small>
          <h1>CUSTOMERS</h1>
        </div>
      </div>
      <div className="space-y-2">
        {(profiles as Profile[] | null)?.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
            <div>
              <p className="text-sm font-medium">
                {p.full_name || "Unnamed"} {adminIds.has(p.id) && <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-[11px] text-primary">admin</span>}
              </p>
              <p className="text-xs text-muted-foreground">{p.email}</p>
            </div>
            <form action={toggleSuspend}>
              <input type="hidden" name="user_id" value={p.id} />
              <input type="hidden" name="suspend" value={(!p.is_suspended).toString()} />
              <button
                className={`rounded-full border px-4 py-1.5 text-xs ${
                  p.is_suspended ? "border-accent text-accent" : "border-destructive text-destructive"
                }`}
              >
                {p.is_suspended ? "Unsuspend" : "Suspend"}
              </button>
            </form>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        To make a user an admin, run in Supabase SQL Editor:{" "}
        <code className="text-accent">
          insert into user_roles (user_id, role) select id, 'admin' from auth.users where email = '...';
        </code>
      </p>
    </div>
  );
}
