import React from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-16 border-t border-border bg-[#07080B]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <BrandMark />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Hip-hop street art turned wearable. From struggle to strength,
              printed on demand and sealed with love. <Heart className="inline h-3 w-3 text-rose" fill="currentColor" />
            </p>
          </div>
          <div>
            <div className="label-caps mb-3">Shop</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/shop" className="hover:text-neon">All Drops</Link></li>
              <li><Link to="/shop?category=Apparel" className="hover:text-neon">Apparel</Link></li>
              <li><Link to="/shop?category=Home %26 Living" className="hover:text-neon">Home &amp; Living</Link></li>
              <li><Link to="/shop?category=Accessories" className="hover:text-neon">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <div className="label-caps mb-3">Support</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/track" className="hover:text-neon">Track Order</Link></li>
              <li><span className="opacity-70">Shipping &amp; Returns</span></li>
              <li><span className="opacity-70">Contact</span></li>
            </ul>
          </div>
          <div>
            <div className="label-caps mb-3">Studio</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/admin" className="hover:text-neon">Admin</Link></li>
              <li><span className="opacity-70">Powered by Merchize</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/60 text-xs font-mono uppercase tracking-widest text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} EMBZ · Existeance</span>
          <span>Made on demand · Sealed with love</span>
        </div>
      </div>
    </footer>
  );
};
