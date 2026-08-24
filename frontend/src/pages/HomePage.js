import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchProducts, fetchCategories } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowRight, Sparkles, Truck, Package } from "lucide-react";

const HERO_IMG =
  "https://images.pexels.com/photos/20620137/pexels-photo-20620137.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const LOOKBOOK_IMG =
  "https://images.unsplash.com/photo-1559279824-ff1f92a191b9?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85";

const CATEGORY_TILES = [
  { name: "Apparel", tall: true },
  { name: "Home & Living" },
  { name: "Drinkware" },
  { name: "Accessories" },
];

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["home-products"],
    queryFn: () => fetchProducts({ limit: 8, sort: "newest" }),
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const products = data?.products || [];
  const hasProducts = products.length > 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative paper-warm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="label-caps mb-4 inline-flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-mustard" /> Made on demand
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.05]">
                Wear the art of
                <span className="block text-mustard">Existeance.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-md">
                Premium custom apparel and print-on-demand pieces, crafted by
                EMBZ Designs and shipped worldwide. Every order made just for you.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-xl" data-testid="primary-cta-button">
                  <Link to="/shop">Shop the collection <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="rounded-xl border border-border">
                  <Link to="/track">Track an order</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative"
            >
              <div className="overflow-hidden rounded-3xl border border-border noise relative">
                <AspectRatio ratio={4 / 5}>
                  <img src={HERO_IMG} alt="EMBZ editorial" className="h-full w-full object-cover" />
                </AspectRatio>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Package, title: "Made just for you", desc: "Each piece printed on demand, never mass produced." },
            { icon: Truck, title: "Worldwide shipping", desc: "Cheapest & fastest options at checkout." },
            { icon: Sparkles, title: "Premium quality", desc: "Curated blanks and durable, vivid printing." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
              <f.icon className="h-5 w-5 text-mustard" />
              <div className="mt-3 font-serif text-lg">{f.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories bento */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <SectionHeader label="Browse" title="Shop by category" className="mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORY_TILES.map((c) => (
            <Link
              key={c.name}
              to={`/shop?category=${encodeURIComponent(c.name)}`}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-secondary ${c.tall ? "row-span-2" : ""}`}
              data-testid={`home-category-${c.name.toLowerCase().replace(/[^a-z]/g, '-')}`}
            >
              <AspectRatio ratio={c.tall ? 3 / 4 : 4 / 3}>
                <img src={LOOKBOOK_IMG} alt={c.name} className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105" />
              </AspectRatio>
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <div className="font-serif text-xl text-white">{c.name}</div>
                <div className="text-xs text-white/80 inline-flex items-center gap-1">Shop now <ArrowRight className="h-3 w-3" /></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <SectionHeader
          label="New"
          title="Latest drops"
          className="mb-6"
          action={<Button asChild variant="ghost"><Link to="/shop">View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>}
        />
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : hasProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <h3 className="font-serif text-xl">The collection is coming soon</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              No products have been published yet. Head to the studio to import
              your designs from the Merchize catalog.
            </p>
            <Button asChild className="mt-5 rounded-xl"><Link to="/admin">Open studio</Link></Button>
          </div>
        )}
      </section>

      {/* Editorial band */}
      <section className="relative mt-12">
        <div className="relative overflow-hidden">
          <img src={LOOKBOOK_IMG} alt="lookbook" className="h-[42vh] w-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <blockquote className="max-w-xl">
                <p className="font-serif text-2xl sm:text-3xl text-white leading-snug">
                  “Design is the silent ambassador of your brand.”
                </p>
                <div className="mt-4 label-caps text-white/80">EMBZ Designs · Existeance</div>
              </blockquote>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
