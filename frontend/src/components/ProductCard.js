import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/Price";
import { SmartImage } from "@/components/SmartImage";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const quickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = (product.variants || [])[0];
    if (!variant) return navigate(`/product/${product.id}`);
    const hasChoices = (product.attributes || []).some((a) => (a.values || []).length > 1);
    if (hasChoices) return navigate(`/product/${product.id}`);
    addItem({
      store_product_id: product.id,
      variant_id: variant.id,
      variant_sku: variant.sku,
      title: product.title,
      price: product.price,
      image: product.thumbnail,
      attributes: Object.fromEntries(
        Object.entries(variant.attributes || {}).map(([k, v]) => [k, v.text || v])
      ),
      quantity: 1,
    });
    toast.success("Added to bag", { description: product.title });
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative rounded-xl border border-border bg-card overflow-hidden block transition-all duration-200 hover:border-neon/60 hover:neon-border"
      data-testid="product-card"
    >
      <div className="relative overflow-hidden">
        <AspectRatio ratio={4 / 5}>
          <SmartImage
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        </AspectRatio>
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080B]/70 via-transparent to-transparent opacity-70" />
        {product.category && (
          <span className="absolute left-3 top-3 rounded-sm bg-[#07080B]/80 border border-neon/40 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-neon">
            {product.category}
          </span>
        )}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 translate-y-2 transition-[opacity,transform] duration-200 group-hover:opacity-100 group-hover:translate-y-0">
          <Button
            size="sm"
            className="flex-1 rounded-md bg-neon text-[#07080B] hover:bg-neon/90 shadow-[0_0_22px_rgba(0,229,255,0.28)] font-mono uppercase tracking-widest text-xs"
            onClick={quickAdd}
            data-testid="product-card-quick-add-button"
          >
            <Plus className="mr-1 h-4 w-4" /> Quick add
          </Button>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-display text-lg sm:text-xl leading-none tracking-wide line-clamp-2 min-h-[2.2rem] text-foreground">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <Price value={product.price} testId="product-card-price" className="text-neon" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Drop</span>
        </div>
      </div>
    </Link>
  );
};
