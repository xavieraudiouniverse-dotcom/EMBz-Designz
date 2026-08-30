"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMerchizeProduct } from "@/lib/merchize";
import { parseCsv } from "@/lib/csv";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data } = await supabase.rpc("is_admin");
  if (!data) throw new Error("Admin only");
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function upsertProduct(formData: FormData) {
  await requireAdmin();
  const service = createServiceClient();

  const id = formData.get("id") as string | null;
  const name = String(formData.get("name") || "");
  const payload = {
    name,
    slug: slugify(name),
    description: String(formData.get("description") || ""),
    price: Number(formData.get("price") || 0),
    stock: Number(formData.get("stock") || 0),
    image_url: String(formData.get("image_url") || "") || null,
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
  };

  if (id) {
    await service.from("products").update(payload).eq("id", id);
  } else {
    await service.from("products").insert(payload);
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const service = createServiceClient();
  await service.from("products").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

async function importOneFromMerchize(merchizeProductId: string) {
  const product = await getMerchizeProduct(merchizeProductId);
  const service = createServiceClient();
  const { error } = await service.from("products").upsert(
    {
      name: product.name,
      slug: slugify(product.name),
      description: product.description ?? null,
      price: product.price ?? 0,
      image_url: product.images?.[0] ?? null,
      merchize_product_id: merchizeProductId,
      merchize_synced_at: new Date().toISOString(),
    },
    { onConflict: "merchize_product_id" },
  );
  if (error) throw new Error(error.message);
}

export async function importFromMerchize(formData: FormData): Promise<{ ok?: true; error?: string }> {
  await requireAdmin();
  const merchizeProductId = String(formData.get("merchize_product_id") || "");
  if (!merchizeProductId) return { error: "Product ID required" };
  if (!process.env.MERCHIZE_API_KEY) {
    return { error: "MERCHIZE_API_KEY is not set yet — add it in Vercel's project environment variables." };
  }
  try {
    await importOneFromMerchize(merchizeProductId);
  } catch (err: any) {
    return { error: err?.message ?? "Import failed" };
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true };
}

/** Bulk version: one Merchize product ID/SKU per line (or comma-separated). */
export async function importFromMerchizeBulk(
  formData: FormData,
): Promise<{ imported: number; failed: Array<{ id: string; error: string }> }> {
  await requireAdmin();
  if (!process.env.MERCHIZE_API_KEY) {
    return { imported: 0, failed: [{ id: "*", error: "MERCHIZE_API_KEY is not set yet — add it in Vercel's environment variables." }] };
  }

  const raw = String(formData.get("merchize_product_ids") || "");
  const ids = raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const failed: Array<{ id: string; error: string }> = [];
  let imported = 0;

  for (const id of ids) {
    try {
      await importOneFromMerchize(id);
      imported++;
    } catch (err: any) {
      failed.push({ id, error: err?.message ?? "Import failed" });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { imported, failed };
}

/**
 * Bulk CSV import. Expected header row (order doesn't matter, extra columns ignored):
 *   name, price, stock, description, image_url, category, is_featured, is_active
 * `category` matches an existing category's slug or name (case-insensitive) — leave
 * blank to skip. Rows are matched to existing products by slugified name, so re-uploading
 * the same file updates rather than duplicates.
 */
export async function importProductsCsv(
  formData: FormData,
): Promise<{ imported: number; failed: Array<{ row: number; error: string }> }> {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { imported: 0, failed: [{ row: 0, error: "No file selected." }] };
  }

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return { imported: 0, failed: [{ row: 0, error: "Couldn't find any data rows in that file." }] };
  }

  const service = createServiceClient();
  const { data: categories } = await service.from("categories").select("id, name, slug");
  const categoryByKey = new Map<string, string>();
  (categories ?? []).forEach((c: any) => {
    categoryByKey.set(c.slug.toLowerCase(), c.id);
    categoryByKey.set(c.name.toLowerCase(), c.id);
  });

  const failed: Array<{ row: number; error: string }> = [];
  let imported = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const name = r.name || r.Name || "";
    if (!name) {
      failed.push({ row: i + 2, error: "Missing name" });
      continue;
    }
    const price = Number(r.price ?? r.Price ?? 0);
    if (Number.isNaN(price)) {
      failed.push({ row: i + 2, error: `Invalid price "${r.price}"` });
      continue;
    }

    const categoryKey = (r.category || "").toLowerCase().trim();
    const category_id = categoryKey ? categoryByKey.get(categoryKey) ?? null : null;

    const payload = {
      name,
      slug: slugify(name),
      description: r.description || null,
      price,
      stock: Number(r.stock || 0) || 0,
      image_url: r.image_url || null,
      category_id,
      is_featured: /^(true|yes|1)$/i.test(r.is_featured || ""),
      is_active: r.is_active === "" || r.is_active === undefined ? true : /^(true|yes|1)$/i.test(r.is_active),
    };

    const { error } = await service.from("products").upsert(payload, { onConflict: "slug" });
    if (error) {
      failed.push({ row: i + 2, error: error.message });
    } else {
      imported++;
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { imported, failed };
}
