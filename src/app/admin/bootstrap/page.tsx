"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GoogleAuthButton from "@/components/GoogleAuthButton";

export default function AdminBootstrapPage() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setChecked(true);
    });
  }, [supabase]);

  async function claim() {
    setStatus("working");
    const res = await fetch("/api/admin/bootstrap", { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setStatus("done");
      setMessage(`${json.email} is now an admin.`);
    } else {
      setStatus("error");
      setMessage(json.error ?? "Could not complete setup.");
    }
  }

  return (
    <div className="command-centre" style={{ gridTemplateColumns: "1fr", placeItems: "center" }}>
      <div className="cc-card" style={{ width: "min(460px, 92vw)", padding: 30, margin: "60px 0" }}>
        <div className="cc-brand" style={{ textAlign: "center", padding: "0 0 20px" }}>
          <span>EMBZ NEXUS</span>
          <small>FIRST-RUN SETUP</small>
        </div>

        {!checked && <p className="smallcaps">Checking…</p>}

        {checked && !email && (
          <>
            <p style={{ fontSize: 11, color: "#a294ab", lineHeight: 1.7 }}>
              Sign in first — with Google, or the email and password you registered — then come back here to claim
              admin access.
            </p>
            <div style={{ marginTop: 18 }}>
              <GoogleAuthButton next="/admin/bootstrap" label="CONTINUE WITH GOOGLE" />
            </div>
            <p className="smallcaps" style={{ marginTop: 16 }}>
              <Link href="/login?next=/admin/bootstrap" style={{ color: "#c65cff" }}>
                Sign in with email instead
              </Link>
            </p>
          </>
        )}

        {checked && email && status !== "done" && (
          <>
            <p style={{ fontSize: 11, color: "#a294ab", lineHeight: 1.7 }}>
              Signed in as <b style={{ color: "#d991ff" }}>{email}</b>.
            </p>
            <p style={{ fontSize: 10, color: "#76687e", lineHeight: 1.7, marginTop: 10 }}>
              This grants admin to this account. It only works while the store has no admin yet, and closes itself
              permanently afterwards.
            </p>
            {status === "error" && <p style={{ color: "#ff6b9c", fontSize: 11, marginTop: 12 }}>{message}</p>}
            <button
              onClick={claim}
              disabled={status === "working"}
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
                marginTop: 18,
                width: "100%",
              }}
            >
              {status === "working" ? "GRANTING…" : "CLAIM ADMIN ACCESS"}
            </button>
          </>
        )}

        {status === "done" && (
          <>
            <div className="signal good" style={{ marginTop: 8 }}>
              <b>ADMIN GRANTED</b>
              <small>{message}</small>
              <span>✓</span>
            </div>
            <Link
              href="/admin"
              style={{
                display: "block",
                textAlign: "center",
                border: 0,
                borderRadius: 6,
                background: "linear-gradient(135deg,#7b25c5,#b24fff)",
                color: "#fff",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: 1,
                padding: "13px 15px",
                marginTop: 16,
              }}
            >
              OPEN COMMAND CENTRE
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
