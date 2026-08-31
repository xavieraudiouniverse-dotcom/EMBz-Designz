import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import Artwork from "@/components/Artwork";
import InteractiveGlobe from "@/components/InteractiveGlobe";
import { GlobeIcon, RadarIcon, LockIcon, HeartIcon } from "@/components/Icons";
import { CITY_LATLON } from "@/lib/geo";
import type { Product } from "@/types/database";

export const revalidate = 0;

const FEATURES = [
  { Icon: GlobeIcon, title: "WORLDWIDE SHIPPING", body: "TO ALL COUNTRIES" },
  { Icon: RadarIcon, title: "LIVE ORDER TRACKING", body: "REAL TIME UPDATES" },
  { Icon: LockIcon, title: "SECURE CHECKOUT", body: "100% ENCRYPTED" },
  { Icon: HeartIcon, title: "DEDICATED LEGACY", body: "FAMILY COMES FIRST" },
];

export default async function HomePage() {
  const supabase = createClient();
  let featured: (Product & { categories?: { name: string; slug: string } | null })[] = [];
  try {
    const { data } = await supabase
      .from("products")
      .select("*, categories(name, slug)")
      .eq("is_active", true)
      .eq("is_featured", true)
      .limit(4);
    featured = (data as any) ?? [];
  } catch {
    // Supabase not configured yet
  }

  const nodes = [
    { ...CITY_LATLON.sydney, label: "Sydney", tone: "cyan" as const },
    { ...CITY_LATLON["new york"], label: "New York", tone: "purple" as const },
    { ...CITY_LATLON.london, label: "London", tone: "cyan" as const },
    { ...CITY_LATLON.tokyo, label: "Tokyo", tone: "purple" as const },
    { ...CITY_LATLON.singapore, label: "Singapore", tone: "cyan" as const },
  ];
  const routes = [
    { from: nodes[0], to: nodes[1], tone: "purple" as const },
    { from: nodes[0], to: nodes[2], tone: "cyan" as const },
    { from: nodes[1], to: nodes[3], tone: "purple" as const },
    { from: nodes[2], to: nodes[4], tone: "cyan" as const },
  ];

  return (
    <main>
      <section className="home-hero">
        <div className="city-grid" />
        <div className="hero-copy">
          <p className="eyebrow">GLOBAL MOVEMENT · GLOBAL IMPACT</p>
          <Image
            src="/embz-logo.png"
            alt="EMBZ-DESIGNZ"
            width={1254}
            height={1254}
            priority
            className="mx-auto mt-3 h-auto w-[240px] drop-shadow-[0_0_45px_rgba(155,42,255,0.6)] sm:w-[300px]"
          />
          <h2>STREET ART WITHOUT BORDERS</h2>
          <p>ART. FAMILY. LEGACY. WORLDWIDE.</p>
          <div className="buttons">
            <Link href="/shop" className="btn">
              SHOP THE MOVEMENT
            </Link>
            <Link href="/legacy" className="btn ghost">
              EXPLORE THE LEGACY
            </Link>
          </div>
        </div>
      </section>

      <section className="feature-strip">
        {FEATURES.map((f) => (
          <div key={f.title}>
            <div className="feature-icon">
              <f.Icon className="h-4 w-4" />
            </div>
            <b>{f.title}</b>
            <small>{f.body}</small>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">CURATED COLLECTION</p>
            <h2>SHOP THE MOVEMENT</h2>
          </div>
          <Link href="/shop" className="text-link">
            VIEW ALL →
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="smallcaps">
            No products loaded yet — connect Supabase and run supabase/schema.sql to seed the catalog.
          </p>
        )}
      </section>

      <section className="legacy-preview">
        <div>
          <p className="eyebrow">THE LEGACY</p>
          <h2>
            ELLA MARY
            <br />
            BROUGHTON
            <br />
            <span>&amp; JOHN BROUGHTON</span>
          </h2>
          <p>A LEGACY OF LOVE. A FUTURE OF HOPE.</p>
          <Link href="/legacy" className="btn">
            OUR STORY
          </Link>
        </div>
        <Artwork mark="EMBZ" />
      </section>

      <section className="movement-preview">
        <div>
          <p className="eyebrow">ONE WORLD. BILLIONS OF CONNECTIONS.</p>
          <h2>
            THE $9.1 BILLION
            <br />
            MOVEMENT
          </h2>
          <p>195+ COUNTRIES · 1.2M+ SUPPORTERS · 50K+ ARTISTS</p>
          <Link href="/movement" className="btn">
            BE PART OF THE MOVEMENT
          </Link>
        </div>
        <InteractiveGlobe points={nodes} routes={routes} small />
      </section>
    </main>
  );
}
