"use client";

import Link from "next/link";
import { useCurrency } from "@/lib/currency-context";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@/types/database";

export default function ProductCard({ product }: { product: Product }) {
  const { currency, rateToAud } = useCurrency();

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="edge-glow glow-hover group rounded-xl border border-border bg-card p-3 transition"
    >
      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-chrome font-display text-2xl">
            EMBZ
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium">{product.name}</h3>
        <p className="text-sm text-accent">{formatPrice(product.price, currency, rateToAud)}</p>
      </div>
    </Link>
  );
}
