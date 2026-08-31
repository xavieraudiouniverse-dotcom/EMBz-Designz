"use client";

import { Fragment, useMemo, useState } from "react";
import type { Order } from "@/types/database";
import { formatPrice } from "@/lib/currency";
import { updateShipping, retryFulfillment } from "./actions";

const STATUSES = ["pending", "processing", "shipped", "in_transit", "out_for_delivery", "delivered", "exception"];

const ROW_COLS = "1fr 1.1fr .9fr .9fr .8fr .8fr .6fr";

const STATUS_COLOR: Record<string, string> = {
  pending: "#8c7c92",
  processing: "#ffcf6b",
  shipped: "#6bd0ff",
  in_transit: "#c96aff",
  out_for_delivery: "#3ee6e0",
  delivered: "#62d99b",
  exception: "#ff6b9c",
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? STATUS_COLOR.pending;
  return (
    <span className="status-badge" style={{ color }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

const inputStyle = { background: "#06030b", border: "1px solid #352043", color: "#fff", padding: "9px 12px", fontSize: 11, outline: "none" };

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === "all" || o.shipping_status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.country?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order, customer, country…"
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="table">
        <div className="tr head" style={{ gridTemplateColumns: ROW_COLS }}>
          <span>ORDER</span>
          <span>CUSTOMER</span>
          <span>COUNTRY</span>
          <span>STATUS</span>
          <span>TOTAL</span>
          <span>DATE</span>
          <span />
        </div>
        {filtered.map((o) => (
          <Fragment key={o.id}>
            <div className="tr" style={{ gridTemplateColumns: ROW_COLS, alignItems: "center" }}>
              <span style={{ color: "#c96aff", fontFamily: "monospace" }}>EMBZ-{o.id.slice(0, 8).toUpperCase()}</span>
              <span>{o.customer_name}</span>
              <span style={{ color: "#8e8497" }}>{o.country}</span>
              <span>
                <StatusBadge status={o.shipping_status} />
              </span>
              <span>{formatPrice(o.display_total, o.display_currency as any, 1)}</span>
              <span style={{ color: "#8e8497" }}>{new Date(o.created_at).toLocaleDateString()}</span>
              <span style={{ textAlign: "right" }}>
                <button onClick={() => setExpanded(expanded === o.id ? null : o.id)}>{expanded === o.id ? "CLOSE" : "MANAGE"}</button>
              </span>
            </div>
            {expanded === o.id && (
              <div style={{ borderBottom: "1px solid #241430", background: "rgba(12,6,18,.6)", padding: "18px 15px" }}>
                <form action={updateShipping} style={{ display: "flex", flexWrap: "wrap", alignItems: "end", gap: 12 }}>
                  <input type="hidden" name="order_id" value={o.id} />
                  <div>
                    <label className="smallcaps" style={{ marginBottom: 4 }}>
                      Status
                    </label>
                    <select name="shipping_status" defaultValue={o.shipping_status} style={inputStyle}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="smallcaps" style={{ marginBottom: 4 }}>
                      Carrier
                    </label>
                    <input name="carrier" defaultValue={o.carrier ?? ""} placeholder="e.g. Australia Post" style={inputStyle} />
                  </div>
                  <div>
                    <label className="smallcaps" style={{ marginBottom: 4 }}>
                      Tracking #
                    </label>
                    <input name="tracking_number" defaultValue={o.tracking_number ?? ""} style={inputStyle} />
                  </div>
                  <button className="btn">UPDATE SHIPPING</button>
                </form>
                {o.payment_status === "paid" && (
                  <form action={retryFulfillment} style={{ marginTop: 10 }}>
                    <input type="hidden" name="order_id" value={o.id} />
                    <button className="btn ghost">RETRY MERCHIZE FULFILLMENT</button>
                  </form>
                )}
                <div className="grid gap-1 sm:grid-cols-2" style={{ marginTop: 12, fontSize: 11, color: "#8e8497" }}>
                  <p>{o.customer_email}</p>
                  <p>{o.phone}</p>
                  <p>
                    {o.address_line1}
                    {o.address_line2 ? `, ${o.address_line2}` : ""}
                  </p>
                  <p>
                    {o.city}, {o.postal_code}, {o.country}
                  </p>
                </div>
              </div>
            )}
          </Fragment>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#8e8497", fontSize: 12 }}>No orders match your search.</div>
        )}
      </div>
    </div>
  );
}
