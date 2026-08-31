"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// NEXUS command centre navigation. Icons and labels follow the NEXUS package;
// each one is a real route in this app rather than a section of a single page,
// so the data behind every screen stays server-rendered from Supabase.
const LINKS = [
  { href: "/admin", label: "OVERVIEW", icon: "⌂" },
  { href: "/admin/orders", label: "ORDERS & LOGISTICS", icon: "▣" },
  { href: "/admin/shipments", label: "SHIPMENTS", icon: "◇" },
  { href: "/admin/products", label: "PRODUCTS", icon: "◈" },
  { href: "/admin/users", label: "CUSTOMERS", icon: "◉" },
  { href: "/admin/analytics", label: "ANALYTICS", icon: "◌" },
  { href: "/admin/markets", label: "MARKET INTELLIGENCE", icon: "◈" },
  { href: "/admin/financials", label: "REPORTS", icon: "▥" },
  { href: "/admin/design-vault", label: "DESIGN VAULT", icon: "▤" },
  { href: "/admin/designer", label: "DESIGNER", icon: "✦" },
  { href: "/admin/integrations", label: "INTEGRATIONS", icon: "⌘" },
  { href: "/admin/settings", label: "SETTINGS", icon: "⚙" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // The admin login screen owns its own full-bleed hero — no command centre chrome.
  if (pathname === "/admin/login" || pathname === "/admin/bootstrap") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="command-centre">
      <aside className="cc-sidebar">
        <div className="cc-brand">
          <span>EMBZ NEXUS</span>
          <small>COMMAND CENTRE</small>
        </div>

        <Link href="/admin/designer" className="nexus-button">
          <b>✦</b>
          NEXUS DESIGNER
        </Link>

        <nav>
          {LINKS.map((l) => {
            const active = pathname === l.href || (l.href !== "/admin" && pathname?.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} className={active ? "active" : ""}>
                <i>{l.icon}</i>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="cc-bottom">
          <span>
            <i />
            SYSTEMS NOMINAL
          </span>
          <a onClick={handleLogout} role="button">
            SIGN OUT
          </a>
        </div>
      </aside>

      <div className="cc-main">{children}</div>
    </div>
  );
}
