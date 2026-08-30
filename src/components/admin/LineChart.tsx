"use client";

import { useMemo, useState } from "react";

export type LinePoint = { label: string; value: number };

/**
 * Single-series line + area chart with a hover crosshair/tooltip. One hue (sequential —
 * this is a magnitude-over-time job, not identity), thin 2px line, recessive gridlines.
 */
export default function LineChart({
  data,
  color = "#9b5cf0",
  formatValue = (v: number) => String(v),
  height = 160,
}: {
  data: LinePoint[];
  color?: string;
  formatValue?: (v: number) => string;
  height?: number;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 600;
  const padding = 8;

  const { points, max, min } = useMemo(() => {
    const values = data.map((d) => d.value);
    const max = Math.max(1, ...values);
    const min = Math.min(0, ...values);
    const range = max - min || 1;
    const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
    const points = data.map((d, i) => ({
      x: padding + step * i,
      y: height - padding - ((d.value - min) / range) * (height - padding * 2),
      ...d,
    }));
    return { points, max, min };
  }, [data, height]);

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet</p>;
  }

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  const active = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        onMouseLeave={() => setHoverIndex(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * width;
          let closest = 0;
          let closestDist = Infinity;
          points.forEach((p, i) => {
            const dist = Math.abs(p.x - x);
            if (dist < closestDist) {
              closestDist = dist;
              closest = i;
            }
          });
          setHoverIndex(closest);
        }}
      >
        {/* recessive gridline */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} />

        <path d={areaPath} fill={color} fillOpacity={0.12} stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {active && (
          <>
            <line x1={active.x} y1={0} x2={active.x} y2={height} stroke={color} strokeOpacity={0.35} strokeWidth={1} />
            <circle cx={active.x} cy={active.y} r={4} fill={color} stroke="#0c0a10" strokeWidth={2} />
          </>
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-border bg-card px-2 py-1 text-xs shadow-lg"
          style={{ left: `${(active.x / width) * 100}%` }}
        >
          <p className="text-muted-foreground">{active.label}</p>
          <p className="font-medium text-foreground">{formatValue(active.value)}</p>
        </div>
      )}
    </div>
  );
}
