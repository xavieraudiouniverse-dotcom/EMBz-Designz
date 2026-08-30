import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import AddToCartForm from "./AddToCartForm";

export const revalidate = 0;

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) notFound();
  const product = data as Product;

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-xl border border-border bg-card">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-chrome font-display text-3xl">
            EMBZ
          </div>
        )}
      </div>
      <div>
        <h1 className="text-3xl">{product.name}</h1>
        <p className="mt-4 text-muted-foreground">{product.description}</p>
        <AddToCartForm product={product} />
      </div>
    </div>
  );
}
