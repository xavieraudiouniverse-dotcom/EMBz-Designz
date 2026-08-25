import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { fetchAdminOrders, orderAction, merchizeHealth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, CheckCircle2, XCircle, PauseCircle, PlayCircle, CircleCheck, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { formatUSD } from "@/lib/format";

const STATUS_STYLE = {
  submitted: "bg-blue-100 text-blue-800",
  pending_review: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  on_hold: "bg-orange-100 text-orange-800",
  cancelled: "bg-rose-100 text-rose-800",
};

export default function AdminDashboard() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("all");
  const [confirm, setConfirm] = useState(null); // {order, action}

  const { data: health } = useQuery({ queryKey: ["merchize-health"], queryFn: merchizeHealth, retry: false });
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders", status],
    queryFn: () => fetchAdminOrders(status),
  });

  const runAction = async (order, action) => {
    try {
      const res = await orderAction(order.external_number, action);
      if (res.success) toast.success(`Order ${action} succeeded`);
      else toast.warning(`Merchize: ${res.message || "action recorded locally"}`);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (e) {
      toast.error(`Failed to ${action} order`);
    } finally {
      setConfirm(null);
    }
  };

  const actionsFor = (order) => [
    { key: "push", label: "Push to fulfillment", icon: CheckCircle2, confirm: true },
    { key: "hold", label: "Hold", icon: PauseCircle },
    { key: "resume", label: "Resume", icon: PlayCircle },
    { key: "cancel", label: "Cancel order", icon: XCircle, confirm: true, danger: true },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and fulfill orders synced with Merchize.</p>
        </div>
        <div className="flex items-center gap-3">
          {health && (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs" data-testid="merchize-health-badge">
              {health.ok ? <CircleCheck className="h-4 w-4 text-emerald-600" /> : <CircleAlert className="h-4 w-4 text-rose-600" />}
              Merchize {health.ok ? "connected" : "error"}
              {health.ok && <span className="text-muted-foreground">· {health.total_base_products} blanks</span>}
            </div>
          )}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]" data-testid="admin-order-status-filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["all", "submitted", "pending_review", "confirmed", "on_hold", "cancelled"].map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (orders || []).length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-serif text-xl">No orders yet</p>
            <p className="text-muted-foreground mt-2 text-sm">Orders placed in your store will appear here.</p>
          </div>
        ) : (
          <Table data-testid="admin-orders-table">
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Merchize</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.external_number} data-testid="admin-order-row">
                  <TableCell className="font-mono text-xs">{o.external_number}</TableCell>
                  <TableCell>
                    <div className="text-sm">{o.shipping_info?.full_name}</div>
                    <div className="text-xs text-muted-foreground">{o.shipping_info?.country}</div>
                  </TableCell>
                  <TableCell className="text-sm">{(o.items || []).reduce((s, i) => s + i.quantity, 0)}</TableCell>
                  <TableCell className="text-sm tabular-nums">{formatUSD(o.total)}</TableCell>
                  <TableCell>
                    {o.merchize_synced
                      ? <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Synced</Badge>
                      : <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Local</Badge>}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs capitalize ${STATUS_STYLE[o.status] || "bg-secondary"}`}>
                      {(o.status || "").replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid="admin-order-actions-menu"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actionsFor(o).map((a) => (
                          <DropdownMenuItem
                            key={a.key}
                            className={a.danger ? "text-destructive focus:text-destructive" : ""}
                            onClick={() => (a.confirm ? setConfirm({ order: o, action: a.key }) : runAction(o, a.key))}
                            data-testid={`admin-action-${a.key}`}
                          >
                            <a.icon className="h-4 w-4 mr-2" /> {a.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="capitalize">{confirm?.action} order?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.action === "cancel"
                ? "This will attempt to cancel the order in Merchize. This cannot be undone."
                : "This will push the order to Merchize for production. Make sure the details are correct."}
              <span className="block mt-2 font-mono text-xs">{confirm?.order?.external_number}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => runAction(confirm.order, confirm.action)}
              className={confirm?.action === "cancel" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              data-testid="admin-order-confirm-button"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
