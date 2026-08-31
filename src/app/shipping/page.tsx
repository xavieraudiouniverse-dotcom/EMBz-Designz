import InteractiveGlobe from "@/components/InteractiveGlobe";
import { PackageIcon, ShieldIcon, CompassIcon, ClockIcon } from "@/components/Icons";
import { CITY_LATLON } from "@/lib/geo";

export const metadata = {
  title: "Shipping — EMBZ DESIGNZ",
  description: "Worldwide shipping to 195+ countries.",
};

const TIERS = [
  { name: "STANDARD INTERNATIONAL", eta: "6-15 business days", price: "$14.99" },
  { name: "EXPRESS INTERNATIONAL", eta: "3-7 business days", price: "$24.99" },
  { name: "PRIORITY SHIPPING", eta: "2-4 business days", price: "$34.99" },
  { name: "ECONOMY SHIPPING", eta: "15-25 business days", price: "$9.99" },
];

const TRUST = [
  { Icon: PackageIcon, label: "TRACK EVERY ORDER", body: "REAL-TIME UPDATES" },
  { Icon: ShieldIcon, label: "SAFE & SECURE", body: "100% PROTECTED" },
  { Icon: CompassIcon, label: "CUSTOMS FRIENDLY", body: "FULLY COMPLIANT" },
  { Icon: ClockIcon, label: "SUPPORT 24/7", body: "WE'RE HERE" },
];

export default function ShippingPage() {
  return (
    <div className="page" style={{ textAlign: "center" }}>
      <p className="eyebrow">195+ COUNTRIES</p>
      <h1 style={{ fontSize: 44, textShadow: "0 0 15px #7b20bd" }}>WE SHIP WORLDWIDE</h1>

      <InteractiveGlobe
        points={[
          { ...CITY_LATLON.sydney, label: "Sydney", tone: "cyan" },
          { ...CITY_LATLON["new york"], label: "New York", tone: "purple" },
          { ...CITY_LATLON.london, label: "London", tone: "cyan" },
          { ...CITY_LATLON.tokyo, label: "Tokyo", tone: "purple" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2" style={{ marginTop: 40, textAlign: "left" }}>
        {TIERS.map((t) => (
          <div key={t.name} className="panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600 }}>{t.name}</p>
              <p className="smallcaps" style={{ marginTop: 4 }}>
                {t.eta}
              </p>
            </div>
            <p style={{ fontSize: 18, color: "#d66eff" }}>{t.price}</p>
          </div>
        ))}
      </div>

      <div className="feature-strip" style={{ marginTop: 50 }}>
        {TRUST.map((t) => (
          <div key={t.label}>
            <div className="feature-icon">
              <t.Icon className="h-4 w-4" />
            </div>
            <b>{t.label}</b>
            <small>{t.body}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
