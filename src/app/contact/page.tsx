import { MailIcon, GlobeIcon, ClockIcon } from "@/components/Icons";

export const metadata = {
  title: "Contact — EMBZ DESIGNZ",
  description: "Get in touch with EMBZ DESIGNZ.",
};

const CHANNELS = [
  {
    Icon: MailIcon,
    label: "Email",
    // Placeholder — swap for the real support inbox before launch.
    value: "support@embz-designz.store",
    href: "mailto:support@embz-designz.store",
  },
  {
    Icon: GlobeIcon,
    label: "Shipping worldwide",
    value: "195+ countries",
    href: "/shipping",
  },
  {
    Icon: ClockIcon,
    label: "Support hours",
    value: "24/7 — we're here",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="space-y-14">
      <div className="text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.35em] text-accent">Reach the movement</p>
        <h1 className="shimmer-text font-display text-4xl md:text-5xl">Get in touch</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Questions about an order, a collaboration, or the legacy fund — we read every message.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {CHANNELS.map((c) => {
          const content = (
            <div className="flex h-full flex-col items-center gap-2 rounded-xl border border-border bg-card p-6 text-center">
              <span className="feature-icon">
                <c.Icon className="h-5 w-5" />
              </span>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
              <p className="text-sm font-medium">{c.value}</p>
            </div>
          );
          return c.href ? (
            <a key={c.label} href={c.href} className="glow-hover rounded-xl">
              {content}
            </a>
          ) : (
            <div key={c.label}>{content}</div>
          );
        })}
      </div>

      <div className="panel-metal edge-glow rounded-2xl px-6 py-10 text-center">
        <h2 className="font-display text-lg uppercase tracking-[0.2em] text-accent">Order support</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          For anything about an existing order — shipping status, sizing, a return — the fastest path is your{" "}
          <a href="/track" className="text-accent hover:underline">
            order tracking page
          </a>
          . For everything else, email us and we'll get back to you within one business day.
        </p>
      </div>
    </div>
  );
}
