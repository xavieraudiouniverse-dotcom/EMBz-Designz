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
      <section className="hero-stage hero-scan edge-glow relative overflow-hidden rounded-2xl px-6 py-24 text-center md:py-32">
        <div className="holo-grid" />
        <div className="holo-particles" />

        <div className="relative z-10">
          <span className="status-pill">
            <span className="status-dot" />
            Global movement online
          </span>

          <h1 className="shimmer-text mt-6 font-display text-6xl leading-[0.95] md:text-8xl">
            EMBZ-DESIGNZ
          </h1>
          <p className="mt-3 text-sm uppercase tracking-[0.4em] text-accent md:text-base">
            Street art without borders
          </p>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            Chrome. Purple. Cyan. Drop after drop of oversized fits and metallic graphics — built in loving memory
            of Ella Mary Broughton &amp; John Broughton.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/shop" className="btn-primary-glow">
              Enter the store
            </Link>
            <Link href="/legacy" className="btn-outline-glow">
              Explore the legacy
            </Link>
          </div>

          <div className="hairline mx-auto mt-12 h-px w-full max-w-md" />

          <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="stat-chip">
              <span className="font-display text-xl text-foreground">195+</span>
              Countries
            </span>
            <span className="text-border">•</span>
            <span className="stat-chip">
              <span className="font-display text-xl text-foreground">Live</span>
              Order tracking
            </span>
            <span className="text-border">•</span>
            <span className="stat-chip">
              <span className="font-display text-xl text-foreground">Secure</span>
              Checkout
            </span>
          </div>
        </div>
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
