import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  adminListOrders,
  adminGetOrder,
  adminUpdateOrder,
} from "@/lib/orders.admin.functions";
import { formatPrice, resolveImage } from "@/lib/format";
import { X } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Admin · Orders — Pinewood Emporium" }] }),
  component: AdminOrdersPage,
});

const STATUS = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
const PAY_STATUS = ["pending", "paid", "failed", "refunded"] as const;

function statusColor(s: string) {
  switch (s) {
    case "delivered": return "bg-pine/30 text-pine-glow";
    case "shipped": return "bg-teal/30 text-teal";
    case "confirmed": return "bg-purple/30 text-purple";
    case "cancelled": return "bg-destructive/20 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
}

function AdminOrdersPage() {
  const qc = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminListOrders(),
  });

  const [openId, setOpenId] = useState<string | null>(null);
  const { data: detail } = useQuery({
    queryKey: ["admin", "order", openId],
    queryFn: () => adminGetOrder({ data: { id: openId! } }),
    enabled: !!openId,
  });

  const update = useMutation({
    mutationFn: (input: any) => adminUpdateOrder({ data: { id: openId!, ...input } }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "order", openId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-pine-glow">Admin</p>
        <h1 className="mt-2 font-display text-4xl text-cream sm:text-5xl">Orders</h1>
      </header>

      <div className="overflow-x-auto rounded-md border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-card/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Pay</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {orders && orders.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No orders yet.</td></tr>}
            {orders?.map((o: any) => (
              <tr key={o.id} className="cursor-pointer bg-background/50 hover:bg-card/40" onClick={() => setOpenId(o.id)}>
                <td className="px-4 py-3 font-mono text-xs text-cream">{o.order_number || o.id}</td>
                <td className="px-4 py-3 text-cream">
                  {o.shipping_address}
                </td>
                <td className="px-4 py-3 text-cream">{formatPrice(o.total_amount ? o.total_amount * 100 : 0)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{o.payment_method || "CASH"}</span>
                  <div className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${statusColor(o.payment_status || "pending")}`}>{o.payment_status || "pending"}</div>
                </td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${statusColor(o.status || "pending")}`}>{o.status || "pending"}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openId && detail && (
        <OrderDrawer
          detail={detail as any}
          onClose={() => setOpenId(null)}
          onUpdate={(patch) => update.mutate(patch)}
          saving={update.isPending}
        />
      )}
    </div>
  );
}

function OrderDrawer({
  detail, onClose, onUpdate, saving,
}: {
  detail: any;
  onClose: () => void;
  onUpdate: (patch: { status?: string; payment_status?: string; tracking_number?: string | null }) => void;
  saving: boolean;
}) {
  const o = detail.order || detail;
  const items = detail.items || [];
  const [tracking, setTracking] = useState<string>(o.tracking_number ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-background/70 backdrop-blur" onClick={onClose}>
      <aside className="h-screen w-full max-w-lg overflow-y-auto border-l border-border bg-card p-6 shadow-elegant" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Order</p>
            <h2 className="font-mono text-lg text-cream">{o.order_number || o.id}</h2>
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-cream"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-6 space-y-2 text-sm">
          <p className="text-cream">{o.shipping_address}</p>
        </div>

        <div className="mt-6 space-y-3 rounded border border-border/60 p-4">
          {items.map((it: any) => (
            <div key={it.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-cream">{it.title_snapshot || `Product #${it.product}`}</p>
                <p className="text-xs text-muted-foreground">{it.quantity} × {formatPrice(it.price ? it.price * 100 : 0)}</p>
              </div>
              <p className="text-sm text-cream">{formatPrice((it.price ? it.price * 100 : 0) * it.quantity)}</p>
            </div>
          ))}
          <div className="flex justify-between text-base">
            <span className="font-medium text-cream">Total</span>
            <span className="font-medium text-pine-glow">{formatPrice(o.total_amount ? o.total_amount * 100 : 0)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Order status</label>
            <select
              value={o.status || "pending"}
              onChange={(e) => onUpdate({ status: e.target.value })}
              disabled={saving}
              className="mt-1.5 w-full rounded border border-border bg-input px-3 py-2 text-sm text-cream focus:border-pine-glow focus:outline-none"
            >
              {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </aside>
    </div>
  );
}
