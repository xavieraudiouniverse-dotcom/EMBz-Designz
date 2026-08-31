import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import { upsertProduct, deleteProduct } from "./actions";
import MerchizeImportForm from "./MerchizeImportForm";
import BulkCsvImportForm from "./BulkCsvImportForm";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const supabase = createServiceClient();
  const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="cc-header">
        <div>
          <small>CATALOGUE</small>
          <h1>PRODUCTS</h1>
        </div>
      </div>
          <Link href="/admin/designer" className="sweep glow-hover rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            + Design a new product
          </Link>
        </div>
        <BulkCsvImportForm />
        <MerchizeImportForm />
      </div>

      <div>
        <h2 className="mb-3 text-lg">Add a product manually</h2>
        <form action={upsertProduct} className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
          <input name="name" required placeholder="Name" className="rounded border border-border bg-background px-3 py-2" />
          <input name="price" type="number" step="0.01" required placeholder="Price (AUD)" className="rounded border border-border bg-background px-3 py-2" />
          <input name="stock" type="number" required placeholder="Stock" className="rounded border border-border bg-background px-3 py-2" />
          <input name="image_url" placeholder="Image URL" className="rounded border border-border bg-background px-3 py-2" />
          <textarea name="description" placeholder="Description" className="md:col-span-2 rounded border border-border bg-background px-3 py-2" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked /> Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_featured" /> Featured
          </label>
          <button className="md:col-span-2 rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground">
            Add product
          </button>
        </form>
      </div>

      <div className="space-y-2">
        {(products as Product[] | null)?.map((p) => (
          <details key={p.id} className="rounded-lg border border-border bg-card p-4">
            <summary className="cursor-pointer text-sm">
              {p.name} — ${p.price} · stock {p.stock} {p.merchize_product_id ? "· Merchize" : ""}{" "}
              {p.design_data ? "· Designed" : ""}
            </summary>
            {p.design_data && (
              <Link href={`/admin/designer?product=${p.id}`} className="mt-3 inline-block text-xs text-accent hover:underline">
                Edit design →
              </Link>
            )}
            <form action={upsertProduct} className="mt-4 grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={p.id} />
              <input name="name" defaultValue={p.name} required className="rounded border border-border bg-background px-3 py-2" />
              <input name="price" type="number" step="0.01" defaultValue={p.price} required className="rounded border border-border bg-background px-3 py-2" />
              <input name="stock" type="number" defaultValue={p.stock} required className="rounded border border-border bg-background px-3 py-2" />
              <input name="image_url" defaultValue={p.image_url ?? ""} className="rounded border border-border bg-background px-3 py-2" />
              <textarea name="description" defaultValue={p.description ?? ""} className="md:col-span-2 rounded border border-border bg-background px-3 py-2" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_active" defaultChecked={p.is_active} /> Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_featured" defaultChecked={p.is_featured} /> Featured
              </label>
              <div className="flex gap-3 md:col-span-2">
                <button className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">
                  Save
                </button>
                <button formAction={deleteProduct} className="rounded-full border border-destructive px-6 py-2 text-sm text-destructive">
                  Delete
                </button>
              </div>
            </form>
          </details>
        ))}
      </div>
    </div>
  );
}
