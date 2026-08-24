import React from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";

export const Footer = () => {
  return (
    <footer className="mt-16 border-t border-border bg-card/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <BrandMark />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Premium custom apparel & print-on-demand, crafted on demand and
              shipped worldwide.
            </p>
          </div>
          <div>
            <div className="label-caps mb-3">Shop</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/shop" className="hover:text-foreground">All Products</Link></li>
              <li><Link to="/shop?category=Apparel" className="hover:text-foreground">Apparel</Link></li>
              <li><Link to="/shop?category=Home %26 Living" className="hover:text-foreground">Home &amp; Living</Link></li>
              <li><Link to="/shop?category=Accessories" className="hover:text-foreground">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <div className="label-caps mb-3">Support</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/track" className="hover:text-foreground">Track Order</Link></li>
              <li><span className="opacity-70">Shipping &amp; Returns</span></li>
              <li><span className="opacity-70">Contact</span></li>
            </ul>
          </div>
          <div>
            <div className="label-caps mb-3">Studio</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/admin" className="hover:text-foreground">Admin</Link></li>
              <li><span className="opacity-70">Powered by Merchize</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/60 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} EMBZ Designs · Existeance. All rights reserved.</span>
          <span>Made on demand · Worldwide shipping</span>
        </div>
      </div>
    </footer>
  );
};
