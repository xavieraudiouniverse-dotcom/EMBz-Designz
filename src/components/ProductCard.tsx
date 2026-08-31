"use client";

import Link from "next/link";
import { useCurrency } from "@/lib/currency-context";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@/types/database";

type ProductWithCategory = Product & { categories?: { name: string; slug: string } | null };

export default function ProductCard({ product }: { product: ProductWithCategory }) {
  const { currency, rateToAud } = useCurrency();
  const category = product.categories?.name;

  return (
    <Link href={`/shop/${product.slug}`} className="product-card">
      <div className="pc-art">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="art">
            <div className="art-orb" />
            <div className="art-ring a" />
            <div className="art-ring b" />
            <div className="art-mark">EMBZ</div>
            <i className="spark s1" />
            <i className="spark s2" />
            <i className="spark s3" />
          </div>
        )}
        {product.is_featured && <em>FEATURED</em>}
      </div>
      <div className="pc-info">
        <b>{product.name}</b>
        {category && <small>{category}</small>}
        <strong>{formatPrice(product.price, currency, rateToAud)}</strong>
      </div>
    </Link>
  );
}
