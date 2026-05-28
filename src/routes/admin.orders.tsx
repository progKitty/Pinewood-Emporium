import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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
  const listFn = useServerFn(adminListOrders);
  const getFn = useServerFn(adminGetOrder);
  const updateFn = useServerFn(adminUpdateOrder);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => listFn(),
  });

  const [openId, setOpenId] = useState<string | null>(null);
  const { data: detail } = useQuery({
    queryKey: ["admin", "order", openId],
    queryFn: () => getFn({ data: { id: openId! } }),
    enabled: !!openId,
  });

  const update = useMutation({
    mutationFn: (input: any) => updateFn({ data: input }),
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
            {orders?.map((o) => (
              <tr key={o.id} className="cursor-pointer bg-background/50 hover:bg-card/40" onClick={() => setOpenId(o.id)}>
                <td className="px-4 py-3 font-mono text-xs text-cream">{o.order_number}</td>
                <td className="px-4 py-3 text-cream">
                  {o.shipping_full_name}
                  <div className="text-xs text-muted-foreground">{o.shipping_city}</div>
                </td>
                <td className="px-4 py-3 text-cream">{formatPrice(o.total_cents)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{o.payment_method}</span>
                  <div className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${statusColor(o.payment_status)}`}>{o.payment_status}</div>
                </td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${statusColor(o.status)}`}>{o.status}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openId && detail && (
        <OrderDrawer
          detail={detail}
          onClose={() => setOpenId(null)}
          onUpdate={(patch) => update.mutate({ id: openId, ...patch })}
          saving={update.isPending}
        />
      )}
    </div>
  );
}

function OrderDrawer({
  detail, onClose, onUpdate, saving,
}: {
  detail: { order: any; items: any[] };
  onClose: () => void;
  onUpdate: (patch: { status?: string; payment_status?: string; tracking_number?: string | null }) => void;
  saving: boolean;
}) {
  const o = detail.order;
  const [tracking, setTracking] = useState<string>(o.tracking_number ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-background/70 backdrop-blur" onClick={onClose}>
      <aside className="h-screen w-full max-w-lg overflow-y-auto border-l border-border bg-card p-6 shadow-elegant" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Order</p>
            <h2 className="font-mono text-lg text-cream">{o.order_number}</h2>
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-cream"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-6 space-y-2 text-sm">
          <p className="text-cream">{o.shipping_full_name} · {o.shipping_phone}</p>
          <p className="text-muted-foreground">
            {o.shipping_line1}{o.shipping_line2 ? `, ${o.shipping_line2}` : ""}<br />
            {o.shipping_city}{o.shipping_district ? `, ${o.shipping_district}` : ""} {o.shipping_postal_code ?? ""}<br />
            {o.shipping_country}
          </p>
          {o.notes && <p className="mt-2 rounded bg-background/50 p-2 text-xs text-muted-foreground whitespace-pre-wrap">{o.notes}</p>}
        </div>

        <div className="mt-6 space-y-3 rounded border border-border/60 p-4">
          {detail.items.map((it: any) => (
            <div key={it.id} className="flex items-center gap-3">
              <img src={resolveImage(it.image_snapshot)} alt="" className="h-12 w-12 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-cream">{it.title_snapshot}</p>
                <p className="text-xs text-muted-foreground">{it.qty} × {formatPrice(it.unit_price_cents)}</p>
              </div>
              <p className="text-sm text-cream">{formatPrice(it.line_total_cents)}</p>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-border/60 pt-3 text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-cream">{formatPrice(o.shipping_cents)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="font-medium text-cream">Total</span>
            <span className="font-medium text-pine-glow">{formatPrice(o.total_cents)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Order status</label>
            <select
              value={o.status}
              onChange={(e) => onUpdate({ status: e.target.value })}
              disabled={saving}
              className="mt-1.5 w-full rounded border border-border bg-input px-3 py-2 text-sm text-cream focus:border-pine-glow focus:outline-none"
            >
              {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Payment status</label>
            <select
              value={o.payment_status}
              onChange={(e) => onUpdate({ payment_status: e.target.value })}
              disabled={saving}
              className="mt-1.5 w-full rounded border border-border bg-input px-3 py-2 text-sm text-cream focus:border-pine-glow focus:outline-none"
            >
              {PAY_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Tracking number</label>
            <div className="mt-1.5 flex gap-2">
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="e.g. RX-12345-BD"
                className="flex-1 rounded border border-border bg-input px-3 py-2 text-sm text-cream focus:border-pine-glow focus:outline-none"
              />
              <button
                onClick={() => onUpdate({ tracking_number: tracking.trim() || null })}
                disabled={saving}
                className="rounded-full bg-primary px-4 py-2 text-xs uppercase tracking-wider text-primary-foreground hover:bg-pine-glow disabled:opacity-60"
              >Save</button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
