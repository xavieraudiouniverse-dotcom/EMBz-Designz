import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { paymentStatus } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Heart, AlertTriangle } from "lucide-react";

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [state, setState] = useState("checking"); // checking | paid | timeout | error
  const attempts = useRef(0);

  useEffect(() => {
    if (!sessionId) { setState("error"); return; }
    let active = true;
    const poll = async () => {
      if (!active) return;
      attempts.current += 1;
      try {
        const res = await paymentStatus(sessionId);
        if (res.payment_status === "paid" && res.external_number) {
          clearCart();
          setState("paid");
          setTimeout(() => navigate(`/order/${res.external_number}`), 1200);
          return;
        }
        if (res.payment_status === "expired") { setState("error"); return; }
      } catch (e) { /* keep polling */ }
      if (attempts.current >= 12) { setState("timeout"); return; }
      setTimeout(poll, 2000);
    };
    poll();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="relative max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-30" />
        <div className="relative">
          {state === "checking" && (
            <>
              <Loader2 className="mx-auto h-10 w-10 text-neon animate-spin" />
              <h1 className="mt-5 font-display text-3xl tracking-wide">CONFIRMING PAYMENT</h1>
              <p className="mt-2 text-sm text-muted-foreground font-sans">Sealing your order with love — hang tight.</p>
            </>
          )}
          {state === "paid" && (
            <>
              <div className="mx-auto h-14 w-14 rounded-full bg-neon/20 flex items-center justify-center neon-border"><CheckCircle2 className="h-7 w-7 text-neon" /></div>
              <h1 className="mt-5 font-display text-3xl tracking-wide">PAYMENT CONFIRMED <Heart className="inline h-6 w-6 text-rose" fill="currentColor" /></h1>
              <p className="mt-2 text-sm text-muted-foreground font-sans">Redirecting to your order…</p>
            </>
          )}
          {(state === "timeout" || state === "error") && (
            <>
              <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center"><AlertTriangle className="h-7 w-7 text-rose" /></div>
              <h1 className="mt-5 font-display text-3xl tracking-wide">ALMOST THERE</h1>
              <p className="mt-2 text-sm text-muted-foreground font-sans">
                {state === "error"
                  ? "We couldn’t confirm this payment session."
                  : "Your payment is processing. It can take a moment — check your order status shortly."}
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Button asChild className="rounded-md bg-neon text-[#07080B] hover:bg-neon/90 shadow-[0_0_22px_rgba(0,229,255,0.28)] font-mono uppercase tracking-widest"><Link to="/track">Track my order</Link></Button>
                <Button asChild variant="outline" className="rounded-md border-border bg-transparent"><Link to="/shop">Back to shop</Link></Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
