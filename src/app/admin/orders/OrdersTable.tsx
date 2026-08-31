"use client";

import { Fragment, useMemo, useState } from "react";
import type { Order } from "@/types/database";
import { formatPrice } from "@/lib/currency";
import { updateShipping, retryFulfillment } from "./actions";

const STATUSES = ["pending", "processing", "shipped", "in_transit", "out_for_delivery", "delivered", "exception"];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-500/15 text-slate-300",
  processing: "bg-amber-500/15 text-amber-300",
  shipped: "bg-blue-500/15 text-blue-300",
  in_transit: "bg-primary/15 text-primary",
  out_for_delivery: "bg-accent/15 text-accent",
  delivered: "bg-emerald-500/15 text-emerald-300",
  exception: "bg-destructive/15 text-destructive",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${STATUS_STYLES[status] ?? STATUS_STYLES.pending}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order, customer, country…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <Fragment key={o.id}>
                <tr className="border-t border-border hover:bg-card/60">
                  <td className="px-4 py-3 font-mono text-xs text-accent">EMBZ-{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">{o.customer_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.country}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.shipping_status} />
                  </td>
                  <td className="px-4 py-3">{formatPrice(o.display_total, o.display_currency as any, 1)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                      className="text-xs text-accent hover:underline"
                    >
                      {expanded === o.id ? "Close" : "Manage"}
                    </button>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr className="border-t border-border bg-card/40">
                    <td colSpan={7} className="px-4 py-4">
                      <form action={updateShipping} className="flex flex-wrap items-end gap-3">
                        <input type="hidden" name="order_id" value={o.id} />
                        <div>
                          <label className="block text-xs text-muted-foreground">Status</label>
                          <select name="shipping_status" defaultValue={o.shipping_status} className="rounded border border-border bg-background px-3 py-2 text-sm">
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground">Carrier</label>
                          <input name="carrier" defaultValue={o.carrier ?? ""} placeholder="e.g. Australia Post" className="rounded border border-border bg-background px-3 py-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground">Tracking #</label>
                          <input name="tracking_number" defaultValue={o.tracking_number ?? ""} className="rounded border border-border bg-background px-3 py-2 text-sm" />
                        </div>
                        <button className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
                          Update shipping
                        </button>
                      </form>
                      {o.payment_status === "paid" && (
                        <form action={retryFulfillment} className="mt-3">
                          <input type="hidden" name="order_id" value={o.id} />
                          <button className="rounded-full border border-accent px-5 py-2 text-xs font-semibold text-accent hover:bg-accent/10">
                            Retry Merchize fulfillment
                          </button>
                        </form>
                      )}
                      <div className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
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
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No orders match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
