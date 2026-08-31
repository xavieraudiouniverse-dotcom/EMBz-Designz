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
    <>
      <h3>{formatPrice(product.price, currency, rateToAud)}</h3>

      <div style={{ margin: "24px 0" }}>
        <p className="smallcaps">COLOR — {color.toUpperCase()}</p>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColor(c.name)}
              aria-label={c.name}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: c.hex,
                border: color === c.name ? "2px solid #d975ff" : "1px solid #3a2050",
                boxShadow: color === c.name ? "0 0 12px #a500ff" : "none",
                padding: 0,
                minHeight: 0,
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ margin: "24px 0" }}>
        <p className="smallcaps">SIZE — {size}</p>
        <select value={size} onChange={(e) => setSize(e.target.value)}>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="quantity">
        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="btn" style={{ minHeight: 30, padding: "0 14px" }}>
          −
        </button>
        <span>{qty}</span>
        <button type="button" onClick={() => setQty((q) => q + 1)} className="btn" style={{ minHeight: 30, padding: "0 14px" }}>
          +
        </button>
      </div>

      <p className="smallcaps">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>

      <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
        <button
          disabled={product.stock <= 0}
          onClick={() => {
            addToCart();
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
          className="btn full"
        >
          {added ? "ADDED ✓" : "ADD TO CART"}
        </button>
        <button
          disabled={product.stock <= 0}
          onClick={() => {
            addToCart();
            router.push("/checkout");
          }}
          className="btn ghost full"
        >
          BUY IT NOW
        </button>
      </div>

      <div className="perks">
        <span>✦ Worldwide shipping, 195+ countries</span>
        <span>✦ Secure checkout, 100% encrypted</span>
        <span>✦ Proceeds support the legacy fund</span>
      </div>
    </>
  );
}
