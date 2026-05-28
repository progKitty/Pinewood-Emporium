import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { creatorListMyProducts } from "@/lib/creators.functions";
import { Package, ArrowRight, Eye, BookOpen } from "lucide-react";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/creator/")({
  head: () => ({ meta: [{ title: "Creator dashboard — Pinewood Emporium" }] }),
  component: CreatorOverview,
});

function CreatorOverview() {
  const listFn = useServerFn(creatorListMyProducts);
  const { data } = useQuery({
    queryKey: ["creator", "my-products"],
    queryFn: () => listFn(),
  });

  const total = data?.length ?? 0;
  const active = data?.filter((p) => p.active).length ?? 0;
  const stock = data?.reduce((n, p) => n + p.stock, 0) ?? 0;

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Listings" value={total} />
        <Stat label="Visible in shop" value={active} />
        <Stat label="Units in stock" value={stock} />
      </div>

      <section className="rounded-lg border border-border/60 bg-card/40 p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-cream">Get started</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Upload your first piece — a few photos, an optional short video,
              price, and stock count. It takes a couple of minutes.
            </p>
          </div>
          <Link
            to="/creator/products"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-pine-glow"
          >
            <Package className="h-4 w-4" />
            List a product
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-cream">Recent listings</h2>
        {(!data || data.length === 0) ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing yet. Add your first piece from the My products tab.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border/60 rounded-md border border-border/60">
            {data.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <div className="font-medium text-cream">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{formatPrice(p.price_cents)} · {p.stock} in stock</div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {p.active ? (
                    <Link to="/product/$slug" params={{ slug: p.slug }} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-muted-foreground hover:text-cream">
                      <Eye className="h-3 w-3" /> View
                    </Link>
                  ) : (
                    <span className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground">Hidden</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex items-center gap-3 rounded-md border border-border/60 bg-card/30 p-5 text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4 text-pine-glow" />
        Tip: upload images at least 1200px on the long side and keep videos under 30 seconds.
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border/60 bg-card/40 p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-4xl text-cream">{value}</div>
    </div>
  );
}
