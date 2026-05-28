import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyOrder } from "@/lib/orders.functions";
import { formatPrice, resolveImage } from "@/lib/format";
import { PineLoader } from "@/components/site/PineLoader";
import { CheckCircle2, Package, Truck } from "lucide-react";

export const Route = createFileRoute("/order/$id")({
  head: () => ({ meta: [{ title: "Order — Pinewood Emporium" }] }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const fn = useServerFn(getMyOrder);
  const { data, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fn({ data: { orderId: id } }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <PineLoader size={84} label="Fetching your order" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-cream">Order not found</h1>
        <p className="mt-3 text-muted-foreground">{error instanceof Error ? error.message : "We couldn't load this order."}</p>
        <Link to="/shop" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm uppercase tracking-wider text-primary-foreground hover:bg-pine-glow">Back to shop</Link>
      </div>
    );
  }

  const { order, items } = data;
  const steps = [
    { key: "pending", label: "Placed", icon: CheckCircle2 },
    { key: "paid", label: "Confirmed", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  ] as const;
  const statusIdx = Math.max(
    0,
    ["pending", "paid", "shipped", "delivered"].indexOf(order.status as string),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-teal/40 bg-teal/10 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-teal" />
        <h1 className="mt-3 font-display text-3xl text-cream">Thank you — order placed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Order number: <span className="font-mono text-cream">{order.order_number}</span>
        </p>
      </div>

      {/* Progress */}
      <ol className="mt-10 grid grid-cols-4 gap-2">
        {steps.map((s, i) => {
          const Active = i <= statusIdx;
          const Icon = s.icon;
          return (
            <li key={s.key} className="flex flex-col items-center text-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${Active ? "border-teal bg-teal/15 text-teal" : "border-border bg-card text-muted-foreground"}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className={`mt-2 text-xs uppercase tracking-wider ${Active ? "text-cream" : "text-muted-foreground"}`}>{s.label}</div>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <section className="rounded-lg border border-border/60 bg-card/40 p-6">
          <h2 className="font-display text-xl text-cream">Items</h2>
          <ul className="mt-4 divide-y divide-border/60">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3 py-3">
                <img src={resolveImage(i.image_snapshot)} alt={i.title_snapshot} className="h-14 w-12 rounded object-cover" />
                <div className="flex-1 text-sm">
                  <div className="text-cream">{i.title_snapshot}</div>
                  <div className="text-muted-foreground">× {i.qty} · {formatPrice(i.unit_price_cents)} each</div>
                </div>
                <div className="text-sm text-cream">{formatPrice(i.line_total_cents)}</div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-card/40 p-6 text-sm">
            <h3 className="font-display text-lg text-cream">Summary</h3>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="text-cream">{formatPrice(order.subtotal_cents)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="text-cream">{order.shipping_cents === 0 ? "Free" : formatPrice(order.shipping_cents)}</dd></div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-base"><dt className="text-cream">Total</dt><dd className="font-display text-xl text-cream">{formatPrice(order.total_cents)}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">Payment: {String(order.payment_method).toUpperCase()} · {String(order.payment_status)}</p>
            {order.tracking_number && (
              <p className="mt-2 text-xs text-muted-foreground">Tracking: <span className="text-cream">{order.tracking_number}</span></p>
            )}
          </div>
          <div className="rounded-lg border border-border/60 bg-card/40 p-6 text-sm">
            <h3 className="font-display text-lg text-cream">Shipping to</h3>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">
              {order.shipping_full_name}
              {"\n"}{order.shipping_line1}{order.shipping_line2 ? `, ${order.shipping_line2}` : ""}
              {"\n"}{order.shipping_city}{order.shipping_district ? `, ${order.shipping_district}` : ""}{order.shipping_postal_code ? ` ${order.shipping_postal_code}` : ""}
              {"\n"}{order.shipping_country}
              {"\n"}📞 {order.shipping_phone}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
