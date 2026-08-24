"""
Merchize API client + helpers.

The Merchize seller API uses a store-specific base URL and a Bearer access token.
Notably it returns HTTP 200 even for logical errors, with a JSON body shaped like:
    { "success": true/false, "data": ..., "message": ... }
"""
import os
import math
import httpx
from typing import Any, Dict, List, Optional

MERCHIZE_BASE_URL = os.environ.get("MERCHIZE_BASE_URL", "").rstrip("/")
MERCHIZE_ACCESS_TOKEN = os.environ.get("MERCHIZE_ACCESS_TOKEN", "")
RETAIL_MARKUP = float(os.environ.get("RETAIL_MARKUP", "2.2"))


class MerchizeError(Exception):
    def __init__(self, status: int, body: Any):
        self.status = status
        self.body = body
        super().__init__(f"Merchize HTTP {status}: {body}")


class MerchizeClient:
    def __init__(self):
        self.base = MERCHIZE_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {MERCHIZE_ACCESS_TOKEN}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    async def request(self, method: str, path: str, **kwargs) -> Dict[str, Any]:
        url = self.base + path
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.request(method, url, headers=self.headers, **kwargs)
        try:
            body = resp.json()
        except ValueError:
            body = {"success": False, "message": resp.text}
        if resp.status_code >= 400:
            raise MerchizeError(resp.status_code, body)
        return body

    # ---- Products ----
    async def catalog(self, page: int = 1, limit: int = 50) -> Dict[str, Any]:
        limit = max(1, min(50, limit))
        return await self.request(
            "GET", "/product/catalog", params={"page": page, "limit": limit}
        )

    async def product_variants(self, product_id: str) -> Dict[str, Any]:
        return await self.request(
            "GET", f"/product/products/{product_id}/all-variants"
        )

    # ---- Orders ----
    async def create_order(self, order: dict) -> Dict[str, Any]:
        return await self.request("POST", "/order/external/orders", json=order)

    async def order_detail(self, **lookup) -> Dict[str, Any]:
        return await self.request(
            "GET", "/order/external/orders/order-detail", params=lookup
        )

    async def tracking(self, **lookup) -> Dict[str, Any]:
        return await self.request(
            "GET", "/order/external/orders/tracking", params=lookup
        )

    async def push(self, lookup: dict) -> Dict[str, Any]:
        return await self.request(
            "POST", "/order/external/orders/push", json={"order": lookup}
        )

    async def cancel(self, lookup: dict) -> Dict[str, Any]:
        return await self.request(
            "POST", "/order/external/orders/cancel", json={"order": lookup}
        )

    async def update_status(self, lookup: dict) -> Dict[str, Any]:
        return await self.request(
            "POST", "/order/external/orders/update-order-status", json={"order": lookup}
        )


merchize = MerchizeClient()


# ---------------------------------------------------------------------------
# Pricing / categorisation / shipping helpers
# ---------------------------------------------------------------------------

def _round_retail(value: float) -> float:
    """Apply markup already applied; return a nice .99-ending retail price."""
    if value <= 0:
        return 0.0
    whole = math.ceil(value)
    return round(whole - 0.01, 2)


def compute_retail(base_cost: Optional[float]) -> float:
    if base_cost is None:
        return 0.0
    return _round_retail(base_cost * RETAIL_MARKUP)


def variant_base_cost(variant: dict) -> Optional[float]:
    tiers = variant.get("tiers") or []
    for t in tiers:
        if t.get("price") is not None:
            return float(t["price"])
    return None


