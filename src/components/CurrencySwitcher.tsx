"use client";

import { useCurrency } from "@/lib/currency-context";
import type { CurrencyCode } from "@/lib/currency";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="currency-switch">
      {(["AUD", "NZD"] as CurrencyCode[]).map((c) => (
        <button key={c} onClick={() => setCurrency(c)} className={currency === c ? "active" : ""}>
          {c}
        </button>
      ))}
    </div>
  );
}
