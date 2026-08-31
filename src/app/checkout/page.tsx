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
      <div className="page center" style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 28 }}>SIGN IN TO CHECKOUT</h1>
        <p className="smallcaps" style={{ margin: "16px 0" }}>
          Create an account or sign in to place your order.
        </p>
        <a href="/login?next=/checkout" className="btn">
          GO TO SIGN IN
        </a>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <p className="smallcaps" style={{ textAlign: "center" }}>
          YOUR CART IS EMPTY.
        </p>
      </div>
    );
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
    <form onSubmit={handleSubmit} className="page">
      <div className="page-title" style={{ textAlign: "left" }}>
        <h1>CHECKOUT</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="panel">
          <h2>SHIPPING INFORMATION</h2>
          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
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
              />
            ))}
            <textarea
              placeholder="Order notes (optional)"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              style={{ width: "100%", padding: 13, background: "#06030b", border: "1px solid #352043", color: "#fff", outline: "none", minHeight: 80 }}
            />
          </div>
        </div>

        <div className="panel">
          <h2>SHIPPING METHOD</h2>
          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            {SHIPPING_METHODS.map((m) => (
              <label
                key={m.id}
                style={{
                  display: "flex",
                  cursor: "pointer",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: `1px solid ${shippingId === m.id ? "#b33dff" : "#352043"}`,
                  background: shippingId === m.id ? "rgba(155,28,255,.12)" : "#06030b",
                  padding: "12px 14px",
                  fontSize: 11,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="radio" name="shipping" checked={shippingId === m.id} onChange={() => setShippingId(m.id)} style={{ width: "auto" }} />
                  <span>
                    <b style={{ display: "block" }}>{m.label.toUpperCase()}</b>
                    <small style={{ color: "#8e8497" }}>{m.eta}</small>
                  </span>
                </span>
                <span style={{ color: "#d66eff" }}>{formatPrice(m.price, currency, rateToAud)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="summary" style={{ height: "fit-content" }}>
          <h2 style={{ marginBottom: 12 }}>ORDER SUMMARY</h2>
          {items.map((item) => (
            <p key={`${item.id}-${item.variant ?? ""}`}>
              <span>
                {item.name} × {item.quantity}
                {item.variant && <small style={{ display: "block", color: "#8e8497" }}>{item.variant}</small>}
              </span>
              <span>{formatPrice(item.price * item.quantity, currency, rateToAud)}</span>
            </p>
          ))}
          <hr />
          <p>
            <span>SHIPPING</span>
            <span>{formatPrice(shippingMethod.price, currency, rateToAud)}</span>
          </p>
          <p>
            <span>TAX (GST)</span>
            <span>{formatPrice(tax, currency, rateToAud)}</span>
          </p>
          <hr />
          <h3>
            <span>TOTAL</span>
            <span style={{ color: "#d66eff" }}>{formatPrice(total, currency, rateToAud)}</span>
          </h3>
          <p className="smallcaps" style={{ textAlign: "center", marginTop: 16 }}>
            30-DAY EASY RETURNS
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 16, borderTop: "1px solid #2e193e", paddingTop: 16 }}>
            {PAYMENT_ICONS.map((p) => (
              <span key={p} style={{ border: "1px solid #352043", padding: "4px 8px", fontSize: 9, color: "#8e8497" }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p style={{ color: "#ff6b9c", fontSize: 12, marginTop: 16 }}>{error}</p>
      )}

      <button disabled={submitting} className="btn full" style={{ marginTop: 24 }}>
        {submitting ? "PLACING ORDER…" : "PLACE ORDER SECURELY"}
      </button>
    </form>
  );
}
