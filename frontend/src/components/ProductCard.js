import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/Price";
import { SmartImage } from "@/components/SmartImage";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Eye, Plus } from "lucide-react";

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const quickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = (product.variants || [])[0];
    if (!variant) {
      navigate(`/product/${product.id}`);
      return;
    }
    // if product has multiple attribute options, go to PDP to choose
    const hasChoices = (product.attributes || []).some((a) => (a.values || []).length > 1);
    if (hasChoices) {
      navigate(`/product/${product.id}`);
      return;
    }
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
      className="group rounded-2xl border border-border bg-card overflow-hidden block transition-shadow hover:shadow-[0_10px_30px_rgba(42,30,23,0.08)]"
      data-testid="product-card"
    >
      <div className="relative overflow-hidden">
        <AspectRatio ratio={4 / 5}>
          <SmartImage
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
          />
        </AspectRatio>
        {product.category && (
          <Badge className="absolute left-3 top-3 rounded-full bg-card/90 text-foreground border border-border px-2 py-0.5 text-[11px] hover:bg-card">
            {product.category}
          </Badge>
        )}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 translate-y-2 transition-[opacity,transform] duration-200 group-hover:opacity-100 group-hover:translate-y-0">
          <Button
            size="sm"
            className="flex-1 rounded-lg"
            onClick={quickAdd}
            data-testid="product-card-quick-add-button"
          >
            <Plus className="mr-1 h-4 w-4" /> Quick add
          </Button>
          <Button size="sm" variant="secondary" className="rounded-lg border border-border" data-testid="product-card-view-button">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-serif text-base sm:text-lg leading-snug line-clamp-2 min-h-[2.6rem]">
          {product.title}
        </h3>
        <div className="mt-2">
          <Price value={product.price} testId="product-card-price" />
        </div>
      </div>
    </Link>
  );
};
