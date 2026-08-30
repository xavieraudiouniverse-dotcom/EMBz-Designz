export type CurrencyCode = "AUD" | "NZD";

const SYMBOLS: Record<CurrencyCode, string> = { AUD: "A$", NZD: "NZ$" };

/** priceAud is always the source-of-truth amount stored in the database. */
export function formatPrice(priceAud: number, currency: CurrencyCode, rateToAud: number): string {
  const converted = currency === "AUD" ? priceAud : priceAud / rateToAud;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  })
    .format(converted)
    .replace(/^(\D+)/, SYMBOLS[currency] + " ")
    .trim();
}

export function convert(priceAud: number, currency: CurrencyCode, rateToAud: number): number {
  return currency === "AUD" ? priceAud : Number((priceAud / rateToAud).toFixed(2));
}
