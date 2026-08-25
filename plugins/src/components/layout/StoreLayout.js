import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { TickerBanner } from "@/components/MovingBanners";

export const StoreLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <TickerBanner />
      <main className="flex-1">{children}</main>
      <TickerBanner reverse />
      <Footer />
      <CartDrawer />
    </div>
  );
};
