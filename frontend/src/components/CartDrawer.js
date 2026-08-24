import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SmartImage } from "@/components/SmartImage";
import { Price } from "@/components/Price";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, lineKey } = useCart();
  const navigate = useNavigate();

  const goCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0" data-testid="cart-drawer">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="font-serif text-xl flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Your Bag
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Your bag is empty.</p>
            <Button variant="secondary" className="border border-border" onClick={() => { setIsOpen(false); navigate("/shop"); }}>
              Continue shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="px-5 py-4 space-y-4">
                {items.map((it) => {
                  const key = lineKey(it);
                  const attrs = Object.entries(it.attributes || {})
                    .map(([, v]) => v)
                    .join(" / ");
                  return (
                    <div key={key} className="flex gap-3" data-testid="cart-line-item">
                      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                        <SmartImage src={it.image} alt={it.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-serif text-sm leading-snug line-clamp-2">{it.title}</div>
                        {attrs && <div className="text-xs text-muted-foreground mt-0.5">{attrs}</div>}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-lg border border-border">
                            <button className="p-1.5 hover:bg-secondary" onClick={() => updateQuantity(key, it.quantity - 1)} data-testid="cart-quantity-decrease-button">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-3 text-sm tabular-nums">{it.quantity}</span>
                            <button className="p-1.5 hover:bg-secondary" onClick={() => updateQuantity(key, it.quantity + 1)} data-testid="cart-quantity-increase-button">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <Price value={it.price * it.quantity} className="text-sm" />
                        </div>
                      </div>
                      <button className="self-start p-1 text-muted-foreground hover:text-destructive" onClick={() => removeItem(key)} data-testid="cart-remove-button">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <SheetFooter className="px-5 py-4 border-t border-border block">
              <div className="flex items-center justify-between mb-3">
                <span className="label-caps">Subtotal</span>
                <Price value={subtotal} className="text-lg" testId="cart-subtotal" />
              </div>
              <p className="text-xs text-muted-foreground mb-3">Shipping calculated at checkout.</p>
              <Button className="w-full rounded-md bg-neon text-[#07080B] hover:bg-neon/90 shadow-[0_0_22px_rgba(0,229,255,0.28)] font-mono uppercase tracking-widest" onClick={goCheckout} data-testid="cart-checkout-button">
                Checkout
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
