"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart";
import CurrencySwitcher from "@/components/CurrencySwitcher";

export default function Header() {
  const { count } = useCart();
  const [email, setEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  return (
    <>
      <header className="hero-banner">
        <div>
          DEDICATED TO THE LEGACY OF
          <br />
          <b>ELLA MARY BROUGHTON</b> &amp; <b>JOHN BROUGHTON</b>
          <small>ANY PROCEEDS SUPPORT THEIR FAMILY</small>
        </div>
        <strong>
          EMBZ-DESIGNZ
          <small>STREET ART WITHOUT BORDERS</small>
        </strong>
        <div>
          <b>THE $9.1 BILLION MOVEMENT</b>
          <small>
            ONE WORLD. BILLIONS OF CONNECTIONS.
            <br />
            ONE LEGACY.
          </small>
        </div>
      </header>

      <nav className="nav">
        <Link href="/" className="brand">
          EMBZ<span>✦</span>
        </Link>

        <div className={`links ${menuOpen ? "open" : ""}`}>
          <Link href="/shop" onClick={() => setMenuOpen(false)}>
            SHOP
          </Link>
          <Link href="/shop#collections" onClick={() => setMenuOpen(false)}>
            COLLECTIONS
          </Link>
          <Link href="/legacy" onClick={() => setMenuOpen(false)}>
            LEGACY
          </Link>
          <Link href="/movement" onClick={() => setMenuOpen(false)}>
            THE MOVEMENT
          </Link>
          <Link href="/track" onClick={() => setMenuOpen(false)}>
            TRACK ORDER
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            CONTACT
          </Link>
        </div>

        <div className="nav-actions">
          <CurrencySwitcher />
          <Link href="/shop" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
          </Link>
          <Link href="/account" aria-label={email ? "My account" : "Sign in"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="3" />
              <path d="M5 20c1-3.4 3.3-5 7-5s6 1.6 7 5" />
            </svg>
          </Link>
          <Link href="/cart" className="bag" aria-label="Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 8h14l-1 12H6L5 8Z" />
              <path d="M9 8a3 3 0 0 1 6 0" />
            </svg>
            {count > 0 && <b>{count}</b>}
          </Link>
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </nav>
    </>
  );
}
