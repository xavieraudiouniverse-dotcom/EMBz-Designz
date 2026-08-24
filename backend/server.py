from fastapi import FastAPI, APIRouter, HTTPException, Query, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from merchize import (
    merchize,
    MerchizeError,
    normalise_product,
    compute_retail,
    infer_category,
    country_to_zone,
    variant_shipping_for_zone,
    TRANSIT_ESTIMATES,
    RETAIL_MARKUP,
)

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="EMBZ Designs Storefront API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("embz")

SYNC_STATE: Dict[str, Any] = {"running": False, "synced": 0, "total": 0,
                              "last_run": None, "error": None}


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class ShippingInfo(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = ""
    address_1: str
    address_2: Optional[str] = ""
    city: str
    state: Optional[str] = ""
    postcode: str
    country: str  # ISO alpha-2


class ImportProductRequest(BaseModel):
    base_product_id: str
    title: Optional[str] = None
    description: Optional[str] = ""
    category: Optional[str] = None
    price: Optional[float] = None                 # single retail price for all variants
    design_images: List[str] = Field(default_factory=list)   # artwork / mockups shown in store
    design_front: Optional[str] = None            # printable artwork URL sent to Merchize
    variant_ids: Optional[List[str]] = None       # subset of base variants (None = all)
    published: bool = True


class UpdateProductRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    design_images: Optional[List[str]] = None
    design_front: Optional[str] = None
    published: Optional[bool] = None


class QuoteItem(BaseModel):
    store_product_id: str
    variant_id: Optional[str] = None
    quantity: int = 1


class ShippingQuoteRequest(BaseModel):
    country: str
    items: List[QuoteItem]


class CheckoutItem(BaseModel):
    store_product_id: str
    variant_id: str
    quantity: int = 1


class CheckoutRequest(BaseModel):
    shipping_info: ShippingInfo
    items: List[CheckoutItem]
    shipping_method: str = "standard"
    shipping_cost: float = 0.0
    notes: Optional[str] = ""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _serialize(doc: dict) -> dict:
    out = {}
    for k, v in (doc or {}).items():
        if k == "_id":
            continue
        out[k] = v.isoformat() if isinstance(v, datetime) else v
    return out


# ---------------------------------------------------------------------------
# Base catalog sync (ADMIN library only - NOT the storefront)
# ---------------------------------------------------------------------------
async def sync_catalog():
    if SYNC_STATE["running"]:
        return
    SYNC_STATE.update({"running": True, "synced": 0, "total": 0, "error": None})
    try:
        page, limit, total, synced = 1, 50, None, 0
        while True:
            body = await merchize.catalog(page=page, limit=limit)
            data = body.get("data") or {}
            products = data.get("products") or []
            if total is None:
                total = data.get("total") or 0
                SYNC_STATE["total"] = total
            if not products:
                break
            for raw in products:
                doc = normalise_product(raw)
                if not doc.get("id"):
                    continue
                await db.catalog.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
                synced += 1
            SYNC_STATE["synced"] = synced
            if len(products) < limit or (total and synced >= total):
                break
            page += 1
        SYNC_STATE["last_run"] = datetime.now(timezone.utc).isoformat()
        logger.info(f"Catalog sync complete: {synced} base products")
    except Exception as e:
        SYNC_STATE["error"] = str(e)
        logger.exception("Catalog sync failed")
    finally:
        SYNC_STATE["running"] = False


# ---------------------------------------------------------------------------
# Health / integration
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "EMBZ Designs Storefront API", "status": "ok"}


@api_router.get("/merchize/health")
async def merchize_health():
    try:
        body = await merchize.catalog(page=1, limit=1)
        return {"ok": True, "merchize_success": body.get("success"),
                "total_base_products": (body.get("data") or {}).get("total"),
                "markup": RETAIL_MARKUP}
    except MerchizeError as e:
        raise HTTPException(status_code=502, detail={"provider": "merchize", "error": e.body})


# ---------------------------------------------------------------------------
# ADMIN: base-product library (browse Merchize blanks to import)
# ---------------------------------------------------------------------------
@api_router.post("/admin/sync-catalog")
async def admin_sync_catalog(background_tasks: BackgroundTasks):
    if SYNC_STATE["running"]:
        return {"started": False, "message": "Sync already running", "state": SYNC_STATE}
    background_tasks.add_task(sync_catalog)
    return {"started": True, "message": "Base catalog sync started"}


