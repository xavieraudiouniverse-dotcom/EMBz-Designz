"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency-context";
import { formatPrice } from "@/lib/currency";

export default function CartPage() {
  const { items, setQuantity, remove, subtotal } = useCart();
  const { currency, rateToAud } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Your cart is empty.</p>
        <Link href="/shop" className="mt-4 inline-block text-accent hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={`${item.id}-${item.variant ?? ""}`} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
              {item.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              {item.variant && <p className="text-xs text-muted-foreground">{item.variant}</p>}
              <p className="text-sm text-accent">{formatPrice(item.price, currency, rateToAud)}</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => setQuantity(item.id, Number(e.target.value), item.variant)}
              className="w-16 rounded border border-border bg-background px-2 py-1 text-center"
            />
            <button
              onClick={() => remove(item.id, item.variant)}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="panel-metal h-fit rounded-xl p-6">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span className="text-accent">{formatPrice(subtotal, currency, rateToAud)}</span>
        </div>
        <Link
          href="/checkout"
          className="sweep glow-hover mt-6 block rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
