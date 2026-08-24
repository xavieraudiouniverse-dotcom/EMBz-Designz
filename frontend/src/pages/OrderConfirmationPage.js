import React from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchOrder } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SmartImage } from "@/components/SmartImage";
import { Price } from "@/components/Price";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Package, Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function OrderConfirmationPage() {
  const { externalNumber } = useParams();
  const location = useLocation();
  const passed = location.state?.order;

  const { data, isLoading } = useQuery({
    queryKey: ["order", externalNumber],
    queryFn: () => fetchOrder(externalNumber),
  });

  const local = data?.local;
  const items = local?.items || [];
  const synced = passed?.merchize_synced ?? local?.merchize_synced;

  const copy = () => {
    navigator.clipboard.writeText(externalNumber);
    toast.success("Order number copied");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-mustard/20 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-mustard" />
        </div>
        <h1 className="font-serif text-3xl mt-4">Thank you for your order</h1>
        <p className="text-muted-foreground mt-2">
          We’ve received your order and it’s being prepared for production.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-l-4 border-mustard px-5 py-4 flex items-center justify-between">
          <div>
            <div className="label-caps">Order number</div>
            <div className="font-mono text-lg" data-testid="order-confirmation-number">{externalNumber}</div>
          </div>
          <Button variant="secondary" size="sm" className="border border-border" onClick={copy} data-testid="copy-order-number">
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
        </div>
        <Separator className="bg-border/70" />

        {synced === false && (
          <div className="m-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive" />
            <span>Your order was saved but is pending review with our fulfillment partner. We’ll confirm shortly.</span>
          </div>
        )}

        <div className="p-5">
          {isLoading ? (
            <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
          ) : (
            <div className="space-y-3">
              {items.map((it, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-16 w-14 overflow-hidden rounded-md border border-border bg-secondary">
                    <SmartImage src={it.image} alt={it.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-serif">{it.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {Object.values(it.attributes || {}).join(" / ")} · Qty {it.quantity}
                    </div>
                  </div>
                  <Price value={it.price * it.quantity} className="text-sm" />
                </div>
              ))}
            </div>
          )}

          {local && (
            <>
              <Separator className="my-4 bg-border/70" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><Price value={local.subtotal} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping ({local.shipping_method})</span><Price value={local.shipping_cost} /></div>
                <div className="flex justify-between font-serif text-base pt-1"><span>Total</span><Price value={local.total} /></div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="rounded-xl"><Link to={`/track?order=${externalNumber}`}><Package className="h-4 w-4 mr-2" /> Track this order</Link></Button>
        <Button asChild variant="secondary" className="rounded-xl border border-border"><Link to="/shop">Continue shopping</Link></Button>
      </div>
    </div>
  );
}
