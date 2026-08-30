"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProductTemplate } from "@/types/database";

export default function TemplateManager({
  templates,
  onChange,
}: {
  templates: ProductTemplate[];
  onChange: () => void;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [garmentType, setGarmentType] = useState("tee");
  const [file, setFile] = useState<File | null>(null);
  const [printArea, setPrintArea] = useState({ x: 25, y: 20, width: 50, height: 45 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !name) return;
    setBusy(true);
    setError(null);
    try {
      const path = `templates/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage.from("designs").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: pub } = supabase.storage.from("designs").getPublicUrl(path);

      const { error: insertError } = await supabase.from("product_templates").insert({
        name,
        garment_type: garmentType,
        blank_image_url: pub.publicUrl,
        print_area: printArea,
      });
      if (insertError) throw insertError;

      setName("");
      setFile(null);
      onChange();
    } catch (err: any) {
      setError(err?.message ?? "Could not add template.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteTemplate(id: string) {
    await supabase.from("product_templates").delete().eq("id", id);
    onChange();
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <button onClick={() => setOpen((v) => !v)} className="text-sm font-medium">
        {open ? "▾" : "▸"} Manage blank garment templates ({templates.length})
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          <div className="space-y-1">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm">
                <span>
                  {t.name} <span className="text-muted-foreground">({t.garment_type})</span>
                </span>
                <button onClick={() => deleteTemplate(t.id)} className="text-xs text-destructive">
                  Delete
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={addTemplate} className="grid gap-2 border-t border-border pt-4 md:grid-cols-2">
            <input
              placeholder="Template name (e.g. Blank Tee — Front)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded border border-border bg-background px-3 py-2 text-sm"
            />
            <select
              value={garmentType}
              onChange={(e) => setGarmentType(e.target.value)}
              className="rounded border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="tee">Tee</option>
              <option value="hoodie">Hoodie</option>
              <option value="cap">Cap</option>
              <option value="other">Other</option>
            </select>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="md:col-span-2 text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground"
            />
            <p className="md:col-span-2 text-xs text-muted-foreground">
              Print area (% of the photo) — where artwork is allowed to sit:
            </p>
            {(["x", "y", "width", "height"] as const).map((k) => (
              <label key={k} className="flex items-center gap-2 text-xs text-muted-foreground">
                {k}
                <input
                  type="number"
                  value={printArea[k]}
                  onChange={(e) => setPrintArea((p) => ({ ...p, [k]: Number(e.target.value) }))}
                  className="w-full rounded border border-border bg-background px-2 py-1"
                />
              </label>
            ))}
            {error && <p className="md:col-span-2 text-xs text-destructive">{error}</p>}
            <button disabled={busy} className="md:col-span-2 rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground">
              {busy ? "Adding..." : "Add template"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
