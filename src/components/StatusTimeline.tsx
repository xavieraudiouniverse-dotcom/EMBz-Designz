import { SHIPPING_STATUS_LABELS, SHIPPING_STATUS_ORDER } from "@/lib/tracking";
import type { ShippingStatus } from "@/types/database";

export default function StatusTimeline({ current }: { current: ShippingStatus }) {
  if (current === "exception") {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Delivery exception — our team has been notified.
      </div>
    );
  }

  const currentIndex = SHIPPING_STATUS_ORDER.indexOf(current as (typeof SHIPPING_STATUS_ORDER)[number]);

  return (
    <ol className="flex flex-col gap-0">
      {SHIPPING_STATUS_ORDER.map((status, i) => {
        const done = i <= currentIndex;
        const isLast = i === SHIPPING_STATUS_ORDER.length - 1;
        return (
          <li key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`h-3 w-3 rounded-full ${
                  done ? "bg-accent shadow-cyan" : "bg-muted"
                } ${i === currentIndex ? "animate-pulse-glow" : ""}`}
              />
              {!isLast && <span className={`w-px flex-1 ${done ? "bg-accent/60" : "bg-border"}`} style={{ minHeight: 28 }} />}
            </div>
            <div className={`pb-6 text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>
              {SHIPPING_STATUS_LABELS[status]}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
