import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/database";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createClient();
  let featured: Product[] = [];
  try {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .limit(4);
    featured = (data as Product[]) ?? [];
  } catch {
    // Supabase not configured yet
  }

  return (
    <div className="space-y-20">
      <section className="panel-metal edge-glow relative overflow-hidden rounded-2xl px-6 py-20 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-accent">Premium streetwear</p>
        <h1 className="shimmer-text font-display text-5xl leading-tight md:text-7xl">
          EMBZ DESIGNZ
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Chrome. Purple. Cyan. Drop after drop of oversized fits and metallic graphics built for the city.
        </p>
        <Link
          href="/shop"
          className="sweep glow-hover mt-8 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground"
        >
          Shop the collection
        </Link>
      </section>

      {featured.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl">Featured drops</h2>
            <Link href="/shop" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {featured.length === 0 && (
        <section className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          <p>
            No products loaded yet — connect Supabase and run <code className="text-accent">supabase/schema.sql</code>{" "}
            to seed the catalog.
          </p>
        </section>
      )}
    </div>
  );
}
