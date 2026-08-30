import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/designer", label: "Designer" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-8 md:grid-cols-[180px_1fr]">
      <nav className="space-y-1">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div>{children}</div>
    </div>
  );
}
