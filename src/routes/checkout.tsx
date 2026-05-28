import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { formatPrice, resolveImage } from "@/lib/format";
import { apiClient } from "@/lib/api-client";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { PineLoader } from "@/components/site/PineLoader";
import { Banknote, Smartphone, Wallet } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Pinewood Emporium" }] }),
  component: CheckoutPage,
});

type Method = "cod" | "bkash" | "nagad" | "rocket";

function CheckoutPage() {
  const { items, subtotalCents, count, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState<Method>("cod");

  const shippingCents = subtotalCents >= 500000 ? 0 : 12000;
  const totalCents = subtotalCents + shippingCents;

  if (count === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-4xl text-cream">Your cart is empty</h1>
        <Link to="/shop" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm uppercase tracking-wider text-primary-foreground hover:bg-pine-glow">
          Browse the shop
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-4xl text-cream">Sign in to checkout</h1>
        <p className="mt-3 text-muted-foreground">Your cart is saved.</p>
        <Link to="/login" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm uppercase tracking-wider text-primary-foreground hover:bg-pine-glow">
          Sign in
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const orderData = {
        status: 'pending',
        total: totalCents,
        shipping_name: String(fd.get("fullName") ?? "").trim(),
        shipping_address: `${String(fd.get("line1") ?? "").trim()} ${String(fd.get("line2") ?? "").trim()}`.trim(),
        shipping_city: String(fd.get("city") ?? "").trim(),
        shipping_phone: String(fd.get("phone") ?? "").trim(),
        payment_method: method,
        notes: (fd.get("notes") as string)?.trim() || null,
        items: items.map((i) => ({ 
          product: i.productId, 
          product_name: i.title,
          quantity: i.qty,
          price: i.priceCents
        }))
      };
      const result = await apiClient.post<any>('/orders/', orderData);
      clear();
      toast.success(`Order placed`);
      navigate({ to: "/order/$id", params: { id: result.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl text-cream sm:text-5xl">Checkout</h1>

      <form onSubmit={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Shipping */}
          <section className="rounded-lg border border-border/60 bg-card/40 p-6">
            <h2 className="font-display text-2xl text-cream">Shipping address</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field name="fullName" label="Full name" required defaultValue={user.profile?.full_name || user.username} />
              <Field name="phone" label="Phone" required placeholder="01XXXXXXXXX" />
              <Field name="line1" label="Address line 1" required className="sm:col-span-2" />
              <Field name="line2" label="Address line 2 (optional)" className="sm:col-span-2" />
              <Field name="city" label="City" required defaultValue="Dhaka" />
              <Field name="district" label="District" />
              <Field name="postalCode" label="Postal code" />
              <Field name="country" label="Country" defaultValue="Bangladesh" disabled />
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-lg border border-border/60 bg-card/40 p-6">
            <h2 className="font-display text-2xl text-cream">Payment method</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MethodCard active={method === "cod"} onClick={() => setMethod("cod")} icon={<Banknote className="h-5 w-5" />} title="Cash on Delivery" hint="Pay the courier in cash" />
              <MethodCard active={method === "bkash"} onClick={() => setMethod("bkash")} icon={<Smartphone className="h-5 w-5" />} title="bKash" hint="Send to 01XXXXXXXXX (Merchant)" />
              <MethodCard active={method === "nagad"} onClick={() => setMethod("nagad")} icon={<Wallet className="h-5 w-5" />} title="Nagad" hint="Send to 01XXXXXXXXX" />
              <MethodCard active={method === "rocket"} onClick={() => setMethod("rocket")} icon={<Smartphone className="h-5 w-5" />} title="Rocket" hint="Send to 01XXXXXXXXX-X" />
            </div>
            {method !== "cod" && (
              <div className="mt-5">
                <Field
                  name="paymentReference"
                  label={`${method.toUpperCase()} transaction ID`}
                  required
                  placeholder="e.g. 9A1B2C3D4E"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Send the total amount first, then enter the transaction ID here.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-border/60 bg-card/40 p-6">
            <h2 className="font-display text-2xl text-cream">Order notes</h2>
            <textarea
              name="notes"
              rows={3}
              placeholder="Anything we should know?"
              className="mt-3 w-full rounded-md border border-border bg-input p-3 text-sm text-cream placeholder:text-muted-foreground focus:border-teal focus:outline-none"
            />
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit space-y-4">
          <div className="rounded-lg border border-border/60 bg-card/40 p-6">
            <h2 className="font-display text-xl text-cream">Order summary</h2>
            <ul className="mt-4 divide-y divide-border/60">
              {items.map((i) => (
                <li key={i.productId} className="flex gap-3 py-3">
                  <img src={resolveImage(i.image)} alt={i.title} className="h-14 w-12 rounded object-cover" />
                  <div className="flex-1 text-sm">
                    <div className="text-cream">{i.title}</div>
                    <div className="text-muted-foreground">× {i.qty}</div>
                  </div>
                  <div className="text-sm text-cream">{formatPrice(i.priceCents * i.qty)}</div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="text-cream">{formatPrice(subtotalCents)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="text-cream">{shippingCents === 0 ? "Free" : formatPrice(shippingCents)}</dd></div>
              <div className="flex justify-between border-t border-border/60 pt-3 text-base"><dt className="text-cream">Total</dt><dd className="font-display text-xl text-cream">{formatPrice(totalCents)}</dd></div>
            </dl>
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium uppercase tracking-wider text-primary-foreground transition-colors hover:bg-pine-glow disabled:opacity-60"
            >
              {submitting ? <PineLoader size={28} label="Placing" /> : "Place order"}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              You'll get an order number and tracking on the next screen.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label, name, required, placeholder, defaultValue, disabled, className,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}{required && " *"}</span>
      <input
        type="text"
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        disabled={disabled}
        className="w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-cream placeholder:text-muted-foreground focus:border-teal focus:outline-none disabled:opacity-60"
      />
    </label>
  );
}

function MethodCard({ active, onClick, icon, title, hint }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; title: string; hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-md border p-4 text-left transition-all ${
        active
          ? "border-teal bg-teal/10 text-cream"
          : "border-border bg-background/40 text-muted-foreground hover:border-teal/60 hover:bg-accent"
      }`}
    >
      <span className={active ? "text-teal" : ""}>{icon}</span>
      <div>
        <div className="text-sm font-medium text-cream">{title}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
    </button>
  );
}
