import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { LayoutGrid, Package, Boxes, Store } from "lucide-react";

const NAV = [
  { to: "/admin", label: "Orders", icon: Package, exact: true },
  { to: "/admin/catalog", label: "Import from Merchize", icon: Boxes },
  { to: "/admin/products", label: "My Products", icon: LayoutGrid },
];

export const AdminLayout = ({ children }) => {
  const { pathname } = useLocation();
  const isActive = (item) => (item.exact ? pathname === item.to : pathname.startsWith(item.to));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandMark />
            <span className="hidden sm:inline label-caps">Studio</span>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Store className="h-4 w-4" /> View store
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex gap-1 mb-6 border-b border-border overflow-x-auto hide-scrollbar">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${isActive(item) ? "border-neon text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              data-testid={`admin-nav-${item.label.toLowerCase().replace(/[^a-z]/g, '-')}`}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
};
