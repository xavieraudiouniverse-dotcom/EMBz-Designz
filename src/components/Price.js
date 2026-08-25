import React from "react";
import { formatUSD } from "@/lib/format";

export const Price = ({ value, from = false, className = "", testId }) => {
  return (
    <span className={`font-sans font-semibold tabular-nums ${className}`} data-testid={testId}>
      {from && <span className="text-xs font-normal text-muted-foreground mr-1">from</span>}
      {formatUSD(value)}
    </span>
  );
};
