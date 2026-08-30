"use client";

import { useRef, useState, useTransition } from "react";
import { importProductsCsv } from "./actions";

const TEMPLATE = `name,price,stock,description,image_url,category,is_featured,is_active
Chrome Crown Tee,45.00,40,Heavyweight cotton tee,https://example.com/tee.jpg,Tees,true,true
Skyline Drip Hoodie,110.00,25,Oversized fleece hoodie,,Hoodies,false,true`;

export default function BulkCsvImportForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ imported: number; failed: Array<{ row: number; error: string }> } | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Bulk import from CSV</h3>
        <button type="button" onClick={() => setShowTemplate((v) => !v)} className="text-xs text-accent hover:underline">
          {showTemplate ? "Hide" : "Show"} expected format
        </button>
      </div>

      {showTemplate && (
        <pre className="mb-3 overflow-x-auto rounded bg-background p-3 text-[11px] text-muted-foreground">
          {TEMPLATE}
        </pre>
      )}

      <form
        ref={formRef}
        action={(formData) => {
          setResult(null);
          startTransition(async () => {
            const res = await importProductsCsv(formData);
            setResult(res);
            formRef.current?.reset();
          });
        }}
        className="flex flex-wrap items-center gap-3"
      >
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
        />
        <button disabled={pending} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
          {pending ? "Importing..." : "Import CSV"}
        </button>
      </form>

      {result && (
        <div className="mt-3 text-sm">
          <p className="text-accent">{result.imported} product{result.imported === 1 ? "" : "s"} imported.</p>
          {result.failed.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-xs text-destructive">
              {result.failed.map((f, i) => (
                <li key={i}>Row {f.row}: {f.error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        Matches rows to existing products by name — re-uploading the same file updates instead of duplicating.
        `category` should match an existing category's name or slug (Tees, Hoodies, Headwear, Accessories).
      </p>
    </div>
  );
}
