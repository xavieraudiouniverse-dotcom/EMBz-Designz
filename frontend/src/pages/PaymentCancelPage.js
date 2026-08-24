import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center"><XCircle className="h-7 w-7 text-rose" /></div>
        <h1 className="mt-5 font-display text-3xl tracking-wide">PAYMENT CANCELLED</h1>
        <p className="mt-2 text-sm text-muted-foreground font-sans">
          No charge was made and your bag is still saved. Ready when you are.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button asChild className="rounded-md bg-neon text-[#07080B] hover:bg-neon/90 shadow-[0_0_22px_rgba(0,229,255,0.28)] font-mono uppercase tracking-widest"><Link to="/checkout">Return to checkout</Link></Button>
          <Button asChild variant="outline" className="rounded-md border-border bg-transparent"><Link to="/shop">Keep shopping</Link></Button>
        </div>
      </div>
    </div>
  );
}
