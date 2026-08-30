import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { CurrencyProvider } from "@/lib/currency-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AssistantWidget from "@/components/AssistantWidget";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "EMBZ DESIGNZ",
  description: "Premium streetwear — chrome, purple, and cyan.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let nzdRate = 1.08;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("exchange_rates")
      .select("rate_to_aud")
      .eq("currency_code", "NZD")
      .maybeSingle();
    if (data?.rate_to_aud) nzdRate = Number(data.rate_to_aud);
  } catch {
    // Supabase env vars not configured yet — fall back to the default rate.
  }

  return (
    <html lang="en" className="dark">
      <body>
        <CurrencyProvider nzdRate={nzdRate}>
          <CartProvider>
            <Header />
            <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10">{children}</main>
            <Footer />
            <AssistantWidget />
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
