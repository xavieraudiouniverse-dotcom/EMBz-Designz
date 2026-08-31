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

  // Gather whatever image angles we actually have (front/back design renders,
  // falling back to the single product image) so the gallery never shows more
  // thumbnails than real images.
  const gallery = [
    product.image_url,
    product.design_data?.front ? product.image_url : null,
    product.design_data?.back ? product.image_url : null,
  ].filter(Boolean) as string[];
  const images = gallery.length > 0 ? gallery : [null];

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <div className="edge-glow aspect-square overflow-hidden rounded-xl border border-border bg-card">
          {images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-chrome font-display text-3xl">
              EMBZ
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-3">
            {images.map((src, i) => (
              <div key={i} className="h-16 w-16 overflow-hidden rounded-lg border border-border bg-card">
                {src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={`${product.name} view ${i + 1}`} className="h-full w-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">EMBZ</p>
        <h1 className="mt-1 font-display text-3xl">{product.name}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{product.description}</p>
        <AddToCartForm product={product} />
      </div>
    </div>
  );
}
