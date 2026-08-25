import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Search, Menu, X } from "lucide-react";

export const Header = () => {
  const { count, setIsOpen } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?query=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  const navLinks = [
    { to: "/shop", label: "Shop" },
    { to: "/shop?category=Apparel", label: "Apparel" },
    { to: "/track", label: "Track" },
    { to: "/admin", label: "Studio" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[#0C0B09]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button className="md:hidden p-2 -ml-2" onClick={() => setMobileOpen((v) => !v)} data-testid="mobile-menu-button">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <BrandMark />
          </div>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <Link key={l.label} to={l.to} className="relative text-sm font-mono uppercase tracking-widest text-foreground/70 hover:text-neon transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-neon after:transition-all hover:after:w-full" data-testid={`nav-${l.label.toLowerCase().replace(/\s/g, '-')}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <form onSubmit={submitSearch} className="hidden sm:flex items-center relative">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search drops"
                className="h-9 w-40 lg:w-56 pl-9 rounded-full bg-card border-border font-mono text-xs"
                data-testid="header-search-input"
              />
            </form>
            <Button variant="ghost" size="icon" className="relative hover:text-neon" onClick={() => setIsOpen(true)} data-testid="cart-open-button">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-neon text-[11px] font-semibold text-[#0C0B09]" data-testid="cart-count-badge">
                  {count}
                </span>
              )}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <form onSubmit={submitSearch} className="flex items-center relative">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search drops" className="h-10 pl-9 rounded-full bg-card font-mono text-xs" data-testid="header-search-input-mobile" />
            </form>
            <div className="flex flex-col">
              {navLinks.map((l) => (
                <Link key={l.label} to={l.to} onClick={() => setMobileOpen(false)} className="py-2 text-sm font-mono uppercase tracking-widest border-b border-border/60">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
