"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency-context";
import { formatPrice, convert } from "@/lib/currency";

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const { items, subtotal, clear } = useCart();
  const { currency, rateToAud } = useCurrency();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
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
  const [paymentReady, setPaymentReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase]);

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

    const displayTotal = convert(subtotal, currency, rateToAud);

    // Create the order unpaid. The order doesn't get marked paid until the
    // Stripe webhook confirms the payment actually succeeded, so there's
    // no way for a customer to fake payment by just hitting checkout.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total: subtotal,
        currency: "AUD",
        display_currency: currency,
        display_total: displayTotal,
        payment_status: "unpaid",
        ...form,
      })
      .select()
      .single();

    if (orderError || !order) {
      setSubmitting(false);
      setError(orderError?.message ?? "Could not create order.");
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        unit_price: item.price,
        quantity: item.quantity,
      })),
    );

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
      // Redirect to Stripe's hosted Checkout page (or back to order details if
      // the order was already marked paid somehow).
      window.location.href = json.url;
    }
  }

  return (
    <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-2xl">Checkout</h1>
        {(
          [
            ["customer_name", "Full name"],
            ["customer_email", "Email"],
            ["phone", "Phone"],
            ["address_line1", "Address line 1"],
            ["address_line2", "Address line 2 (optional)"],
            ["city", "City"],
            ["postal_code", "Postal code"],
            ["country", "Country"],
          ] as const
        ).map(([key, label]) => (
          <input
            key={key}
            required={key !== "address_line2" && key !== "phone"}
            placeholder={label}
            value={(form as any)[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full rounded border border-border bg-card px-3 py-2"
          />
        ))}
        <textarea
          placeholder="Order notes (optional)"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="w-full rounded border border-border bg-card px-3 py-2"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          disabled={submitting}
          className="sweep glow-hover w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          {submitting ? "Starting checkout..." : "Proceed to payment"}
        </button>
      </form>
      <div className="panel-metal h-fit rounded-xl p-6">
        <h2 className="mb-4 text-lg">Order summary</h2>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between py-1 text-sm">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity, currency, rateToAud)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold">
          <span>Total</span>
          <span className="text-accent">{formatPrice(subtotal, currency, rateToAud)}</span>
        </div>
      </div>
    </div>
  );
}
