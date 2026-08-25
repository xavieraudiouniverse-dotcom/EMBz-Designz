import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { MovingBanners } from "@/components/MovingBanners";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Heart, Zap, Truck, Sparkles, Cpu } from "lucide-react";

const CATEGORY_TILES = [
  { name: "Apparel", tag: "armor for the come-up", tall: true, from: "from-neon/20" },
  { name: "Home & Living", tag: "build your sanctuary", from: "from-rose/20" },
  { name: "Drinkware", tag: "fuel the grind", from: "from-lime/20" },
  { name: "Accessories", tag: "carry the story", from: "from-neon/20" },
];

const TICKER = ["STRUGGLE TO STRENGTH", "STREET ART", "MADE WITH LOVE", "RISE UP", "PRINTED ON DEMAND", "LIMITED RUNS", "WORLDWIDE"];

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["home-products"],
    queryFn: () => fetchProducts({ limit: 8, sort: "newest" }),
  });
  const products = data?.products || [];
  const hasProducts = products.length > 0;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden neon-night vignette">
        <div className="absolute inset-0 tech-grid opacity-70" />
        <div className="concrete-wall" />
        <div className="city-lights" />
        <MovingBanners />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-[36rem] rounded-full bg-neon/10 blur-[120px]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-[#0C0B09]/70 px-3.5 py-1.5 label-caps">
              <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" /> Street Art {"\u00b7"} Struggle {"\u00b7"} Strength
            </div>
            <h1 className="mt-8 font-display text-6xl sm:text-8xl lg:text-[10rem] leading-[0.82] tracking-wide text-foreground">
              FROM THE STRUGGLE,
              <span className="block mt-2">WE <span className="neon-text spray-underline">RISE</span>.</span>
            </h1>
            <p className="mt-8 mx-auto text-base sm:text-lg text-muted-foreground max-w-xl font-sans">
              A quiet rebellion in the rain. EMBZ Designs turns raw street-art energy
              into wearable stories {"\u2014"} every drop a testament of struggle become strength.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-md bg-neon text-[#0C0B09] hover:bg-neon/90 shadow-[0_0_22px_rgba(244,212,0,0.3)] font-mono uppercase tracking-widest" data-testid="primary-cta-button">
                <Link to="/shop">Enter the drop <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-md border-border bg-transparent hover:border-neon hover:text-neon font-mono uppercase tracking-widest">
                <Link to="/track">Track order</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Ticker */}
        <div className="relative border-y border-border bg-[#0C0B09]/80 overflow-hidden">
          <div className="flex gap-10 py-3 whitespace-nowrap" style={{ animation: "marquee 26s linear infinite" }}>
            {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="inline-flex items-center gap-3 font-mono uppercase tracking-[0.28em] text-[11px] text-muted-foreground">
                <span className="h-1 w-1 rounded-full bg-neon/70" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Sparkles, title: "Wearable stories", desc: "Street-art drops with meaning, printed on demand.", c: "text-neon" },
            { icon: Truck, title: "Cheapest & fastest", desc: "Best shipping picked for you at checkout.", c: "text-lime" },
            { icon: Heart, title: "Struggle to strength", desc: "Every piece packed with intention and love.", c: "text-rose" },
          ].map((f) => (
            <div key={f.title} className="relative rounded-xl border border-border bg-card p-5 overflow-hidden hover:border-neon/40 transition-colors">
              <f.icon className={`h-5 w-5 ${f.c}`} />
              <div className="mt-3 font-display text-xl tracking-wide">{f.title}</div>
              <p className="text-sm text-muted-foreground mt-1 font-sans">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader label="Browse" title="SHOP BY CATEGORY" className="mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORY_TILES.map((c) => (
            <Link
              key={c.name}
              to={`/shop?category=${encodeURIComponent(c.name)}`}
              className={`group relative overflow-hidden rounded-xl border border-border bg-card ${c.tall ? "row-span-2 min-h-[320px]" : "min-h-[152px]"}`}
              data-testid={`home-category-${c.name.toLowerCase().replace(/[^a-z]/g, '-')}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.from} to-transparent`} />
              <div className="absolute inset-0 tech-grid opacity-40" />
              <div className="relative h-full w-full p-5 flex flex-col justify-end">
                <div className="label-caps text-neon mb-1">{c.tag}</div>
                <div className="font-display text-3xl sm:text-4xl tracking-wide leading-none">{c.name}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-muted-foreground group-hover:text-neon transition-colors">
                  Enter <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader
          label="New"
          title="LATEST DROPS"
          className="mb-6"
          action={<Button asChild variant="ghost" className="hover:text-neon font-mono uppercase tracking-widest text-xs"><Link to="/shop">View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>}
        />
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-xl" />)}
          </div>
        ) : hasProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <h3 className="font-display text-2xl tracking-wide">THE DROP IS LOADING</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto font-sans">
              No pieces published yet. Head to the studio to import your designs.
            </p>
            <Button asChild className="mt-5 rounded-md bg-neon text-[#0C0B09] hover:bg-neon/90 shadow-[0_0_22px_rgba(244,212,0,0.3)] font-mono uppercase tracking-widest"><Link to="/admin">Open studio</Link></Button>
          </div>
        )}
      </section>

      {/* Struggle to strength story band */}
      <section className="relative mt-12 overflow-hidden border-y border-border vignette">
        <div className="absolute inset-0 neon-night" />
        <div className="absolute inset-0 tech-grid opacity-40" />
        <div className="concrete-wall" />
        <MovingBanners />
        <div className="city-lights" />
        <div className="absolute inset-0 noise" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose/12 blur-[110px]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="label-caps text-neon">The Story</div>
            <h2 className="mt-3 font-display text-4xl sm:text-6xl tracking-wide leading-[0.9]">
              FROM <span className="rose-text">STRUGGLE</span> TO <span className="neon-text">STRENGTH</span>
            </h2>
            <p className="mt-5 max-w-2xl mx-auto text-muted-foreground font-sans">
              Born on the block, painted on the wall, worn on the back. Every EMBZ
              drop carries the come-up {"\u2014"} turning late nights, closed doors and cold
              starts into color, confidence and love you can wear.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: "01", t: "THE STRUGGLE", d: "Where it starts \u2014 raw, unfiltered, real.", c: "text-rose" },
              { n: "02", t: "THE HUSTLE", d: "Spray, sketch, grind. Turning pain into art.", c: "text-lime" },
              { n: "03", t: "THE STRENGTH", d: "Rise up. Wear the story. Pass it on.", c: "text-neon" },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-border bg-[#0C0B09]/60 p-6">
                <div className={`font-display text-5xl tracking-wide ${s.c}`}>{s.n}</div>
                <div className="mt-2 font-display text-2xl tracking-wide">{s.t}</div>
                <p className="mt-1 text-sm text-muted-foreground font-sans">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <blockquote className="max-w-3xl mx-auto">
              <p className="font-display text-3xl sm:text-5xl tracking-wide leading-[0.9]">
                <span className="rose-text">SCARS</span> BECOME <span className="neon-text">STRIPES</span>. WEAR YOURS.
              </p>
              <div className="mt-5 label-caps">EMBZ Designs {"\u00b7"} street art, struggle &amp; strength</div>
            </blockquote>
            <Button asChild size="lg" className="mt-8 rounded-md bg-neon text-[#0C0B09] hover:bg-neon/90 shadow-[0_0_22px_rgba(244,212,0,0.3)] font-mono uppercase tracking-widest">
              <Link to="/shop">Wear the story <Heart className="ml-2 h-4 w-4" fill="currentColor" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
