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
    <div className="command-centre" style={{ gridTemplateColumns: "1fr", placeItems: "center" }}>
      <div className="cc-card" style={{ width: "min(420px, 92vw)", padding: 30, margin: "60px 0" }}>
        <div className="cc-brand" style={{ textAlign: "center", padding: "0 0 22px" }}>
          <span>EMBZ NEXUS</span>
          <small>COMMAND CENTRE</small>
        </div>

        <div className="ai-command" style={{ marginBottom: 22 }}>
          <div className="ai-core">✦</div>
          <div className="ai-copy">
            <b>IDENTITY VERIFICATION</b>
            <small>AUTHORISED OPERATORS ONLY</small>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <div>
            <small style={{ fontSize: 7, letterSpacing: 2, color: "#75677f" }}>EMAIL</small>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                marginTop: 6,
                background: "#07040b",
                border: "1px solid #291735",
                color: "#fff",
                borderRadius: 6,
                padding: 11,
                outline: "none",
                fontSize: 11,
              }}
            />
          </div>
          <div>
            <small style={{ fontSize: 7, letterSpacing: 2, color: "#75677f" }}>PASSWORD</small>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                marginTop: 6,
                background: "#07040b",
                border: "1px solid #291735",
                color: "#fff",
                borderRadius: 6,
                padding: 11,
                outline: "none",
                fontSize: 11,
              }}
            />
          </div>

          {error && <p style={{ color: "#ff6b9c", fontSize: 10 }}>{error}</p>}

          <button
            disabled={loading}
            style={{
              border: 0,
              borderRadius: 6,
              background: "linear-gradient(135deg,#7b25c5,#b24fff)",
              color: "#fff",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: 1,
              padding: "13px 15px",
              cursor: "pointer",
              marginTop: 4,
            }}
          >
            {loading ? "VERIFYING…" : "ACCESS COMMAND CENTRE"}
          </button>
        </form>

        <div className="cc-bottom" style={{ marginTop: 24 }}>
          <span>
            <i />
            SECURE · ENCRYPTED · PROTECTED
          </span>
        </div>
      </div>
    </div>
  );
}
