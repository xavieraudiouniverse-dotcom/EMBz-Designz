import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { CurrencyProvider } from "@/lib/currency-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AssistantWidget from "@/components/AssistantWidget";
import { createClient } from "@/lib/supabase/server";

// Self-hosted at build time (no runtime request to Google) and exposed as
// CSS variables — see tailwind.config.ts `fontFamily.display` / `fontFamily.sans`.
// Anton is what every "font-display" heading, hero title, and the wordmark
// actually renders in; without this the whole cyberpunk type system was
// silently falling back to the browser's default sans-serif.
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

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
    <html lang="en" className={`dark ${anton.variable} ${inter.variable}`}>
      <body>
        <CurrencyProvider nzdRate={nzdRate}>
          <CartProvider>
            <Header />
            <main className="min-h-[70vh]">{children}</main>
            <Footer />
            <AssistantWidget />
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
