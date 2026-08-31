"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency-context";
import { formatPrice } from "@/lib/currency";
import Artwork from "@/components/Artwork";

export default function CartPage() {
  const { items, setQuantity, remove, subtotal } = useCart();
  const { currency, rateToAud } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="empty">
          <p>YOUR CART IS EMPTY.</p>
          <Link href="/shop" className="btn" style={{ marginTop: 20, display: "inline-flex" }}>
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-title" style={{ textAlign: "left" }}>
        <h1>YOUR CART</h1>
      </div>
      <div className="cart-layout">
        <div>
          {items.map((item) => (
            <div key={`${item.id}-${item.variant ?? ""}`} className="cart-row">
              <div className="mini-art" style={{ position: "relative", overflow: "hidden" }}>
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <Artwork mark="EMBZ" className="h-full min-h-0" />
                )}
              </div>
              <div>
                <b>{item.name}</b>
                {item.variant && <small>{item.variant}</small>}
                <strong style={{ color: "#d66eff", fontSize: 12, marginTop: 6, display: "block" }}>
                  {formatPrice(item.price, currency, rateToAud)}
                </strong>
              </div>
              <div className="qty">
                <button type="button" onClick={() => setQuantity(item.id, Math.max(1, item.quantity - 1), item.variant)}>
                  −
                </button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => setQuantity(item.id, item.quantity + 1, item.variant)}>
                  +
                </button>
              </div>
              <div>
                <button onClick={() => remove(item.id, item.variant)} className="remove">
                  REMOVE
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="summary">
          <h3>
            <span>SUBTOTAL</span>
            <span>{formatPrice(subtotal, currency, rateToAud)}</span>
          </h3>
          <hr />
          <Link href="/checkout" className="btn full" style={{ marginTop: 8 }}>
            CHECKOUT
          </Link>
        </div>
      </div>
    </div>
  );
}
