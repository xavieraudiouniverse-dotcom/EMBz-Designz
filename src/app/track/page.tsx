"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import InteractiveGlobe, { type GlobePoint, type GlobeRoute } from "@/components/InteractiveGlobe";
import { SHIPPING_STATUS_LABELS, SHIPPING_STATUS_ORDER, trackingUrl } from "@/lib/tracking";
import { latLonForCountry } from "@/lib/geo";
import type { ShippingStatus } from "@/types/database";

type TrackResult = {
  id: string;
  code: string;
  shipping_status: ShippingStatus;
  carrier: string | null;
  tracking_number: string | null;
  first_name: string | null;
  destination_country: string | null;
  created_at: string;
};

const ORIGIN = { lat: -33.87, lon: 151.21, label: "Sydney, AU" };

function TrackForm() {
  const params = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("order") ?? "");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/track?id=${encodeURIComponent(orderNumber.trim())}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Order not found");
      } else {
        setResult(json);
      }
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  }

  const stageIndex = result ? SHIPPING_STATUS_ORDER.indexOf(result.shipping_status as any) : -1;
  const dest = latLonForCountry(result?.destination_country ?? null);
  const progress = stageIndex <= 0 ? 0 : stageIndex / (SHIPPING_STATUS_ORDER.length - 1);
  const current = {
    lat: ORIGIN.lat + (dest.lat - ORIGIN.lat) * progress,
    lon: ORIGIN.lon + (dest.lon - ORIGIN.lon) * progress,
  };

  const points: GlobePoint[] = result
    ? [
        { ...ORIGIN, tone: "cyan" },
        { lat: current.lat, lon: current.lon, label: "Current location", tone: "purple" },
        { lat: dest.lat, lon: dest.lon, label: result.destination_country ?? "Destination", tone: "cyan" },
      ]
    : [];
  const routes: GlobeRoute[] = result ? [{ from: points[0], to: points[2], tone: "purple" }] : [];

  const url = result ? trackingUrl(result.carrier, result.tracking_number) : null;

  return (
    <div className="space-y-10">
      <div className="text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.35em] text-accent">Live tracking</p>
        <h1 className="shimmer-text font-display text-4xl md:text-5xl">Track the movement</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Enter your order number to see exactly where your drop is right now.
        </p>
      </div>

      <form onSubmit={handleTrack} className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-3">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="EMBZ-92B473"
          className="min-w-0 flex-1 rounded-full border border-border bg-card px-4 py-3 text-sm uppercase tracking-wide"
        />
        <button disabled={loading} className="btn-primary-glow">
          {loading ? "Tracking…" : "Track order"}
        </button>
      </form>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}

      {result && (
        <div className="grid gap-8 md:grid-cols-[1fr_1.3fr]">
          <div className="panel-metal rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Order</p>
            <p className="font-display text-xl text-foreground">{result.code}</p>
            {result.first_name && (
              <p className="mt-1 text-sm text-muted-foreground">Thanks for the order, {result.first_name}!</p>
            )}
            <ol className="mt-6 flex flex-col gap-0">
              {SHIPPING_STATUS_ORDER.map((status, i) => {
                const done = i <= stageIndex;
                const isLast = i === SHIPPING_STATUS_ORDER.length - 1;
                return (
                  <li key={status} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`h-3 w-3 rounded-full ${done ? "bg-accent shadow-cyan" : "bg-muted"} ${i === stageIndex ? "animate-pulse-glow" : ""}`} />
                      {!isLast && <span className={`w-px flex-1 ${done ? "bg-accent/60" : "bg-border"}`} style={{ minHeight: 26 }} />}
                    </div>
                    <div className={`pb-5 text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>
                      {SHIPPING_STATUS_LABELS[status]}
                    </div>
                  </li>
                );
              })}
            </ol>
            {url && (
              <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-accent hover:underline">
                Track with {result.carrier} →
              </a>
            )}
          </div>
          <div className="panel-metal edge-glow relative overflow-hidden rounded-2xl p-4">
            <div className="aspect-[2/1] w-full">
              <InteractiveGlobe points={points} routes={routes} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Current location: {SHIPPING_STATUS_LABELS[result.shipping_status]}</span>
              <span>Destination: {result.destination_country ?? "—"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={null}>
      <TrackForm />
    </Suspense>
  );
}
