import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, FolderTree, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — Pinewood Emporium" }] }),
  component: AdminHome,
});

const tiles = [
  { to: "/admin/products", title: "Products", desc: "Add, edit, upload images, manage stock", icon: Package },
  { to: "/admin/categories", title: "Categories", desc: "Create and order shop categories", icon: FolderTree },
  { to: "/admin/orders", title: "Orders", desc: "Confirm, ship and track customer orders", icon: ClipboardList },
] as const;

function AdminHome() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-pine-glow">Admin</p>
      <h1 className="mt-2 font-display text-4xl text-cream sm:text-5xl">Control room</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Manage everything customers see — products, categories, and live orders.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group rounded-xl border border-border bg-card/60 p-6 transition-all hover:-translate-y-0.5 hover:border-pine-glow hover:bg-card"
          >
            <t.icon className="h-7 w-7 text-pine-glow transition-transform group-hover:scale-110" />
            <h2 className="mt-4 font-display text-2xl text-cream">{t.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
