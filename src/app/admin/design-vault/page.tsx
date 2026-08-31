"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "designs";
const COLLECTIONS = [
  { id: "all", label: "All" },
  { id: "legacy", label: "Legacy" },
  { id: "ella", label: "Ella collection" },
  { id: "john", label: "John collection" },
  { id: "limited", label: "Limited drops" },
];

function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type FileEntry = { name: string; url: string; collection: string };

// Filenames are expected to be prefixed with a collection tag, e.g.
// "legacy-skull-01.png" — that's the only "metadata" this needs, so uploads
// stay a single Storage bucket instead of a whole new table.
function collectionOf(name: string) {
  const prefix = name.split("-")[0]?.toLowerCase();
  return COLLECTIONS.some((c) => c.id === prefix) ? prefix : "legacy";
}

export default function DesignVaultPage() {
  const supabase = createClient();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [collectionForUpload, setCollectionForUpload] = useState("legacy");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from(BUCKET).list("", { sortBy: { column: "created_at", order: "desc" } });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const entries = (data ?? [])
      .filter((f) => f.name && !f.name.endsWith("/"))
      .map((f) => ({
        name: f.name,
        url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
        collection: collectionOf(f.name),
      }));
    setFiles(entries);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handlePickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    // Pre-fill a sensible title from the filename so admins don't have to
    // retype it, but leave it editable.
    if (!title) setTitle(file.name.replace(/\.[a-z0-9]+$/i, ""));
  }

  async function handleSaveDesign() {
    if (!pendingFile) {
      setError("Choose a file first.");
      return;
    }
    setUploading(true);
    setError(null);

    // Storage has no metadata table backing it, so title/category/tags are
    // folded into the filename itself (collection stays the first segment —
    // that's what collectionOf() above parses back out).
    const ext = pendingFile.name.match(/\.[a-z0-9]+$/i)?.[0] ?? "";
    const nameSlug = slugify(title) || "design";
    const categorySlug = category ? `-${slugify(category)}` : "";
    const tagsSlug = tags
      ? `-${tags
          .split(",")
          .map((t) => slugify(t))
          .filter(Boolean)
          .join("+")}`
      : "";
    const path = `${collectionForUpload}${categorySlug}-${nameSlug}${tagsSlug}-${Date.now()}${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, pendingFile);
    setUploading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setPendingFile(null);
    setTitle("");
    setCategory("");
    setTags("");
    refresh();
  }

  async function handleDelete(name: string) {
    await supabase.storage.from(BUCKET).remove([name]);
    refresh();
  }

  const visible = filter === "all" ? files : files.filter((f) => f.collection === filter);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-accent">All collections</p>
        <h1 className="font-display text-2xl tracking-wide">Design vault</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {COLLECTIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  filter === c.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-accent hover:text-accent"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading designs…</p>
          ) : visible.length === 0 ? (
            <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No designs here yet — upload one on the right.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {visible.map((f) => (
                <div key={f.name} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                  <button
                    onClick={() => handleDelete(f.name)}
                    className="absolute right-1 top-1 hidden rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-destructive group-hover:block"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel-metal h-fit space-y-5 rounded-xl p-5">
          <div>
            <h2 className="mb-2 text-sm text-muted-foreground">Upload new design</h2>
            <label className="block cursor-pointer rounded-lg border border-dashed border-primary/40 bg-primary/5 p-6 text-center text-xs text-muted-foreground hover:border-accent">
              {pendingFile ? pendingFile.name : "Drag & drop files here or click to browse"}
              <input type="file" accept="image/*" className="hidden" onChange={handlePickFile} disabled={uploading} />
            </label>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <h2 className="text-sm text-muted-foreground">Design info</h2>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-muted-foreground">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chrome crown skull"
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-muted-foreground">Collection</label>
              <select
                value={collectionForUpload}
                onChange={(e) => setCollectionForUpload(e.target.value)}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              >
                {COLLECTIONS.filter((c) => c.id !== "all").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-muted-foreground">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Tee graphic"
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-muted-foreground">Tags</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="skull, chrome, purple"
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            onClick={handleSaveDesign}
            disabled={uploading || !pendingFile}
            className="btn-primary-glow w-full !py-2 !text-xs disabled:opacity-40"
          >
            {uploading ? "Saving…" : "Save design"}
          </button>
        </div>
      </div>
    </div>
  );
}
