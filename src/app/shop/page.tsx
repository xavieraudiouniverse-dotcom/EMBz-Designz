import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/database";

export const revalidate = 0;

export default async function ShopPage() {
  const supabase = createClient();
  let products: Product[] = [];
  try {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    products = (data as Product[]) ?? [];
  } catch {
    // Supabase not configured yet
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl">Shop</h1>
      {products.length === 0 ? (
        <p className="text-muted-foreground">No products yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
