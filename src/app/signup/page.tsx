"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) return setError(error.message);
    if (data.session) {
      router.push("/account");
      router.refresh();
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="auth">
        <div className="auth-box">
          <p className="eyebrow">ALMOST THERE</p>
          <h1 style={{ fontSize: 24, marginTop: 8 }}>CHECK YOUR EMAIL</h1>
          <p className="smallcaps" style={{ marginTop: 16 }}>
            We sent a confirmation link to {email}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="auth-box">
        <p className="eyebrow">JOIN THE MOVEMENT</p>
        <h1 style={{ fontSize: 26, marginTop: 8 }}>CREATE ACCOUNT</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" required placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: "#ff6b9c", fontSize: 12 }}>{error}</p>}
          <button disabled={loading} className="btn full">
            {loading ? "CREATING…" : "CREATE ACCOUNT"}
          </button>
        </form>
        <p className="smallcaps">
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#c65cff" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
