import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { GlobeIcon, RadarIcon, LockIcon, HeartIcon } from "@/components/Icons";
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
            Global movement &middot; Global impact
          </span>

          <Image
            src="/embz-logo.png"
            alt="EMBZ DESIGNZ"
            width={1254}
            height={1254}
            priority
            className="mx-auto mt-6 h-auto w-[85%] max-w-[640px] drop-shadow-[0_0_70px_rgba(155,92,240,0.55)] sm:w-[75%] md:w-[560px]"
          />
          <p className="mt-3 text-sm uppercase tracking-[0.4em] text-accent md:text-base">
            Street art without borders
          </p>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            Chrome. Purple. Cyan. Drop after drop of oversized fits and metallic graphics — built in loving memory
            of Ella Mary Broughton &amp; John Broughton.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/shop" className="btn-primary-glow">
              Shop the movement
            </Link>
            <Link href="/legacy" className="btn-outline-glow">
              Explore the legacy
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { Icon: GlobeIcon, title: "Worldwide shipping", body: "To all countries" },
          { Icon: RadarIcon, title: "Live order tracking", body: "Global visibility" },
          { Icon: LockIcon, title: "Secure checkout", body: "100% protected" },
          { Icon: HeartIcon, title: "Dedicated legacy", body: "Family comes first" },
        ].map((f) => (
          <div key={f.title} className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center">
            <span className="feature-icon">
              <f.Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{f.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
            </div>
          </div>
        ))}
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
