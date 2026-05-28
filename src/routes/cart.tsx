import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-context";
import { formatPrice, resolveImage } from "@/lib/format";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Pinewood Emporium" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotalCents, count } = useCart();

  if (count === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-4xl text-cream">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Start exploring the catalogue.</p>
        <Link to="/shop" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm uppercase tracking-wider text-primary-foreground hover:bg-pine-glow">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl text-cream sm:text-5xl">Your cart</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border/60 rounded-md border border-border/60">
          {items.map((i) => (
            <li key={i.productId} className="flex gap-4 p-4">
              <img src={resolveImage(i.image)} alt={i.title} className="h-24 w-20 rounded object-cover" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <Link to="/product/$slug" params={{ slug: i.slug }} className="font-display text-lg text-cream hover:text-pine-glow">
                    {i.title}
                  </Link>
                  <button onClick={() => remove(i.productId)} className="rounded p-1 text-muted-foreground hover:text-destructive" aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{formatPrice(i.priceCents)} each</p>
                <div className="mt-3 inline-flex items-center rounded-full border border-border">
                  <button onClick={() => setQty(i.productId, i.qty - 1)} className="inline-flex h-9 w-9 items-center justify-center text-cream hover:text-pine-glow"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="min-w-6 text-center text-sm text-cream">{i.qty}</span>
                  <button onClick={() => setQty(i.productId, i.qty + 1)} className="inline-flex h-9 w-9 items-center justify-center text-cream hover:text-pine-glow"><Plus className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="text-right text-cream">{formatPrice(i.priceCents * i.qty)}</div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-md border border-border/60 bg-card/40 p-6">
          <h2 className="font-display text-xl text-cream">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="text-cream">{formatPrice(subtotalCents)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="text-muted-foreground">Calculated at checkout</dd></div>
          </dl>
          <Link
            to="/checkout"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium uppercase tracking-wider text-primary-foreground transition-colors hover:bg-pine-glow"
          >
            Proceed to checkout
          </Link>
          <p className="mt-3 text-center text-xs text-muted-foreground">Cash on delivery, bKash, Nagad, or Rocket.</p>
        </aside>
      </div>
    </div>
  );
}
