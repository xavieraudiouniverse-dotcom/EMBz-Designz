"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency-context";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@/types/database";

export default function AddToCartForm({ product }: { product: Product }) {
  const { add } = useCart();
  const { currency, rateToAud } = useCurrency();
  const [added, setAdded] = useState(false);

  return (
    <div className="mt-6">
      <p className="text-2xl text-accent">{formatPrice(product.price, currency, rateToAud)}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
      </p>
      <button
        disabled={product.stock <= 0}
        onClick={() => {
          add({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
          });
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="sweep glow-hover mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
      >
        {added ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
