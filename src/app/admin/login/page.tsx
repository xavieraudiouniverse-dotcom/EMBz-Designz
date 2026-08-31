"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="hero-stage hero-scan relative -mx-4 flex min-h-[80vh] flex-col items-center justify-center overflow-hidden rounded-2xl px-6 py-16 text-center">
      <div className="holo-grid" />
      <div className="holo-particles" />

      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="holo-ring-wrap mb-8 h-40 w-40">
          <span className="holo-ring r1" />
          <span className="holo-ring r2" />
          <span className="holo-ring r3" />
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/60 font-display text-xl text-chrome-purple">
            E
          </span>
        </div>

        <p className="text-xs uppercase tracking-[0.35em] text-accent">Identity verification required</p>
        <h1 className="shimmer-text mt-3 font-display text-3xl md:text-4xl">EMBZ Command Access</h1>

        <form onSubmit={handleSubmit} className="mt-10 w-full max-w-sm space-y-4 text-left">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-primary/30 bg-card/80 px-3 py-2.5 text-sm backdrop-blur focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-muted-foreground">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-primary/30 bg-card/80 px-3 py-2.5 text-sm backdrop-blur focus:border-accent focus:outline-none"
            />
          </div>
          {error && <p className="text-center text-sm text-destructive">{error}</p>}
          <button disabled={loading} className="btn-primary-glow w-full">
            {loading ? "Verifying…" : "Access command centre"}
          </button>
        </form>

        <p className="mt-8 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Secure · Encrypted · Protected
        </p>
      </div>
    </div>
  );
}
