"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import Logo from "@/components/Logo";

export default function Header() {
  const { count } = useCart();
  const [email, setEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/shop" className="hover:text-foreground">
            Shop
          </Link>
          <Link href="/legacy" className="hover:text-foreground">
            Legacy
          </Link>
          <Link href="/account" className="hover:text-foreground">
            {email ? "My Account" : "Sign in"}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <CurrencySwitcher />
          <Link
            href="/cart"
            className="edge-glow relative rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary"
          >
            Cart
            {count > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
