import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchTracking } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SmartImage } from "@/components/SmartImage";
import { Loader2, Package, Search, MapPin, Truck } from "lucide-react";

const STATUS_LABELS = {
  submitted: "Order received",
  pending_review: "Pending review",
  confirmed: "Confirmed · in production",
  on_hold: "On hold",
  cancelled: "Cancelled",
};

export default function TrackingPage() {
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("order") || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const lookup = async (num) => {
    const value = (num ?? orderNumber).trim();
    if (!value) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchTracking(value);
      setResult(data);
    } catch (e) {
      setError("We couldn’t find that order. Please check the number and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.get("order")) lookup(params.get("order"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const local = result?.local;
  const tracking = result?.tracking;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="label-caps mb-2">Order status</div>
      <h1 className="font-serif text-3xl sm:text-4xl mb-2">Track your order</h1>
      <p className="text-muted-foreground mb-6">Enter your order number (starts with EMBZ-) to see the latest status.</p>

      <form onSubmit={(e) => { e.preventDefault(); lookup(); }} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Label htmlFor="order" className="sr-only">Order number</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="order" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="EMBZ-XXXXXXXXXX" className="pl-9 h-11 font-mono" data-testid="order-tracking-input" />
          </div>
        </div>
        <Button type="submit" className="h-11 rounded-xl" disabled={loading} data-testid="order-tracking-submit-button">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track order"}
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}

      {result && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-5" data-testid="order-tracking-status">
          <div className="flex items-center justify-between">
            <div>
              <div className="label-caps">Order</div>
              <div className="font-mono text-lg">{result.external_number}</div>
            </div>
            <Badge className="rounded-full bg-secondary text-foreground border border-border capitalize">
              {STATUS_LABELS[result.status] || result.status || "Unknown"}
            </Badge>
          </div>

          <Separator className="my-4 bg-border/70" />

          {/* Timeline */}
          <div className="space-y-4">
            {[
              { key: "submitted", label: "Order received", icon: Package },
              { key: "confirmed", label: "In production", icon: Truck },
              { key: "shipped", label: "Shipped", icon: MapPin },
            ].map((step, idx) => {
              const reached =
                (result.status === "submitted" && idx === 0) ||
                (result.status === "confirmed" && idx <= 1) ||
                (tracking && idx <= 2);
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center ${reached ? "bg-neon text-[#07080B]" : "bg-secondary text-muted-foreground"}`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className={reached ? "font-medium" : "text-muted-foreground"}>{step.label}</span>
                </div>
              );
            })}
          </div>

          {tracking ? (
            <div className="mt-5 rounded-lg border border-border p-3 text-sm">
              <div className="font-medium mb-1">Tracking details</div>
              <pre className="whitespace-pre-wrap break-words text-xs text-muted-foreground font-mono">{JSON.stringify(tracking, null, 2)}</pre>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              {result.message === "Order not found."
                ? "Tracking will appear here once your order ships."
                : (result.message || "Tracking will appear here once your order ships.")}
            </p>
          )}

          {local?.items?.length > 0 && (
            <>
              <Separator className="my-4 bg-border/70" />
              <div className="space-y-3">
                {local.items.map((it, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-14 w-12 overflow-hidden rounded-md border border-border bg-secondary">
                      <SmartImage src={it.image} alt={it.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 text-sm">
                      <div className="font-serif">{it.title}</div>
                      <div className="text-xs text-muted-foreground">Qty {it.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
