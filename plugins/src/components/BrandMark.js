import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export const BrandMark = ({ className = "" }) => {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 leading-none ${className}`} data-testid="brand-mark">
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md bg-neon text-[#0C0B09] neon-border">
        <Heart className="h-4 w-4" fill="currentColor" />
      </span>
      <span className="flex flex-col">
        <span className="font-display text-2xl sm:text-3xl leading-[0.8] tracking-wide text-foreground">
          EMBZ<span className="rose-text">♥</span>
        </span>
        <span className="label-caps text-[9px] mt-1">Existeance · Struggle to Strength</span>
      </span>
    </Link>
  );
};
