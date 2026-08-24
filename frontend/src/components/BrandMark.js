import React from "react";
import { Link } from "react-router-dom";

export const BrandMark = ({ className = "" }) => {
  return (
    <Link to="/" className={`inline-flex flex-col leading-none ${className}`} data-testid="brand-mark">
      <span className="font-serif text-xl sm:text-2xl font-700 tracking-[-0.02em] text-foreground">
        EMBZ<span className="text-mustard">.</span>
      </span>
      <span className="label-caps mt-0.5 text-[10px]">Existeance</span>
    </Link>
  );
};
