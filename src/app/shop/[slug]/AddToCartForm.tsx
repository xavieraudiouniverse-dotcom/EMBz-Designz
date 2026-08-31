"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency-context";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@/types/database";

const SIZES = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const COLORS = [
  { name: "Chrome", hex: "#cfc7de" },
  { name: "Purple", hex: "#9b5cf0" },
  { name: "Jet Black", hex: "#141119" },
];

export default function AddToCartForm({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const { currency, rateToAud } = useCurrency();
  const [size, setSize] = useState("M");
  const [color, setColor] = useState(COLORS[1].name);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = `Size: ${size} / Color: ${color}`;

  function addToCart() {
    add(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        variant,
      },
      qty,
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <p className="text-2xl text-accent">{formatPrice(product.price, currency, rateToAud)}</p>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Color — {color}</p>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColor(c.name)}
              aria-label={c.name}
              className={`h-8 w-8 rounded-full border-2 transition ${
                color === c.name ? "border-accent shadow-cyan" : "border-border"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Size — {size}</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                size === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-accent hover:text-accent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Quantity</p>
        <div className="inline-flex items-center gap-3 rounded-lg border border-border px-3 py-1.5">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-lg text-muted-foreground hover:text-foreground">
            −
          </button>
          <span className="w-6 text-center text-sm">{qty}</span>
          <button type="button" onClick={() => setQty((q) => q + 1)} className="text-lg text-muted-foreground hover:text-foreground">
            +
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>

      <div className="space-y-3">
        <button
          disabled={product.stock <= 0}
          onClick={() => {
            addToCart();
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
          className="sweep glow-hover w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
        >
          {added ? "Added ✓" : "Add to cart"}
        </button>
        <button
          disabled={product.stock <= 0}
          onClick={() => {
            addToCart();
            router.push("/checkout");
          }}
          className="w-full rounded-full border border-accent py-3 text-sm font-semibold text-accent transition hover:bg-accent/10 disabled:opacity-40"
        >
          Buy it now
        </button>
      </div>
    </div>
  );
}
