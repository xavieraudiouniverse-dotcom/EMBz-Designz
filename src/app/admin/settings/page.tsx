"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STORE_INFO = [
  { label: "Base currency", value: "AUD" },
  { label: "GST rate", value: "10%" },
  { label: "Displayed currencies", value: "AUD, NZD" },
  { label: "Fulfillment partner", value: "Merchize" },
];

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, [supabase]);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (password.length < 8) {
      setMessage({ text: "Password must be at least 8 characters.", error: true });
      return;
    }
    if (password !== confirm) {
      setMessage({ text: "Passwords don't match.", error: true });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      setMessage({ text: error.message, error: true });
      return;
    }
    setPassword("");
    setConfirm("");
    setMessage({ text: "Password updated." });
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-accent">Command centre</p>
        <h1 className="font-display text-2xl tracking-wide">Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="panel-metal rounded-xl p-6">
          <h2 className="text-sm text-muted-foreground">Admin account</h2>
          <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Signed in as</p>
          <p className="mt-1 text-sm">{email ?? "…"}</p>

          <form onSubmit={handlePasswordChange} className="mt-6 space-y-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Change password</p>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
            {message && (
              <p className={`text-xs ${message.error ? "text-destructive" : "text-emerald-400"}`}>{message.text}</p>
            )}
            <button disabled={saving} className="btn-outline-glow w-full !py-2 !text-xs">
              {saving ? "Saving…" : "Update password"}
            </button>
          </form>
        </div>

        <div className="panel-metal rounded-xl p-6">
          <h2 className="text-sm text-muted-foreground">Store configuration</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Fixed at the code/environment level — ask for these to be changed in a deploy rather than here.
          </p>
          <dl className="mt-4 space-y-3">
            {STORE_INFO.map((s) => (
              <div key={s.label} className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0">
                <dt className="text-muted-foreground">{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
