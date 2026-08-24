import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchProduct } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { SmartImage } from "@/components/SmartImage";
import { Price } from "@/components/Price";
import { toast } from "sonner";
import { ChevronLeft, Clock, Truck, ShoppingBag, Check } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
    retry: false,
  });

  const [selected, setSelected] = useState({});
  const [activeImg, setActiveImg] = useState(0);

  // initialise default selections when product loads
  const attributes = product?.attributes || [];
  React.useEffect(() => {
    if (product) {
      const init = {};
      (product.attributes || []).forEach((a) => {
        if ((a.values || []).length) init[a.name] = a.values[0].code;
      });
      setSelected(init);
      setActiveImg(0);
    }
  }, [product]);

  const matchedVariant = useMemo(() => {
    if (!product) return null;
    const variants = product.variants || [];
    if (attributes.length === 0) return variants[0] || null;
    return (
      variants.find((v) =>
        attributes.every((a) => (v.attributes?.[a.name]?.code) === selected[a.name])
      ) || null
    );
  }, [product, selected, attributes]);

  const images = product?.design_images?.length ? product.design_images : (product?.thumbnail ? [product.thumbnail] : []);

  const handleAdd = () => {
    if (!matchedVariant) {
      toast.error("Please select an available option");
      return;
    }
    addItem({
      store_product_id: product.id,
      variant_id: matchedVariant.id,
      variant_sku: matchedVariant.sku,
      title: product.title,
      price: product.price,
      image: product.thumbnail,
      attributes: Object.fromEntries(
        Object.entries(matchedVariant.attributes || {}).map(([k, v]) => [k, v.text || v])
      ),
      quantity: 1,
    });
    toast.success("Added to bag", { description: product.title });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-2 gap-10">
        <Skeleton className="aspect-[4/5] rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-2xl">Product not found</h1>
        <Button asChild className="mt-4 rounded-xl"><Link to="/shop">Back to shop</Link></Button>
      </div>
    );
  }

  const pt = product.production_time || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <Button asChild variant="ghost" className="mb-4 -ml-2"><Link to="/shop"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Link></Button>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
            <AspectRatio ratio={4 / 5}>
              <SmartImage src={images[activeImg]} alt={product.title} className="h-full w-full object-cover" />
            </AspectRatio>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`h-20 w-16 overflow-hidden rounded-lg border ${i === activeImg ? "border-mustard" : "border-border"}`}>
                  <SmartImage src={img} alt="thumb" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy box */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="label-caps mb-2">{product.category}</div>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-[-0.01em] leading-tight" data-testid="pdp-title">
            {product.title}
          </h1>
          <div className="mt-4">
            <Price value={product.price} className="text-2xl" testId="pdp-price" />
          </div>

          {product.description && (
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <Separator className="my-6 bg-border/70" />

          {/* Variant selectors */}
          <div className="space-y-5">
            {attributes.map((attr) => (
              <div key={attr.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="label-caps">{attr.name}</span>
                  <span className="text-sm text-muted-foreground capitalize">
                    {attr.values.find((v) => v.code === selected[attr.name])?.text}
                  </span>
                </div>
                <RadioGroup
                  value={selected[attr.name] ?? attr.values?.[0]?.code ?? ""}
                  onValueChange={(val) => setSelected((s) => ({ ...s, [attr.name]: val }))}
                  className="flex flex-wrap gap-2"
                  data-testid={`pdp-${attr.name}-options`}
                >
                  {attr.values.map((v) => (
                    <label key={v.code} htmlFor={`${attr.name}-${v.code}`} className="cursor-pointer">
                      <RadioGroupItem id={`${attr.name}-${v.code}`} value={v.code} className="peer sr-only" />
                      <span className="inline-flex min-w-[3rem] justify-center items-center rounded-lg border border-border bg-card px-3 py-2 text-sm capitalize transition-colors peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary hover:bg-secondary">
                        {v.text}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            {matchedVariant ? (
              <span className="inline-flex items-center gap-1 text-[color:var(--success,#2F6B4F)]"><Check className="h-4 w-4" /> In stock · made to order</span>
            ) : (
              <span className="text-destructive">This combination is unavailable</span>
            )}
          </div>

          <Button
            size="lg"
            className="mt-5 w-full rounded-xl"
            onClick={handleAdd}
            disabled={!matchedVariant}
            data-testid="pdp-add-to-cart-button"
          >
            <ShoppingBag className="mr-2 h-5 w-5" /> Add to bag
          </Button>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3">
              <Clock className="h-4 w-4 mt-0.5 text-mustard" />
              <div className="text-sm">
                <div className="font-medium">Production</div>
                <div className="text-muted-foreground">{pt.min || 1}–{pt.max || 3} business days</div>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3">
              <Truck className="h-4 w-4 mt-0.5 text-mustard" />
              <div className="text-sm">
                <div className="font-medium">Shipping</div>
                <div className="text-muted-foreground">Cheapest &amp; fastest at checkout</div>
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="details">
              <AccordionTrigger className="font-serif">Product details</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {product.description || "Made-to-order premium print-on-demand product, fulfilled by Merchize."}
                <div className="mt-2">Fulfilled from: {product.fulfillment_location?.name || "Global"}</div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger className="font-serif">Shipping &amp; returns</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Every item is made on demand and shipped worldwide. Choose the
                cheapest or fastest shipping option at checkout based on your
                destination.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
