"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  GridIcon,
  PackageIcon,
  TagIcon,
  UsersIcon,
  ImageIcon,
  TrendingUpIcon,
  TruckIcon,
  DollarIcon,
  SettingsIcon,
  PencilIcon,
  LogOutIcon,
} from "@/components/Icons";

const LINKS = [
  { href: "/admin", label: "Dashboard", Icon: GridIcon },
  { href: "/admin/orders", label: "Orders", Icon: PackageIcon },
  { href: "/admin/products", label: "Products", Icon: TagIcon },
  { href: "/admin/users", label: "Customers", Icon: UsersIcon },
  { href: "/admin/design-vault", label: "Design Vault", Icon: ImageIcon },
  { href: "/admin/analytics", label: "Analytics", Icon: TrendingUpIcon },
  { href: "/admin/shipments", label: "Shipments", Icon: TruckIcon },
  { href: "/admin/financials", label: "Financials", Icon: DollarIcon },
  { href: "/admin/settings", label: "Settings", Icon: SettingsIcon },
  { href: "/admin/designer", label: "Designer", Icon: PencilIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // The admin login screen owns its own full-bleed hero — it doesn't get the
  // Command Centre sidebar chrome.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="grid gap-8 md:grid-cols-[220px_1fr]">
      <nav className="panel-metal h-fit space-y-1 rounded-xl p-3 md:sticky md:top-20">
        <div className="mb-3 px-2">
          <p className="font-display text-sm tracking-widest text-chrome-purple">EMBZ COMMAND</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Global operations</p>
        </div>
        {LINKS.map((l) => {
          const active = pathname === l.href || (l.href !== "/admin" && pathname?.startsWith(l.href));
          return (
            <Link key={l.href} href={l.href} className={`command-nav-link ${active ? "active" : ""}`}>
              <l.Icon className="h-4 w-4 shrink-0" />
              {l.label}
            </Link>
          );
        })}
        <button onClick={handleLogout} className="command-nav-link w-full text-left">
          <LogOutIcon className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </nav>
      <div>{children}</div>
    </div>
  );
}
