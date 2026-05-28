import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useAuth } from "@/lib/auth-context";
import { useMyCreator } from "@/lib/use-creator";
import { applyAsCreator } from "@/lib/creators.functions";
import { toast } from "sonner";
import { LayoutDashboard, Package, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/creator")({
  beforeLoad: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw redirect({ to: "/login" });
  },
  component: CreatorLayout,
});

function CreatorLayout() {
  const { user } = useAuth();
  const { data: creator, isLoading } = useMyCreator();
  const qc = useQueryClient();
  const applyFn = useServerFn(applyAsCreator);
  const navigate = useNavigate();

  const [form, setForm] = useState({ display_name: "", bio: "", location: "", website: "" });

  const apply = useMutation({
    mutationFn: (input: typeof form) => applyFn({ data: input }),
    onSuccess: () => {
      toast.success("Welcome aboard. Your creator dashboard is ready.");
      qc.invalidateQueries({ queryKey: ["my-creator"] });
      navigate({ to: "/creator/products" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground sm:px-6">
        Loading…
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Link to="/collaborate" className="mb-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-cream">
          <ArrowLeft className="h-3.5 w-3.5" /> About the program
        </Link>

        <p className="text-xs uppercase tracking-[0.25em] text-pine-glow">Join the program</p>
        <h1 className="mt-2 font-display text-4xl text-cream sm:text-5xl">Become a creator</h1>
        <p className="mt-3 text-muted-foreground">
          Signed in as <span className="text-cream">{user?.email}</span>. Tell us a little about your craft.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (form.display_name.trim().length < 2) return toast.error("Display name is required");
            apply.mutate(form);
          }}
          className="mt-8 space-y-5"
        >
          <Field label="Display name *">
            <input required value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className={inputCls} placeholder="e.g. Riya's Miniatures" />
          </Field>
          <Field label="Bio">
            <textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={inputCls} placeholder="A few lines about what you make and why." />
          </Field>
          <Field label="Location (city, district)">
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} placeholder="Dhaka, Bangladesh" />
          </Field>
          <Field label="Website or Instagram (optional)">
            <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputCls} placeholder="https://instagram.com/yourstudio" />
          </Field>
          <button
            type="submit"
            disabled={apply.isPending}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium uppercase tracking-wider text-primary-foreground hover:bg-pine-glow disabled:opacity-60"
          >
            {apply.isPending ? "Setting up…" : "Open my dashboard"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-pine-glow">Creator</p>
        <h1 className="mt-2 font-display text-4xl text-cream sm:text-5xl">{creator.display_name}</h1>
        {creator.location && <p className="mt-1 text-sm text-muted-foreground">{creator.location}</p>}
      </header>

      <nav className="mb-10 flex flex-wrap gap-2 border-b border-border/60">
        <CreatorTab to="/creator" icon={<LayoutDashboard className="h-4 w-4" />} label="Overview" exact />
        <CreatorTab to="/creator/products" icon={<Package className="h-4 w-4" />} label="My products" />
      </nav>

      <Outlet />
    </div>
  );
}

function CreatorTab({ to, icon, label, exact }: { to: string; icon: React.ReactNode; label: string; exact?: boolean }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className="-mb-px inline-flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm text-muted-foreground hover:text-cream"
      activeProps={{ className: "border-pine-glow text-cream" }}
    >
      {icon}
      {label}
    </Link>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-cream focus:border-pine-glow focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
