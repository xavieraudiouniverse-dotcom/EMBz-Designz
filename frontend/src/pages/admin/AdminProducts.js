import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import {
  fetchStoreProducts, updateStoreProduct, deleteStoreProduct,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { SmartImage } from "@/components/SmartImage";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, ExternalLink, Loader2, Boxes } from "lucide-react";
import { toast } from "sonner";
import { formatUSD } from "@/lib/format";

export default function AdminProducts() {
  const qc = useQueryClient();
  const { data: products, isLoading } = useQuery({ queryKey: ["store-products"], queryFn: fetchStoreProducts });
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const togglePublish = async (p) => {
    try {
      await updateStoreProduct(p.id, { published: !p.published });
      qc.invalidateQueries({ queryKey: ["store-products"] });
      toast.success(p.published ? "Unpublished" : "Published");
    } catch { toast.error("Update failed"); }
  };

  const doDelete = async () => {
    try {
      await deleteStoreProduct(deleting.id);
      qc.invalidateQueries({ queryKey: ["store-products"] });
      toast.success("Product removed");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(null); }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl">My Products</h1>
          <p className="text-muted-foreground text-sm mt-1">Products currently in your store.</p>
        </div>
        <Button asChild variant="secondary" className="border border-border"><Link to="/admin/catalog"><Boxes className="h-4 w-4 mr-2" /> Import more</Link></Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)}
        </div>
      ) : (products || []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <h3 className="font-serif text-xl">No products yet</h3>
          <p className="text-muted-foreground mt-2">Import blanks from Merchize and attach your designs to start selling.</p>
          <Button asChild className="mt-4 rounded-xl"><Link to="/admin/catalog">Import your first product</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="admin-products-grid">
          {products.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col" data-testid="admin-product-item">
              <div className="relative">
                <AspectRatio ratio={4 / 5}>
                  <SmartImage src={p.thumbnail} alt={p.title} className="h-full w-full object-cover" />
                </AspectRatio>
                <Badge className={`absolute left-2 top-2 text-[10px] ${p.published ? "bg-emerald-100 text-emerald-800" : "bg-secondary text-foreground"}`}>
                  {p.published ? "Published" : "Draft"}
                </Badge>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-serif text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{p.title}</h3>
                <div className="mt-1 text-sm font-semibold tabular-nums">{formatUSD(p.price)}</div>
                <div className="text-xs text-muted-foreground">{p.category} · {(p.variants || []).length} variants</div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={p.published} onCheckedChange={() => togglePublish(p)} data-testid="admin-product-publish-toggle" />
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(p)} data-testid="admin-product-edit"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleting(p)} data-testid="admin-product-delete"><Trash2 className="h-4 w-4" /></Button>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8"><Link to={`/product/${p.id}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditDialog product={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["store-products"] }); }} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove product?</AlertDialogTitle>
            <AlertDialogDescription>“{deleting?.title}” will be removed from your store. This won’t affect existing orders.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="admin-product-delete-confirm">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

const EditDialog = ({ product, onClose, onSaved }) => {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (product) setForm({
      title: product.title,
      description: product.description || "",
      category: product.category || "",
      price: product.price,
      design_images: (product.design_images || []).join(", "),
      design_front: product.design_front || "",
      published: product.published,
    });
  }, [product]);

  if (!product || !form) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    try {
      const images = form.design_images.split(",").map((s) => s.trim()).filter(Boolean);
      await updateStoreProduct(product.id, {
        title: form.title,
        description: form.description,
        category: form.category,
        price: parseFloat(form.price) || 0,
        design_images: images,
        design_front: form.design_front,
        published: form.published,
      });
      toast.success("Product updated");
      onSaved();
    } catch { toast.error("Update failed"); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader><DialogTitle className="font-serif">Edit product</DialogTitle><DialogDescription>Update your product details, pricing, artwork and visibility.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div><Label className="mb-1.5 block text-sm">Title</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="edit-title" /></div>
          <div><Label className="mb-1.5 block text-sm">Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="edit-description" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="mb-1.5 block text-sm">Price (USD)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} data-testid="edit-price" /></div>
            <div><Label className="mb-1.5 block text-sm">Category</Label><Input value={form.category} onChange={(e) => set("category", e.target.value)} data-testid="edit-category" /></div>
          </div>
          <div><Label className="mb-1.5 block text-sm">Design image URLs</Label><Textarea value={form.design_images} onChange={(e) => set("design_images", e.target.value)} data-testid="edit-images" /></div>
          <div><Label className="mb-1.5 block text-sm">Printable artwork URL</Label><Input value={form.design_front} onChange={(e) => set("design_front", e.target.value)} data-testid="edit-artwork" /></div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm font-medium">Published</span>
            <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} data-testid="edit-published" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" className="border border-border" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving} data-testid="edit-submit">{saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
