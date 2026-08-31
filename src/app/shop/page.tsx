import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { TagIcon, GlobeIcon, RefreshIcon, LockIcon } from "@/components/Icons";
import type { Product, Category } from "@/types/database";

const TRUST_ROW = [
  { Icon: TagIcon, title: "Premium quality", body: "Built to last" },
  { Icon: GlobeIcon, title: "Global shipping", body: "To 195+ countries" },
  { Icon: RefreshIcon, title: "Easy returns", body: "No stress" },
  { Icon: LockIcon, title: "Secure payments", body: "100% safe" },
];

export const revalidate = 0;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = createClient();
  const activeSlug = searchParams?.category;

  let categories: Category[] = [];
  let products: (Product & { categories: { name: string; slug: string } | null })[] = [];

  try {
    const [{ data: catData }, { data: prodData }] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    ]);
    categories = (catData as Category[]) ?? [];
    products = (prodData as any) ?? [];
  } catch {
    // Supabase not configured yet
  }

  const filtered = activeSlug ? products.filter((p) => p.categories?.slug === activeSlug) : products;

  return (
    <div id="collections" className="space-y-8 scroll-mt-24">
      <div className="text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.35em] text-accent">The full catalog</p>
        <h1 className="shimmer-text font-display text-4xl md:text-5xl">Shop the movement</h1>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/shop"
          className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
            !activeSlug
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-accent hover:text-accent"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/shop?category=${c.slug}#collections`}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              activeSlug === c.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-accent hover:text-accent"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No products in this collection yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 border-t border-border pt-8 md:grid-cols-4">
        {TRUST_ROW.map((t) => (
          <div key={t.title} className="flex flex-col items-center gap-2 text-center">
            <span className="feature-icon">
              <t.Icon className="h-5 w-5" />
            </span>
            <p className="text-xs font-medium uppercase tracking-wide">{t.title}</p>
            <p className="text-[11px] text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
