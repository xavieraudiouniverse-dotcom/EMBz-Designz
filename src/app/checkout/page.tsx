"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency-context";
import { formatPrice, convert } from "@/lib/currency";

const SHIPPING_METHODS = [
  { id: "standard", label: "Standard shipping", eta: "6-15 business days", price: 14.99 },
  { id: "express", label: "Express shipping", eta: "3-7 business days", price: 24.99 },
  { id: "priority", label: "Priority shipping", eta: "2-4 business days", price: 34.99 },
  { id: "economy", label: "Economy shipping", eta: "15-25 business days", price: 9.99 },
];

const GST_RATE = 0.1;
const PAYMENT_ICONS = ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay", "Google Pay"];

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const { items, subtotal, clear } = useCart();
  const { currency, rateToAud } = useCurrency();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [shippingId, setShippingId] = useState("standard");
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
    country: "Australia",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase]);

  const shippingMethod = SHIPPING_METHODS.find((m) => m.id === shippingId)!;
  const tax = subtotal * GST_RATE;
  const total = subtotal + shippingMethod.price + tax;

  if (userId === null) {
    return (
      <div className="mx-auto max-w-sm text-center">
        <h1 className="mb-4 text-2xl">Sign in to checkout</h1>
        <p className="mb-6 text-muted-foreground">Create an account or sign in to place your order.</p>
        <a href="/login?next=/checkout" className="text-accent hover:underline">
          Go to sign in
        </a>
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-center text-muted-foreground">Your cart is empty.</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    setError(null);

    const displayTotal = convert(total, currency, rateToAud);

    // Create the order unpaid. The order doesn't get marked paid until the
    // Stripe webhook confirms the payment actually succeeded, so there's
    // no way for a customer to fake payment by just hitting checkout.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total,
        currency: "AUD",
        display_currency: currency,
        display_total: displayTotal,
        payment_status: "unpaid",
        ...form,
        notes: [form.notes, `Shipping method: ${shippingMethod.label} (${shippingMethod.eta})`].filter(Boolean).join(" — "),
      })
      .select()
      .single();

    if (orderError || !order) {
      setSubmitting(false);
      setError(orderError?.message ?? "Could not create order.");
      return;
    }

    // Product lines, plus shipping and tax as their own line items so the
    // Stripe charge (which sums order_items) matches the total shown here.
    const { error: itemsError } = await supabase.from("order_items").insert([
      ...items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.variant ? `${item.name} (${item.variant})` : item.name,
        unit_price: item.price,
        quantity: item.quantity,
      })),
      {
        order_id: order.id,
        product_id: null,
        product_name: `Shipping — ${shippingMethod.label}`,
        unit_price: shippingMethod.price,
        quantity: 1,
      },
      {
        order_id: order.id,
        product_id: null,
        product_name: "GST (10%)",
        unit_price: Number(tax.toFixed(2)),
        quantity: 1,
      },
    ]);

    if (itemsError) {
      setSubmitting(false);
      setError(itemsError.message);
      return;
    }

    // Start the Stripe Checkout Session (or show an error if payments aren't
    // configured yet). On success, the browser is redirected to Stripe's
    // hosted Checkout page, where the customer pays. Once payment succeeds,
    // the Stripe webhook marks the order paid AND kicks off Merchize fulfillment.
    const res = await fetch("/api/checkout/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });

    const json = await res.json();
    if (!res.ok) {
      setSubmitting(false);
      setError(json.error ?? "Could not start checkout");
      return;
    }

    clear();
    setSubmitting(false);

    if (json.url) {
      window.location.href = json.url;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h1 className="font-display text-2xl">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-accent">Shipping information</p>
          {(
            [
              ["customer_name", "Full name", true],
              ["customer_email", "Email address", true],
              ["phone", "Phone (optional)", false],
              ["address_line1", "Address", true],
              ["address_line2", "Apartment, suite, etc. (optional)", false],
              ["city", "City", true],
              ["postal_code", "Postcode", true],
              ["country", "Country", true],
            ] as const
          ).map(([key, label, required]) => (
            <input
              key={key}
              required={required}
              placeholder={label}
              value={(form as any)[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full rounded border border-border bg-card px-3 py-2 text-sm"
            />
          ))}
          <textarea
            placeholder="Order notes (optional)"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="w-full rounded border border-border bg-card px-3 py-2 text-sm"
          />
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-accent">Shipping method</p>
          <div className="space-y-2">
            {SHIPPING_METHODS.map((m) => (
              <label
                key={m.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-sm transition ${
                  shippingId === m.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-accent/50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingId === m.id}
                    onChange={() => setShippingId(m.id)}
                    className="accent-primary"
                  />
                  <span>
                    <span className="block font-medium">{m.label}</span>
                    <span className="block text-xs text-muted-foreground">{m.eta}</span>
                  </span>
                </span>
                <span className="text-accent">{formatPrice(m.price, currency, rateToAud)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="panel-metal h-fit space-y-4 rounded-xl p-6 lg:sticky lg:top-20">
          <h2 className="text-lg">Order summary</h2>
          <div className="space-y-1">
            {items.map((item) => (
              <div key={`${item.id}-${item.variant ?? ""}`} className="flex justify-between py-1 text-sm">
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                  {item.variant && <span className="block text-[11px]">{item.variant}</span>}
                </span>
                <span>{formatPrice(item.price * item.quantity, currency, rateToAud)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{formatPrice(shippingMethod.price, currency, rateToAud)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (GST)</span>
              <span>{formatPrice(tax, currency, rateToAud)}</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <span>Total</span>
            <span className="text-accent">{formatPrice(total, currency, rateToAud)}</span>
          </div>
          <p className="text-center text-[11px] uppercase tracking-wide text-muted-foreground">30-day easy returns</p>
          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-4">
            {PAYMENT_ICONS.map((p) => (
              <span key={p} className="rounded border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        disabled={submitting}
        className="sweep glow-hover w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
      >
        {submitting ? "Placing order…" : "Place order securely"}
      </button>
    </form>
  );
}
