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
    <div className="admin-page">
      <nav className="admin-side">
        <b>EMBZ COMMAND</b>
        {LINKS.map((l) => {
          const active = pathname === l.href || (l.href !== "/admin" && pathname?.startsWith(l.href));
          return (
            <Link key={l.href} href={l.href} className={active ? "active" : ""}>
              <l.Icon className="h-4 w-4 shrink-0" />
              {l.label.toUpperCase()}
            </Link>
          );
        })}
        <a onClick={handleLogout} role="button">
          <LogOutIcon className="h-4 w-4 shrink-0" />
          LOGOUT
        </a>
      </nav>
      <div className="admin-main">{children}</div>
    </div>
  );
}
