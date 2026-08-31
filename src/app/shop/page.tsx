import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { TagIcon, GlobeIcon, RefreshIcon, LockIcon } from "@/components/Icons";
import type { Product, Category } from "@/types/database";

const TRUST_ROW = [
  { Icon: TagIcon, title: "PREMIUM QUALITY", body: "BUILT TO LAST" },
  { Icon: GlobeIcon, title: "GLOBAL SHIPPING", body: "TO 195+ COUNTRIES" },
  { Icon: RefreshIcon, title: "EASY RETURNS", body: "NO STRESS" },
  { Icon: LockIcon, title: "SECURE PAYMENTS", body: "100% SAFE" },
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
    <div id="collections" className="page scroll-mt-24">
      <div className="page-title">
        <p className="eyebrow">THE FULL CATALOG</p>
        <h1>SHOP THE MOVEMENT</h1>
      </div>

      <div className="filters">
        <Link href="/shop" className={!activeSlug ? "active" : ""}>
          ALL
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/shop?category=${c.slug}#collections`} className={activeSlug === c.slug ? "active" : ""}>
            {c.name.toUpperCase()}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="smallcaps" style={{ textAlign: "center", padding: "40px 0" }}>
          No products in this collection yet — check back soon.
        </p>
      ) : (
        <div className="product-grid shop-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <div className="feature-strip" style={{ marginTop: 60, borderInline: "1px solid #311548" }}>
        {TRUST_ROW.map((t) => (
          <div key={t.title}>
            <div className="feature-icon">
              <t.Icon className="h-4 w-4" />
            </div>
            <b>{t.title}</b>
            <small>{t.body}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
