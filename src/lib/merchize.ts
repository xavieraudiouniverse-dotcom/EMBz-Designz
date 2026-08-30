/**
 * Thin client for Merchize's REST API (merchize.com — print-on-demand fulfillment).
 * There's no public API spec, so this isolates request/response shaping in one place —
 * once you have real docs or a Postman collection from seller.merchize.com, adjust the
 * paths/fields below rather than touching every caller.
 */

const BASE_URL = process.env.MERCHIZE_API_BASE || "https://open.merchize.com/api/v1";
const API_KEY = process.env.MERCHIZE_API_KEY;

function assertConfigured() {
  if (!API_KEY) {
    throw new Error("MERCHIZE_API_KEY is not set — add it to your environment variables.");
  }
}

async function merchizeFetch(path: string, init?: RequestInit) {
  assertConfigured();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Merchize API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export type MerchizeProduct = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  images?: string[];
  variants?: Array<{ id: string; sku?: string; price?: number }>;
};

export async function getMerchizeProduct(productId: string): Promise<MerchizeProduct> {
  const json = await merchizeFetch(`/products/${encodeURIComponent(productId)}`);
  // NOTE: adjust this mapping once real response shapes are known.
  return json.data ?? json;
}

export async function listMerchizeProducts(params?: Record<string, string>): Promise<MerchizeProduct[]> {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  const json = await merchizeFetch(`/products${qs}`);
  return json.data ?? json.items ?? [];
}

export type MerchizeOrderPayload = {
  externalOrderId: string;
  customer: { name: string; email: string; phone?: string };
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: Array<{ merchizeProductId: string; quantity: number }>;
};

export async function pushMerchizeOrder(payload: MerchizeOrderPayload): Promise<{ merchizeOrderId?: string }> {
  const json = await merchizeFetch("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { merchizeOrderId: json.data?.id ?? json.id };
}
