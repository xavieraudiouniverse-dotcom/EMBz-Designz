"use client";

import { useCurrency } from "@/lib/currency-context";
import type { CurrencyCode } from "@/lib/currency";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex overflow-hidden rounded-full border border-border text-xs">
      {(["AUD", "NZD"] as CurrencyCode[]).map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          className={`px-2.5 py-1 transition ${
            currency === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
