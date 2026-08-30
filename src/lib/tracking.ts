/** Deep-links a tracking number to the right carrier's tracking page. */
export function trackingUrl(carrier: string | null, trackingNumber: string | null): string | null {
  if (!carrier || !trackingNumber) return null;
  const c = carrier.trim().toLowerCase();
  const n = encodeURIComponent(trackingNumber.trim());

  if (c.includes("usps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${n}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
  if (c.includes("dhl")) return `https://www.dhl.com/en/express/tracking.html?AWB=${n}`;
  if (c.includes("australia post") || c.includes("auspost") || c === "ap")
    return `https://auspost.com.au/mypost/track/#/details/${n}`;
  if (c.includes("nz post") || c.includes("new zealand post"))
    return `https://www.nzpost.co.nz/tools/tracking/item/${n}`;

  return `https://www.google.com/search?q=${encodeURIComponent(carrier)}+tracking+${n}`;
}

export const SHIPPING_STATUS_LABELS: Record<string, string> = {
  pending: "Order placed",
  processing: "Processing",
  shipped: "Shipped",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  exception: "Delivery exception",
};

export const SHIPPING_STATUS_ORDER = [
  "pending",
  "processing",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
] as const;