CATEGORY_KEYWORDS = [
    ("Apparel", [
        "shirt", "tee", "t-shirt", "tshirt", "hoodie", "sweatshirt", "tank",
        "jersey", "polo", "jacket", "dress", "legging", "sweater", "crewneck",
        "top", "bodysuit", "romper", "onesie", "pullover", "vest", "shorts",
        "joggers", "pants", "skirt", "kimono", "cardigan",
    ]),
    ("Drinkware", [
        "mug", "tumbler", "bottle", "cup", "glass", "can cooler", "wine",
        "coaster", "flask",
    ]),
    ("Home & Living", [
        "blanket", "pillow", "canvas", "poster", "towel", "rug", "mat",
        "curtain", "bedding", "duvet", "ornament", "candle", "sherpa",
        "quilt", "tapestry", "cushion", "doormat", "clock", "led", "lamp",
        "puzzle", "coaster set", "apron", "frame",
    ]),
    ("Accessories", [
        "bag", "tote", "phone case", "case", "socks", "hat", "cap", "beanie",
        "mask", "keychain", "jewelry", "necklace", "backpack", "pouch",
        "flag", "sticker", "wallet", "scarf", "gloves", "belt", "earring",
        "bracelet", "bandana", "fanny",
    ]),
    ("Footwear", [
        "shoes", "sneakers", "sandals", "boots", "slides", "clogs", "flip flop",
        "loafers",
    ]),
]


def infer_category(title: str) -> str:
    t = (title or "").lower()
    for cat, keywords in CATEGORY_KEYWORDS:
        for kw in keywords:
            if kw in t:
                return cat
    return "Other"


# Country -> Merchize shipping zone
EU_COUNTRIES = {
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
    "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
    "SI", "ES", "SE",
}


def country_to_zone(country: str) -> str:
    c = (country or "").upper()
    if c == "US":
        return "US"
    if c == "GB" or c == "UK":
        return "GB"
    if c == "CA":
        return "CA"
    if c in EU_COUNTRIES:
        return "EU"
    return "ROW"


def variant_shipping_for_zone(variant: dict, zone: str) -> Optional[dict]:
    prices = variant.get("shipping_prices") or []
    match = None
    row = None
    for p in prices:
        z = (p.get("to_zone") or "").upper()
        if z == zone:
            match = p
        if z == "ROW":
            row = p
    chosen = match or row
    if not chosen:
        return None
    return {
        "first_item_price": chosen.get("first_item_price"),
        "additional_item_price": chosen.get("additional_item_price"),
    }


# Estimated transit windows (business days) per zone by service level
TRANSIT_ESTIMATES = {
    "US": {"standard": (5, 8), "express": (2, 3)},
    "GB": {"standard": (6, 10), "express": (3, 4)},
    "EU": {"standard": (7, 12), "express": (3, 5)},
    "CA": {"standard": (7, 12), "express": (3, 5)},
    "ROW": {"standard": (10, 20), "express": (5, 8)},
}


def normalise_product(raw: dict) -> dict:
    """Convert a raw Merchize catalog product into a storefront-friendly doc."""
    variants_raw = raw.get("variants") or []
    variants = []
    min_retail = None
    for v in variants_raw:
        base = variant_base_cost(v)
        retail = compute_retail(base) if base is not None else None
        attrs = {}
        for a in (v.get("attributes") or []):
            attrs[a.get("name")] = {
                "text": a.get("value_text"),
                "code": a.get("value_code"),
                "type": a.get("type"),
            }
        variants.append({
            "id": v.get("_id"),
            "sku": v.get("sku"),
            "attributes": attrs,
            "base_cost": base,
            "retail_price": retail,
            "shipping_prices": v.get("shipping_prices") or [],
        })
        if retail is not None:
            min_retail = retail if min_retail is None else min(min_retail, retail)

    # top-level attributes (for variant selectors)
    attributes = []
    for a in (raw.get("attributes") or []):
        attributes.append({
            "name": a.get("name"),
            "type": a.get("type"),
            "values": [{"text": x.get("text"), "code": x.get("code")}
                       for x in (a.get("values") or [])],
        })

    title = raw.get("title") or ""
    return {
        "id": raw.get("_id"),
        "sku": raw.get("sku"),
        "slug": raw.get("slug"),
        "title": title,
        "category": infer_category(title),
        "thumbnail": raw.get("thumbnail_link"),
        "production_time": raw.get("production_time") or {},
        "fulfillment_location": raw.get("fulfillment_location") or {},
        "attributes": attributes,
        "variants": variants,
        "from_price": min_retail,
    }
