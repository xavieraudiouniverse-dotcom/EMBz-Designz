"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { CurrencyCode } from "@/lib/currency";

type CurrencyValue = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  rateToAud: number;
};

const CurrencyContext = createContext<CurrencyValue | null>(null);
const STORAGE_KEY = "embz-currency-v1";

export function CurrencyProvider({
  children,
  nzdRate,
}: {
  children: ReactNode;
  nzdRate: number;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("AUD");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (stored === "AUD" || stored === "NZD") setCurrencyState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  };

  const rateToAud = currency === "AUD" ? 1 : nzdRate;

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rateToAud }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
