import { Suspense } from "react";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import DesignerStudio from "./DesignerStudio";

export const revalidate = 0;

export default async function DesignerPage() {
  const supabase = createServiceClient();
  const { data: designed } = await supabase
    .from("products")
    .select("id, name")
    .not("design_data", "is", null)
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Product Designer</h1>
        <p className="text-sm text-muted-foreground">
          Mock up shirts, hoodies, and all-over-print products right here — no need to design in Merchize first.
        </p>
      </div>

      {designed && designed.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">Continue editing:</span>
          {designed.map((p: any) => (
            <Link key={p.id} href={`/admin/designer?product=${p.id}`} className="rounded-full border border-border px-3 py-1 hover:border-primary">
              {p.name}
            </Link>
          ))}
        </div>
      )}

      <Suspense fallback={null}>
        <DesignerStudio />
      </Suspense>
    </div>
  );
}