@api_router.get("/admin/sync-status")
async def admin_sync_status():
    count = await db.catalog.count_documents({})
    return {**SYNC_STATE, "base_products_in_db": count}


@api_router.get("/admin/catalog")
async def admin_catalog(query: Optional[str] = None, category: Optional[str] = None,
                        page: int = Query(1, ge=1), limit: int = Query(24, ge=1, le=60)):
    q: Dict[str, Any] = {}
    if category and category.lower() != "all":
        q["category"] = category
    if query:
        q["title"] = {"$regex": re.escape(query), "$options": "i"}
    total = await db.catalog.count_documents(q)
    skip = (page - 1) * limit
    items = await db.catalog.find(q, {"_id": 0}).sort("title", 1).skip(skip).limit(limit).to_list(limit)
    return {"products": items, "total": total, "page": page, "limit": limit,
            "pages": (total + limit - 1) // limit if limit else 0}


@api_router.get("/admin/catalog/categories")
async def admin_catalog_categories():
    rows = await db.catalog.aggregate([
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]).to_list(100)
    return [{"name": r["_id"], "count": r["count"]} for r in rows if r["_id"]]


@api_router.get("/admin/catalog/{base_id}")
async def admin_catalog_detail(base_id: str):
    doc = await db.catalog.find_one({"id": base_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Base product not found")
    return doc


# ---------------------------------------------------------------------------
# ADMIN: store products (import / manage published items)
# ---------------------------------------------------------------------------
@api_router.post("/admin/store-products")
async def create_store_product(req: ImportProductRequest):
    base = await db.catalog.find_one({"id": req.base_product_id}, {"_id": 0})
    if not base:
        raise HTTPException(status_code=404, detail="Base product not found. Sync the catalog first.")

    base_variants = base.get("variants") or []
    if req.variant_ids:
        selected = [v for v in base_variants if v.get("id") in req.variant_ids]
    else:
        selected = base_variants
    if not selected:
        selected = base_variants

    price = req.price
    if price is None:
        price = base.get("from_price") or 0.0

    # rebuild attribute options from selected variants
    attr_values: Dict[str, Dict[str, dict]] = {}
    for v in selected:
        for name, info in (v.get("attributes") or {}).items():
            attr_values.setdefault(name, {})
            code = info.get("code")
            attr_values[name][code] = {"text": info.get("text"), "code": code,
                                       "type": info.get("type")}
    attributes = [{"name": n, "values": list(vals.values())} for n, vals in attr_values.items()]

    design_images = list(req.design_images or [])
    thumbnail = design_images[0] if design_images else base.get("thumbnail")

    store_variants = []
    for v in selected:
        store_variants.append({
            "id": v.get("id"),
            "sku": v.get("sku"),
            "attributes": v.get("attributes") or {},
            "base_cost": v.get("base_cost"),
            "retail_price": price,
            "shipping_prices": v.get("shipping_prices") or [],
        })

    doc = {
        "id": uuid.uuid4().hex,
        "base_product_id": base.get("id"),
        "base_product_sku": base.get("sku"),
        "base_title": base.get("title"),
        "title": req.title or base.get("title"),
        "description": req.description or "",
        "category": req.category or base.get("category") or "Other",
        "price": price,
        "design_images": design_images,
        "design_front": req.design_front or (design_images[0] if design_images else None),
        "thumbnail": thumbnail,
        "attributes": attributes,
        "variants": store_variants,
        "production_time": base.get("production_time") or {},
        "fulfillment_location": base.get("fulfillment_location") or {},
        "published": req.published,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    await db.store_products.insert_one(doc)
    return _serialize(doc)


@api_router.get("/admin/store-products")
async def admin_list_store_products():
    items = await db.store_products.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [_serialize(i) for i in items]


@api_router.put("/admin/store-products/{product_id}")
async def update_store_product(product_id: str, req: UpdateProductRequest):
    existing = await db.store_products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Store product not found")
    updates: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc)}
    for field in ["title", "description", "category", "published"]:
        val = getattr(req, field)
        if val is not None:
            updates[field] = val
    if req.design_images is not None:
        updates["design_images"] = req.design_images
        if req.design_images:
            updates["thumbnail"] = req.design_images[0]
    if req.design_front is not None:
        updates["design_front"] = req.design_front
    if req.price is not None:
        updates["price"] = req.price
        variants = existing.get("variants") or []
        for v in variants:
            v["retail_price"] = req.price
        updates["variants"] = variants
    await db.store_products.update_one({"id": product_id}, {"$set": updates})
    doc = await db.store_products.find_one({"id": product_id}, {"_id": 0})
    return _serialize(doc)


@api_router.delete("/admin/store-products/{product_id}")
async def delete_store_product(product_id: str):
    res = await db.store_products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Store product not found")
    return {"deleted": True, "id": product_id}


# ---------------------------------------------------------------------------
# STOREFRONT (public) - only published store products
# ---------------------------------------------------------------------------
@api_router.get("/categories")
async def get_categories():
    rows = await db.store_products.aggregate([
        {"$match": {"published": True}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]).to_list(100)
    return [{"name": r["_id"], "count": r["count"]} for r in rows if r["_id"]]


@api_router.get("/products")
async def get_products(query: Optional[str] = None, category: Optional[str] = None,
                       sort: str = "featured", page: int = Query(1, ge=1),
                       limit: int = Query(24, ge=1, le=60)):
    q: Dict[str, Any] = {"published": True}
    if category and category.lower() != "all":
        q["category"] = category
    if query:
        q["title"] = {"$regex": re.escape(query), "$options": "i"}
    sort_map = {
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "title_asc": [("title", 1)],
        "newest": [("created_at", -1)],
        "featured": [("created_at", -1)],
    }
    sort_spec = sort_map.get(sort, sort_map["featured"])
    total = await db.store_products.count_documents(q)
    skip = (page - 1) * limit
    items = await db.store_products.find(q, {"_id": 0}).sort(sort_spec).skip(skip).limit(limit).to_list(limit)
    return {"products": [_serialize(i) for i in items], "total": total, "page": page,
            "limit": limit, "pages": (total + limit - 1) // limit if limit else 0}


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    doc = await db.store_products.find_one({"id": product_id, "published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return _serialize(doc)


# ---------------------------------------------------------------------------
# Shipping quote (cheapest / fastest) from real Merchize per-zone rates
# ---------------------------------------------------------------------------
async def _load_store_map(product_ids: List[str]) -> Dict[str, dict]:
    ids = list(set(product_ids))
    docs = await db.store_products.find({"id": {"$in": ids}}, {"_id": 0}).to_list(len(ids) or 1)
    return {d["id"]: d for d in docs}


def _resolve_variant(product: dict, variant_id: Optional[str]) -> Optional[dict]:
    variants = product.get("variants") or []
    if variant_id:
        v = next((x for x in variants if x.get("id") == variant_id), None)
        if v:
            return v
    return variants[0] if variants else None


def _compute_base_shipping(items, zone, product_map) -> Optional[float]:
    first_prices, additional_total, total_units, found = [], 0.0, 0, False
    for it in items:
        product = product_map.get(it.store_product_id)
        if not product:
            continue
        variant = _resolve_variant(product, it.variant_id)
        if not variant:
            continue
        ship = variant_shipping_for_zone(variant, zone)
        if not ship:
            continue
        fp = float(ship.get("first_item_price") or 0.0)
        ap = float(ship.get("additional_item_price") or 0.0)
        found = True
        for _ in range(it.quantity):
            total_units += 1
            first_prices.append(fp)
            additional_total += ap
    if not found or total_units == 0:
        return None
    max_first = max(first_prices) if first_prices else 0.0
    avg_additional = additional_total / total_units
    remaining = additional_total - avg_additional  # first unit not charged additional
    return round(max_first + remaining, 2)


def _max_production_time(items, product_map) -> int:
    mx = 3
    for it in items:
        p = product_map.get(it.store_product_id)
        if p:
            mx = max(mx, int((p.get("production_time") or {}).get("max") or 3))
    return mx


@api_router.post("/shipping/quote")
async def shipping_quote(req: ShippingQuoteRequest):
    if not req.items:
        raise HTTPException(status_code=400, detail="No items provided")
    zone = country_to_zone(req.country)
    product_map = await _load_store_map([i.store_product_id for i in req.items])
    base = _compute_base_shipping(req.items, zone, product_map)
    if base is None:
        base = 9.99
    prod = _max_production_time(req.items, product_map)
    transit = TRANSIT_ESTIMATES.get(zone, TRANSIT_ESTIMATES["ROW"])
    std_min, std_max = prod + transit["standard"][0], prod + transit["standard"][1]
    exp_min, exp_max = prod + transit["express"][0], prod + transit["express"][1]
    standard_cost = round(base, 2)
    express_cost = round(base * 2 + 8, 2)
    options = [
        {"id": "standard", "name": "Standard Shipping", "cost": standard_cost,
         "eta_min_days": std_min, "eta_max_days": std_max,
         "eta_label": f"{std_min}\u2013{std_max} business days", "tag": "cheapest"},
        {"id": "express", "name": "Express Shipping", "cost": express_cost,
         "eta_min_days": exp_min, "eta_max_days": exp_max,
         "eta_label": f"{exp_min}\u2013{exp_max} business days", "tag": "fastest"},
    ]
    return {"zone": zone, "country": req.country.upper(), "production_time_days": prod,
            "cheapest": "standard", "fastest": "express", "options": options}


# ---------------------------------------------------------------------------
# Checkout -> create real Merchize external order (with printable design)
# ---------------------------------------------------------------------------
@api_router.post("/checkout")
async def checkout(req: CheckoutRequest):
    if not req.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    product_map = await _load_store_map([i.store_product_id for i in req.items])

    external_number = "EMBZ-" + uuid.uuid4().hex[:10].upper()
    si = req.shipping_info

    merchize_items, local_items, subtotal = [], [], 0.0
    for it in req.items:
        product = product_map.get(it.store_product_id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {it.store_product_id} not found")
        variant = _resolve_variant(product, it.variant_id)
        if not variant:
            raise HTTPException(status_code=400, detail="Variant not found")
        price = float(product.get("price") or variant.get("retail_price") or 0.0)
        subtotal += price * it.quantity
        attrs = [{"name": k, "option": (info.get("text") if isinstance(info, dict) else info)}
                 for k, info in (variant.get("attributes") or {}).items()]
        merchize_items.append({
            "name": product.get("title"),
            "product_id": product.get("base_product_sku"),
            "sku": variant.get("sku"),
            "merchize_sku": variant.get("sku"),
            "quantity": it.quantity,
            "price": price,
            "currency": "USD",
            "image": product.get("thumbnail"),
            "design_front": product.get("design_front"),
            "attributes": attrs,
        })
        local_items.append({
            "store_product_id": it.store_product_id,
            "title": product.get("title"),
            "variant_id": variant.get("id"),
            "variant_sku": variant.get("sku"),
            "quantity": it.quantity,
            "price": price,
            "image": product.get("thumbnail"),
            "attributes": {k: (v.get("text") if isinstance(v, dict) else v)
                           for k, v in (variant.get("attributes") or {}).items()},
        })

    subtotal = round(subtotal, 2)
    total = round(subtotal + (req.shipping_cost or 0.0), 2)

    payload = {
        "order_id": external_number,
        "identifier": "embz",
        "shipping_info": {
            "full_name": si.full_name, "address_1": si.address_1,
            "address_2": si.address_2 or "", "city": si.city, "state": si.state or "",
            "postcode": si.postcode, "country": si.country.upper(),
            "email": si.email, "phone": si.phone or "",
        },
        "items": merchize_items,
        "shipping_method": req.shipping_method,
        "tags": ["embz-storefront"],
        "note": req.notes or "",
    }

    merchize_ok, merchize_message, merchize_response = False, None, None
    try:
        resp = await merchize.create_order(payload)
        merchize_response = resp
        merchize_ok = bool(resp.get("success"))
        merchize_message = resp.get("message")
    except MerchizeError as e:
        merchize_message = f"Merchize error {e.status}: {e.body}"
        logger.error(merchize_message)
    except Exception as e:  # noqa
        merchize_message = str(e)
        logger.exception("Checkout failed")

    order_doc = {
        "external_number": external_number,
        "identifier": "embz",
        "status": "submitted" if merchize_ok else "pending_review",
        "merchize_synced": merchize_ok,
        "merchize_message": merchize_message,
        "shipping_info": payload["shipping_info"],
        "items": local_items,
        "shipping_method": req.shipping_method,
        "shipping_cost": req.shipping_cost or 0.0,
        "subtotal": subtotal, "total": total, "notes": req.notes or "",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "merchize_response": merchize_response,
    }
    await db.orders.insert_one(order_doc)

    return {"success": True, "external_number": external_number,
            "merchize_synced": merchize_ok, "merchize_message": merchize_message,
            "subtotal": subtotal, "shipping_cost": req.shipping_cost or 0.0,
            "total": total, "status": order_doc["status"]}


# ---------------------------------------------------------------------------
# Order lookup + tracking (customer)
# ---------------------------------------------------------------------------
@api_router.get("/orders/{external_number}")
async def get_order(external_number: str):
    local = await db.orders.find_one({"external_number": external_number}, {"_id": 0})
    merchize_detail = None
    try:
        resp = await merchize.order_detail(external_number=external_number)
        if resp.get("success"):
            merchize_detail = resp.get("data")
    except Exception:
        pass
    if not local and not merchize_detail:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"local": _serialize(local) if local else None, "merchize": merchize_detail}


@api_router.get("/orders/{external_number}/tracking")
async def get_order_tracking(external_number: str):
    local = await db.orders.find_one({"external_number": external_number}, {"_id": 0})
    tracking, merchize_message = None, None
    try:
        resp = await merchize.tracking(external_number=external_number)
        if resp.get("success"):
            tracking = resp.get("data")
        else:
            merchize_message = resp.get("message")
    except Exception as e:
        merchize_message = str(e)
    return {"external_number": external_number,
            "status": (local or {}).get("status") if local else None,
            "tracking": tracking, "message": merchize_message,
            "local": _serialize(local) if local else None}


# ---------------------------------------------------------------------------
# Admin order management
# ---------------------------------------------------------------------------
@api_router.get("/admin/orders")
async def admin_orders(status: Optional[str] = None):
    q = {}
    if status and status != "all":
        q["status"] = status
    orders = await db.orders.find(q, {"_id": 0, "merchize_response": 0}).sort("created_at", -1).limit(500).to_list(500)
    return [_serialize(o) for o in orders]


async def _admin_action(external_number: str, action: str, new_status: str):
    order = await db.orders.find_one({"external_number": external_number})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    lookup = {"order_id": external_number, "identifier": "embz"}
    result = {"success": False, "message": None}
    try:
        if action == "push":
            resp = await merchize.push(lookup)
        elif action == "cancel":
            resp = await merchize.cancel(lookup)
        elif action in ("hold", "resume"):
            resp = await merchize.update_status({**lookup, "action": action})
        else:
            raise HTTPException(status_code=400, detail="Unknown action")
        result["success"] = bool(resp.get("success"))
        result["message"] = resp.get("message")
    except MerchizeError as e:
        result["message"] = f"Merchize error {e.status}: {e.body}"
    except Exception as e:  # noqa
        result["message"] = str(e)
    await db.orders.update_one({"external_number": external_number},
                               {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}})
    return {"external_number": external_number, "action": action,
            "new_status": new_status, **result}


@api_router.post("/admin/orders/{external_number}/push")
async def admin_push(external_number: str):
    return await _admin_action(external_number, "push", "confirmed")


@api_router.post("/admin/orders/{external_number}/cancel")
async def admin_cancel(external_number: str):
    return await _admin_action(external_number, "cancel", "cancelled")


@api_router.post("/admin/orders/{external_number}/hold")
async def admin_hold(external_number: str):
    return await _admin_action(external_number, "hold", "on_hold")


@api_router.post("/admin/orders/{external_number}/resume")
async def admin_resume(external_number: str):
    return await _admin_action(external_number, "resume", "submitted")


# ---------------------------------------------------------------------------
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware, allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"], allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.catalog.create_index("id", unique=True)
    await db.catalog.create_index("category")
    await db.catalog.create_index("title")
    await db.store_products.create_index("id", unique=True)
    await db.store_products.create_index("published")
    await db.store_products.create_index("category")
    await db.orders.create_index("external_number", unique=True)
    count = await db.catalog.count_documents({})
    if count == 0:
        logger.info("Base catalog empty - launching background sync")
        asyncio.create_task(sync_catalog())


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
