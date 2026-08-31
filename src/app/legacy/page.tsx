import Image from "next/image";
import MemorialPortrait from "@/components/MemorialPortrait";
import { UsersIcon, HeartIcon, SparkleIcon, SproutIcon } from "@/components/Icons";

export const metadata = {
  title: "The Legacy — EMBZ DESIGNZ",
  description: "Dedicated to the memory of Ella Mary Broughton & John Broughton.",
};

const PILLARS = [
  {
    Icon: UsersIcon,
    title: "Family",
    subtitle: "Our foundation",
    body: "Everything we do is for the family they left behind.",
  },
  {
    Icon: HeartIcon,
    title: "Love",
    subtitle: "Our strength",
    body: "Uniting people through art, culture, and purpose.",
  },
  {
    Icon: SparkleIcon,
    title: "Legacy",
    subtitle: "Our purpose",
    body: "Their memory lives on in every piece we create.",
  },
  {
    Icon: SproutIcon,
    title: "Future",
    subtitle: "Our promise",
    body: "Creating opportunities and a better future for the next generation.",
  },
];

export default function LegacyPage() {
  return (
    <div className="space-y-16">
      <section className="hero-stage hero-scan relative overflow-hidden rounded-2xl px-6 py-20 text-center">
        <div className="holo-grid" />
        <div className="holo-particles" />
        <div className="relative z-10">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-accent">The legacy of</p>
          <Image
            src="/legacy/john-and-ella-title.png"
            alt="John and Ella"
            width={1536}
            height={1024}
            priority
            className="mx-auto h-auto w-[92%] max-w-[820px] drop-shadow-[0_0_70px_rgba(155,92,240,0.55)] md:w-[85%]"
          />
          <p className="mt-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            A legacy of love. A future of hope.
          </p>
          <a href="#our-story" className="btn-primary-glow mt-8 inline-block">
            Our story
          </a>

          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2">
            <div>
              <MemorialPortrait src="/legacy/ella.jpg" name="Ella Mary Broughton" initial="E" />
              <h2 className="mt-5 font-display text-2xl">Ella Mary Broughton</h2>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                A beautiful soul whose love, strength and kindness will forever continue through her family.
              </p>
            </div>
            <div>
              <MemorialPortrait src="/legacy/john.jpg" name="John Broughton" initial="J" />
              <h2 className="mt-5 font-display text-2xl">John Broughton</h2>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                A man of strength, loyalty and love whose legacy lives on in generations to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="our-story" className="panel-metal edge-glow scroll-mt-24 rounded-2xl px-6 py-10 text-center">
        <h3 className="font-display text-lg uppercase tracking-[0.2em] text-accent">Their legacy. Our purpose.</h3>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          This store was created in loving memory of Ella Mary Broughton &amp; John Broughton. Every design, every
          order, every movement keeps their memory alive and supports the family they left behind.
        </p>
        <p className="mt-4 font-display text-sm uppercase tracking-[0.15em] text-primary">
          This is more than a store. This is a legacy.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="glow-hover rounded-xl border border-border bg-card p-5 text-center">
              <span className="feature-icon mx-auto">
                <p.Icon className="h-5 w-5" />
              </span>
              <h4 className="mt-3 font-display text-sm uppercase tracking-wide text-foreground">{p.title}</h4>
              <p className="text-[11px] uppercase tracking-wide text-accent">{p.subtitle}</p>
              <p className="mt-2 text-xs text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-metal edge-glow rounded-2xl px-6 py-10 text-center">
        <h3 className="font-display text-lg uppercase tracking-[0.2em] text-accent">The legacy fund</h3>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          A portion of all proceeds from this store are dedicated to supporting the family of Ella Mary Broughton
          &amp; John Broughton.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-xs text-muted-foreground/70">
          A full transparency report — the exact split and where funds go — is being finalized and will be published
          here.
        </p>
      </section>

      <p className="text-center font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
        Their love created a family. Their legacy creates a future.
      </p>
    </div>
  );
}
