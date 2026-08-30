"use client";

import { useState, useTransition } from "react";
import { importFromMerchize, importFromMerchizeBulk } from "./actions";

export default function MerchizeImportForm() {
  const [bulk, setBulk] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Import from Merchize</h3>
        <button type="button" onClick={() => setBulk((v) => !v)} className="text-xs text-accent hover:underline">
          {bulk ? "Switch to single import" : "Switch to bulk import"}
        </button>
      </div>

      {bulk ? (
        <form
          action={(formData) => {
            setMessage(null);
            startTransition(async () => {
              const result = await importFromMerchizeBulk(formData);
              setMessage(
                `${result.imported} imported${result.failed.length ? `, ${result.failed.length} failed: ${result.failed
                  .map((f) => `${f.id} (${f.error})`)
                  .join("; ")}` : ""}`,
              );
            });
          }}
          className="space-y-2"
        >
          <textarea
            name="merchize_product_ids"
            required
            rows={4}
            placeholder={"One Merchize product ID or SKU per line\ne.g.\nMZ-10234\nMZ-10235"}
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
          />
          <button disabled={pending} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            {pending ? "Importing..." : "Import all"}
          </button>
        </form>
      ) : (
        <form
          action={(formData) => {
            setMessage(null);
            startTransition(async () => {
              const result = await importFromMerchize(formData);
              setMessage(result?.error ? `Error: ${result.error}` : "Imported ✓");
            });
          }}
          className="flex flex-wrap items-center gap-3"
        >
          <input
            name="merchize_product_id"
            placeholder="Merchize product ID or SKU"
            required
            className="rounded border border-border bg-background px-3 py-2 text-sm"
          />
          <button disabled={pending} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            {pending ? "Importing..." : "Import"}
          </button>
        </form>
      )}

      {message && <p className="mt-2 text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
