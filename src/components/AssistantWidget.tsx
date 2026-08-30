"use client";

import { useState } from "react";
import Link from "next/link";
import type { ChatMessage } from "@/lib/gemini";

const QUICK_ACTIONS = [
  { label: "Track my order", href: "/account" },
  { label: "View cart", href: "/cart" },
  { label: "Shop", href: "/shop" },
];

// Turns any "/account/orders/..." style path in the assistant's reply into a clickable link.
function renderWithLinks(text: string) {
  const parts = text.split(/(\/[a-zA-Z0-9/_-]+)/g);
  return parts.map((part, i) =>
    part.startsWith("/") && part.length > 1 ? (
      <Link key={i} href={part} className="text-accent underline underline-offset-2">
        {part}
      </Link>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hey! I can help you find products, check an order's status, or find your way around. What do you need?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text } as ChatMessage];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setMessages((m) => [...m, { role: "assistant", content: json.reply }]);
    } catch (err: any) {
      setError(err?.message ?? "The assistant is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="panel-metal edge-glow mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-chrome-purple">EMBZ Assistant</p>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {m.role === "assistant" ? renderWithLinks(m.content) : m.content}
              </div>
            ))}
            {loading && <div className="text-xs text-muted-foreground">Thinking…</div>}
            {error && <div className="text-xs text-destructive">{error}</div>}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border px-4 py-2">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-accent hover:text-accent"
              >
                {a.label}
              </Link>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about an order, product, or page…"
              className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              disabled={loading}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="sweep glow-hover flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow animate-pulse-glow"
        aria-label="Open assistant"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
