import { MailIcon, GlobeIcon, ClockIcon } from "@/components/Icons";

export const metadata = {
  title: "Contact — EMBZ DESIGNZ",
  description: "Get in touch with EMBZ DESIGNZ.",
};

const CHANNELS = [
  {
    Icon: MailIcon,
    label: "EMAIL",
    // Placeholder — swap for the real support inbox before launch.
    value: "support@embz-designz.store",
    href: "mailto:support@embz-designz.store",
  },
  {
    Icon: GlobeIcon,
    label: "SHIPPING WORLDWIDE",
    value: "195+ countries",
    href: "/shipping",
  },
  {
    Icon: ClockIcon,
    label: "SUPPORT HOURS",
    value: "24/7 — we're here",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="page" style={{ textAlign: "center" }}>
      <p className="eyebrow">REACH THE MOVEMENT</p>
      <h1 style={{ fontSize: 36, textShadow: "0 0 15px #7b20bd" }}>GET IN TOUCH</h1>
      <p style={{ maxWidth: 520, margin: "12px auto 0", color: "#d8c9e2", fontSize: 13 }}>
        Questions about an order, a collaboration, or the legacy fund — we read every message.
      </p>

      <div className="grid gap-4 sm:grid-cols-3" style={{ marginTop: 40 }}>
        {CHANNELS.map((c) => {
          const content = (
            <div className="panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, height: "100%" }}>
              <span className="feature-icon">
                <c.Icon className="h-5 w-5" />
              </span>
              <p className="smallcaps">{c.label}</p>
              <p style={{ fontSize: 13 }}>{c.value}</p>
            </div>
          );
          return c.href ? (
            <a key={c.label} href={c.href}>
              {content}
            </a>
          ) : (
            <div key={c.label}>{content}</div>
          );
        })}
      </div>

      <div className="panel" style={{ marginTop: 30, padding: 40 }}>
        <h2 className="eyebrow">ORDER SUPPORT</h2>
        <p style={{ maxWidth: 560, margin: "16px auto 0", color: "#aaa0af", lineHeight: 1.7, fontSize: 13 }}>
          For anything about an existing order — shipping status, sizing, a return — the fastest path is your{" "}
          <a href="/track" className="text-link">
            order tracking page
          </a>
          . For everything else, email us and we&apos;ll get back to you within one business day.
        </p>
      </div>
    </div>
  );
}
