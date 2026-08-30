import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMerchizeProduct } from "@/lib/merchize";

// NOTE: the admin UI at /admin/products calls importFromMerchize (a server action) directly
// instead of this route. This route stays available for external/manual imports (e.g. curl,
// or a future Merchize-side integration) that need a plain HTTP endpoint.

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Admin-only. Body: { merchizeProductId: string } */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: isAdminRow } = await supabase.rpc("is_admin");
  if (!isAdminRow) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { merchizeProductId } = await req.json().catch(() => ({}));
  if (!merchizeProductId) return NextResponse.json({ error: "merchizeProductId required" }, { status: 400 });

  if (!process.env.MERCHIZE_API_KEY) {
    return NextResponse.json(
      { error: "MERCHIZE_API_KEY is not configured yet — add it in your Vercel project's environment variables." },
      { status: 400 },
    );
  }

  try {
    const product = await getMerchizeProduct(merchizeProductId);
    const service = createServiceClient();
    const { data, error } = await service
      .from("products")
      .upsert(
        {
          name: product.name,
          slug: slugify(product.name),
          description: product.description ?? null,
          price: product.price ?? 0,
          image_url: product.images?.[0] ?? null,
          merchize_product_id: merchizeProductId,
          merchize_synced_at: new Date().toISOString(),
        },
        { onConflict: "merchize_product_id" },
      )
      .select()
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ product: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Import failed" }, { status: 500 });
  }
}
