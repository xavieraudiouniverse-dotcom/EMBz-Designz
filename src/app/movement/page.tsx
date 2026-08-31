import Link from "next/link";
import InteractiveGlobe, { type GlobePoint, type GlobeRoute } from "@/components/InteractiveGlobe";
import { CITY_LATLON } from "@/lib/geo";

export const metadata = {
  title: "The $9.1 Billion Movement — EMBZ DESIGNZ",
  description: "One world. Billions of connections. One legacy.",
};

const STATS = [
  { value: "9,100,000,000", label: "Connections possible" },
  { value: "195+", label: "Countries" },
  { value: "1.2M+", label: "Supporters" },
  { value: "50K+", label: "Artists" },
];

// A loose ring of hub cities standing in for the global network — abstract,
// not a literal claim about where every order has shipped.
const HUBS: GlobePoint[] = [
  { ...CITY_LATLON.sydney, label: "Sydney", tone: "cyan" },
  { ...CITY_LATLON["new york"], label: "New York", tone: "purple" },
  { ...CITY_LATLON.london, label: "London", tone: "cyan" },
  { ...CITY_LATLON.tokyo, label: "Tokyo", tone: "purple" },
  { ...CITY_LATLON.singapore, label: "Singapore", tone: "cyan" },
  { ...CITY_LATLON["são paulo"], label: "São Paulo", tone: "purple" },
  { ...CITY_LATLON.lagos, label: "Lagos", tone: "cyan" },
];

const ROUTES: GlobeRoute[] = [
  { from: HUBS[0], to: HUBS[1], tone: "purple" },
  { from: HUBS[0], to: HUBS[2], tone: "cyan" },
  { from: HUBS[0], to: HUBS[3], tone: "purple" },
  { from: HUBS[1], to: HUBS[2], tone: "cyan" },
  { from: HUBS[2], to: HUBS[6], tone: "purple" },
  { from: HUBS[3], to: HUBS[4], tone: "cyan" },
  { from: HUBS[1], to: HUBS[5], tone: "purple" },
];

export default function MovementPage() {
  return (
    <div className="space-y-14">
      <div className="text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.35em] text-accent">One world. One legacy.</p>
        <h1 className="shimmer-text font-display text-4xl leading-tight md:text-6xl">The $9.1 billion movement</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Every EMBZ piece connects a wearer to a story, a country to a community, and a purchase to a purpose. This
          is what that network looks like at scale.
        </p>
      </div>

      <div className="panel-metal edge-glow relative overflow-hidden rounded-2xl p-4">
        <div className="aspect-[2/1] w-full">
          <InteractiveGlobe points={HUBS} routes={ROUTES} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="font-display text-2xl text-chrome-purple md:text-3xl">{s.value}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link href="/shop" className="btn-primary-glow">
          Be part of the movement
        </Link>
      </div>
    </div>
  );
}
