import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import {
  fetchAdminCatalog, fetchAdminCatalogCategories, importProduct,
  syncCatalog, syncStatus,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Switch } from "@/components/ui/switch";
import { SmartImage } from "@/components/SmartImage";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Loader2, RefreshCw, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { formatUSD } from "@/lib/format";

export default function AdminCatalog() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [importing, setImporting] = useState(null); // base product

  const { data: cats } = useQuery({ queryKey: ["admin-cats"], queryFn: fetchAdminCatalogCategories });
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-catalog", query, category, page],
    queryFn: () => fetchAdminCatalog({ query: query || undefined, category, page, limit: 24 }),
    keepPreviousData: true,
  });
  const { data: sync } = useQuery({ queryKey: ["sync-status"], queryFn: syncStatus, refetchInterval: (d) => (d?.running ? 2000 : false) });

  const doSync = async () => {
    await syncCatalog();
    toast.info("Catalog sync started");
    qc.invalidateQueries({ queryKey: ["sync-status"] });
  };

  const products = data?.products || [];
  const pages = data?.pages || 1;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl">Import from Merchize</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pick a blank product, attach your design, set a price, and publish it to your store.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{sync?.base_products_in_db ?? 0} blanks available</span>
          <Button variant="secondary" className="border border-border" onClick={doSync} disabled={sync?.running} data-testid="admin-sync-catalog-button">
            {sync?.running ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Syncing {sync?.synced}/{sync?.total}</> : <><RefreshCw className="h-4 w-4 mr-2" /> Sync catalog</>}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); setQuery(searchInput); setPage(1); }} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search blanks (t-shirt, mug, hoodie…)" className="pl-9 h-10" data-testid="admin-catalog-search" />
        </form>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger className="w-[180px] h-10" data-testid="admin-catalog-category"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {(cats || []).map((c) => <SelectItem key={c.name} value={c.name}>{c.name} ({c.count})</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">{data?.total} blanks</p>
            {isFetching && <span className="text-xs text-muted-foreground">Updating…</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="admin-catalog-grid">
            {products.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col" data-testid="admin-catalog-item">
                <div className="relative">
                  <AspectRatio ratio={4 / 5}>
                    <SmartImage src={p.thumbnail} alt={p.title} className="h-full w-full object-cover" />
                  </AspectRatio>
                  <Badge className="absolute left-2 top-2 bg-card/90 text-foreground border border-border text-[10px]">{p.category}</Badge>
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-serif text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{p.title}</h3>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {(p.variants || []).length} variants · base {p.variants?.[0]?.base_cost != null ? formatUSD(p.variants[0].base_cost) : "—"}
                  </div>
                  <Button size="sm" className="mt-3 rounded-lg" onClick={() => setImporting(p)} data-testid="admin-import-button">
                    <PlusCircle className="h-4 w-4 mr-1" /> Import
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button variant="secondary" className="border border-border" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /> Prev</Button>
              <span className="text-sm">Page {page} of {pages}</span>
              <Button variant="secondary" className="border border-border" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
            </div>
          )}
        </>
      )}

      <ImportDialog
        base={importing}
        onClose={() => setImporting(null)}
        onImported={() => { setImporting(null); qc.invalidateQueries({ queryKey: ["store-products"] }); navigate("/admin/products"); }}
      />
    </AdminLayout>
  );
}

const ImportDialog = ({ base, onClose, onImported }) => {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (base) {
      const suggested = base.from_price || (base.variants?.[0]?.retail_price) || 0;
      setForm({
        title: base.title,
        description: "",
        category: base.category || "Other",
        price: suggested,
        design_front: "",
        design_images: "",
        published: true,
      });
    }
  }, [base]);

  if (!base || !form) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    try {
      const images = form.design_images.split(",").map((s) => s.trim()).filter(Boolean);
      await importProduct({
        base_product_id: base.id,
        title: form.title,
        description: form.description,
        category: form.category,
        price: parseFloat(form.price) || 0,
        design_images: images,
        design_front: form.design_front || (images[0] || null),
        published: form.published,
      });
      toast.success("Product imported to your store");
      onImported();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Import failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!base} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Import product</DialogTitle>
          <DialogDescription>Based on “{base.title}” · {(base.variants || []).length} variants</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm">Store title</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="import-title" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Description</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe your design" data-testid="import-description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-sm">Retail price (USD)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} data-testid="import-price" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Category</Label>
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} data-testid="import-category" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Design / mockup image URLs</Label>
            <Textarea value={form.design_images} onChange={(e) => set("design_images", e.target.value)} placeholder="https://... (comma separated for multiple)" data-testid="import-images" />
            <p className="text-xs text-muted-foreground mt-1">First image becomes the store thumbnail. Leave empty to use the blank’s stock photo.</p>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Printable artwork URL (sent to Merchize)</Label>
            <Input value={form.design_front} onChange={(e) => set("design_front", e.target.value)} placeholder="https://... high-res artwork" data-testid="import-artwork" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <div className="text-sm font-medium">Publish to store</div>
              <div className="text-xs text-muted-foreground">Make visible to customers immediately</div>
            </div>
            <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} data-testid="import-published" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" className="border border-border" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving} data-testid="import-submit">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing…</> : "Import product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
