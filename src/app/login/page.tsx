"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
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
    router.push(params.get("next") || "/account");
    router.refresh();
  }

  return (
    <div className="auth">
      <div className="auth-box">
        <p className="eyebrow">WELCOME BACK</p>
        <h1 style={{ fontSize: 26, marginTop: 8 }}>SIGN IN</h1>
        <form onSubmit={handleSubmit}>
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: "#ff6b9c", fontSize: 12 }}>{error}</p>}
          <button disabled={loading} className="btn full">
            {loading ? "SIGNING IN…" : "SIGN IN"}
          </button>
        </form>
        <p className="smallcaps">
          No account?{" "}
          <Link href="/signup" style={{ color: "#c65cff" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
