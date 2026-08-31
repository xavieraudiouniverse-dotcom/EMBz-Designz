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
    <div className="page" style={{ textAlign: "center" }}>
      <p className="eyebrow">LIVE TRACKING</p>
      <h1 style={{ fontSize: 38, textShadow: "0 0 15px #7b20bd" }}>TRACK THE MOVEMENT</h1>
      <p style={{ maxWidth: 480, margin: "12px auto 0", color: "#d8c9e2", fontSize: 13 }}>
        Enter your order number to see exactly where your drop is right now.
      </p>

      <form onSubmit={handleTrack} className="track-form">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="EMBZ-92B473"
          style={{ textTransform: "uppercase" }}
        />
        <button disabled={loading} className="btn" style={{ marginLeft: 10 }}>
          {loading ? "TRACKING…" : "TRACK ORDER"}
        </button>
      </form>
      {error && <p style={{ color: "#ff6b9c", fontSize: 12 }}>{error}</p>}

      {result && (
        <div className="track-result" style={{ marginTop: 40, textAlign: "left" }}>
          <div className="timeline">
            <p className="smallcaps">ORDER</p>
            <p style={{ fontSize: 22, color: "#fff" }}>{result.code}</p>
            {result.first_name && (
              <p className="smallcaps" style={{ marginTop: 4 }}>
                Thanks for the order, {result.first_name}!
              </p>
            )}
            <div style={{ marginTop: 20 }}>
              {SHIPPING_STATUS_ORDER.map((status, i) => {
                const done = i <= stageIndex;
                const current = i === stageIndex;
                return (
                  <div key={status} className={`step ${done ? "complete" : ""} ${current ? "current" : ""}`}>
                    <i>{done ? "✓" : i + 1}</i>
                    <div>
                      <b style={{ color: done ? "#fff" : "#75687d" }}>{SHIPPING_STATUS_LABELS[status]}</b>
                    </div>
                  </div>
                );
              })}
            </div>
            {url && (
              <a href={url} target="_blank" rel="noreferrer" className="text-link" style={{ marginTop: 12, display: "inline-block" }}>
                Track with {result.carrier} →
              </a>
            )}
          </div>
          <div>
            <InteractiveGlobe points={points} routes={routes} />
            <div className="location">
              <div>
                <span>CURRENT STATUS</span>
                <b>{SHIPPING_STATUS_LABELS[result.shipping_status]}</b>
              </div>
              <div>
                <span>DESTINATION</span>
                <b>{result.destination_country ?? "—"}</b>
              </div>
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
