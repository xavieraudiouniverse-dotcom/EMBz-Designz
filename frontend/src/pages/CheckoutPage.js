import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { getShippingQuote, startPayment } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { SmartImage } from "@/components/SmartImage";
import { Price } from "@/components/Price";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Truck, Zap, Loader2, ShoppingBag } from "lucide-react";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IE", name: "Ireland" },
  { code: "SG", name: "Singapore" },
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", address_1: "", address_2: "",
    city: "", state: "", postcode: "", country: "US",
  });
  const [notes, setNotes] = useState("");
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const fetchQuote = async (country) => {
    if (!items.length) return;
    setQuoting(true);
    try {
      const payload = {
        country,
        items: items.map((i) => ({
          store_product_id: i.store_product_id,
          variant_id: i.variant_id,
          quantity: i.quantity,
        })),
      };
      const q = await getShippingQuote(payload);
      setQuote(q);
      setShippingMethod(q.cheapest || "standard");
    } catch (e) {
      toast.error("Could not fetch shipping options");
    } finally {
      setQuoting(false);
    }
  };

  React.useEffect(() => {
    if (items.length) fetchQuote(form.country);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCountryChange = (c) => {
    set("country", c);
    fetchQuote(c);
  };

  const selectedOption = quote?.options?.find((o) => o.id === shippingMethod);
  const shippingCost = selectedOption?.cost || 0;
  const total = subtotal + shippingCost;

  const required = ["full_name", "email", "address_1", "city", "postcode", "country"];
  const isValid = required.every((k) => (form[k] || "").trim().length > 0);

  const placeOrder = async () => {
    setError(null);
    if (!isValid) {
      setError("Please fill in all required fields.");
      return;
    }
    setPlacing(true);
    try {
      const payload = {
        shipping_info: form,
        items: items.map((i) => ({
          store_product_id: i.store_product_id,
          variant_id: i.variant_id,
          quantity: i.quantity,
        })),
        shipping_method: shippingMethod,
        notes,
        origin_url: window.location.origin,
      };
      const res = await startPayment(payload);
      if (res.checkout_url) {
        // hand off to Stripe hosted checkout; order is created only after payment
        window.location.href = res.checkout_url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e) {
      setError(e?.response?.data?.detail || "Could not start secure checkout. Please try again.");
      toast.error("Checkout failed");
      setPlacing(false);
    }
  };

  if (!items.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground" />
        <h1 className="font-serif text-2xl mt-4">Your bag is empty</h1>
        <Button asChild className="mt-4 rounded-xl"><Link to="/shop">Continue shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-serif text-3xl sm:text-4xl mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        {/* Form */}
        <form className="space-y-6" data-testid="checkout-shipping-form" onSubmit={(e) => e.preventDefault()}>
          <div>
            <h2 className="font-serif text-xl mb-4">Shipping details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full name *" id="full_name" value={form.full_name} onChange={(v) => set("full_name", v)} testId="checkout-full-name" />
              <Field label="Email *" id="email" type="email" value={form.email} onChange={(v) => set("email", v)} testId="checkout-email" />
              <Field label="Phone" id="phone" value={form.phone} onChange={(v) => set("phone", v)} testId="checkout-phone" />
              <div className="sm:col-span-2">
                <Field label="Address line 1 *" id="address_1" value={form.address_1} onChange={(v) => set("address_1", v)} testId="checkout-address1" />
              </div>
              <div className="sm:col-span-2">
                <Field label="Address line 2" id="address_2" value={form.address_2} onChange={(v) => set("address_2", v)} testId="checkout-address2" />
              </div>
              <Field label="City *" id="city" value={form.city} onChange={(v) => set("city", v)} testId="checkout-city" />
              <Field label="State / Region" id="state" value={form.state} onChange={(v) => set("state", v)} testId="checkout-state" />
              <Field label="Postal code *" id="postcode" value={form.postcode} onChange={(v) => set("postcode", v)} testId="checkout-postcode" />
              <div>
                <Label className="mb-1.5 block text-sm">Country *</Label>
                <Select value={form.country} onValueChange={onCountryChange}>
                  <SelectTrigger data-testid="checkout-country-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Shipping method */}
          <div>
            <h2 className="font-serif text-xl mb-4">Shipping method</h2>
            {quoting ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Calculating options for {form.country}…</div>
            ) : (
              <div className="space-y-3" data-testid="checkout-shipping-method-radio">
                {(quote?.options || []).map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setShippingMethod(opt.id)}
                    className={`w-full flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${shippingMethod === opt.id ? "border-primary bg-secondary" : "border-border hover:bg-secondary/60"}`}
                    data-testid={`shipping-option-${opt.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {opt.id === "express" ? <Zap className="h-5 w-5 text-neon" /> : <Truck className="h-5 w-5 text-neon" />}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {opt.name}
                          <span className="text-[10px] uppercase tracking-wide rounded-full bg-neon/20 text-foreground px-2 py-0.5">{opt.tag}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{opt.eta_label}</div>
                      </div>
                    </div>
                    <Price value={opt.cost} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes" className="mb-1.5 block text-sm">Order notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions" data-testid="checkout-notes" />
          </div>
        </form>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-serif text-xl mb-4">Order summary</h2>
            <div className="space-y-3 max-h-72 overflow-auto hide-scrollbar">
              {items.map((it, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="h-16 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                    <SmartImage src={it.image} alt={it.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-serif line-clamp-2">{it.title}</div>
                    <div className="text-xs text-muted-foreground">Qty {it.quantity}</div>
                  </div>
                  <Price value={it.price * it.quantity} className="text-sm" />
                </div>
              ))}
            </div>
            <Separator className="my-4 bg-border/70" />
            <Row label="Subtotal" value={subtotal} />
            <Row label="Shipping" value={shippingCost} testId="summary-shipping" />
            <Separator className="my-4 bg-border/70" />
            <div className="flex items-center justify-between">
              <span className="font-serif text-lg">Total</span>
              <Price value={total} className="text-lg" testId="summary-total" />
            </div>

            {error && <p className="mt-3 text-sm text-destructive" role="alert" data-testid="checkout-error-message">{String(error)}</p>}

            <Button className="mt-5 w-full rounded-md bg-neon text-[#07080B] hover:bg-neon/90 shadow-[0_0_22px_rgba(0,229,255,0.28)] font-mono uppercase tracking-widest" size="lg" onClick={placeOrder} disabled={placing || quoting} data-testid="checkout-place-order-button">
              {placing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting to payment…</> : <>Pay &amp; place order · <Price value={total} className="ml-1" /></>}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground text-center font-sans">
              Secure card payment via Stripe. Your Merchize order is created only after payment succeeds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, id, value, onChange, type = "text", testId }) => (
  <div>
    <Label htmlFor={id} className="mb-1.5 block text-sm">{label}</Label>
    <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
  </div>
);

const Row = ({ label, value, testId }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-sm text-muted-foreground">{label}</span>
    <Price value={value} className="text-sm" testId={testId} />
  </div>
);
