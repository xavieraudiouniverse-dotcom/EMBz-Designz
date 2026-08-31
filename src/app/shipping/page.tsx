import InteractiveGlobe from "@/components/InteractiveGlobe";
import { PackageIcon, ShieldIcon, CompassIcon, ClockIcon } from "@/components/Icons";
import { CITY_LATLON } from "@/lib/geo";

export const metadata = {
  title: "Shipping — EMBZ DESIGNZ",
  description: "Worldwide shipping to 195+ countries.",
};

const TIERS = [
  { name: "Standard international", eta: "7-12 business days", price: "$9.99" },
  { name: "Express international", eta: "3-5 business days", price: "$19.99" },
  { name: "Priority shipping", eta: "2-3 business days", price: "$29.99" },
  { name: "Economy shipping", eta: "12-25 business days", price: "$6.99" },
  { name: "Local delivery", eta: "Available in select cities", price: "From $4.99" },
];

const TRUST = [
  { Icon: PackageIcon, label: "Track every order", body: "Real-time updates" },
  { Icon: ShieldIcon, label: "Safe & secure", body: "100% protected" },
  { Icon: CompassIcon, label: "Customs friendly", body: "Fully compliant" },
  { Icon: ClockIcon, label: "Support 24/7", body: "We're here" },
];

export default function ShippingPage() {
  return (
    <div className="space-y-14">
      <div className="text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.35em] text-accent">195+ countries</p>
        <h1 className="shimmer-text font-display text-4xl md:text-5xl">We ship worldwide</h1>
      </div>

      <div className="panel-metal edge-glow relative overflow-hidden rounded-2xl p-4">
        <div className="aspect-[2/1] w-full">
          <InteractiveGlobe
            points={[
              { ...CITY_LATLON.sydney, label: "Sydney", tone: "cyan" },
              { ...CITY_LATLON["new york"], label: "New York", tone: "purple" },
              { ...CITY_LATLON.london, label: "London", tone: "cyan" },
              { ...CITY_LATLON.tokyo, label: "Tokyo", tone: "purple" },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TIERS.map((t) => (
          <div key={t.name} className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
            <div>
              <p className="text-sm font-medium">{t.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.eta}</p>
            </div>
            <p className="font-display text-lg text-accent">{t.price}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {TRUST.map((t) => (
          <div key={t.label} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center">
            <span className="feature-icon">
              <t.Icon className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium">{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
