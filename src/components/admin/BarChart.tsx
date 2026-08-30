"use client";

import { useId, useState } from "react";

export type BarDatum = { label: string; value: number; formattedValue?: string };

/**
 * Horizontal bar chart, single sequential hue. Direct value labels (no legend needed —
 * one series). Per-bar hover tooltip. Values are the "job" here (magnitude comparison
 * across named categories), so one hue throughout — never a hue per bar.
 */
export default function BarChart({
  data,
  color = "#9b5cf0",
  emptyLabel = "No data yet",
}: {
  data: BarDatum[];
  color?: string;
  emptyLabel?: string;
}) {
  const uid = useId();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const pct = Math.max(2, (d.value / max) * 100);
        return (
          <div
            key={`${uid}-${d.label}`}
            className="relative"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover((h) => (h === i ? null : h))}
          >
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{d.label}</span>
              <span className={hover === i ? "text-foreground" : "text-muted-foreground"}>
                {d.formattedValue ?? d.value}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: color,
                  opacity: hover === null || hover === i ? 1 : 0.55,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
