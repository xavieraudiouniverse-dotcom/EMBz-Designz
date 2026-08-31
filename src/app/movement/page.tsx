import Link from "next/link";
import InteractiveGlobe, { type GlobePoint, type GlobeRoute } from "@/components/InteractiveGlobe";
import { CITY_LATLON } from "@/lib/geo";

export const metadata = {
  title: "The $9.1 Billion Movement — EMBZ DESIGNZ",
  description: "One world. Billions of connections. One legacy.",
};

const STATS = [
  { value: "9,100,000,000", label: "CONNECTIONS POSSIBLE" },
  { value: "195+", label: "COUNTRIES" },
  { value: "1.2M+", label: "SUPPORTERS" },
  { value: "50K+", label: "ARTISTS" },
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
    <div className="movement-hero">
      <p className="eyebrow">ONE WORLD. ONE LEGACY.</p>
      <h1>THE $9.1 BILLION MOVEMENT</h1>
      <p style={{ maxWidth: 560, margin: "16px auto 0", color: "#aaa0af", fontSize: 13, lineHeight: 1.7 }}>
        Every EMBZ piece connects a wearer to a story, a country to a community, and a purchase to a purpose. This
        is what that network looks like at scale.
      </p>

      <InteractiveGlobe points={HUBS} routes={ROUTES} />

      <div className="stats">
        {STATS.map((s) => (
          <div key={s.label}>
            <b>{s.value}</b>
            <small>{s.label}</small>
          </div>
        ))}
      </div>

      <Link href="/shop" className="btn" style={{ marginTop: 20 }}>
        BE PART OF THE MOVEMENT
      </Link>
    </div>
  );
}
