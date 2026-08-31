import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import Artwork from "@/components/Artwork";
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
    <div className="page">
      <div className="product-detail">
        <div className="detail-art">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <Artwork mark="EMBZ" className="h-full" />
          )}
        </div>
        <div className="detail-copy">
          <p className="eyebrow">EMBZ</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  );
}
