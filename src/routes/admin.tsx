import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/lib/use-is-admin";
import { useAuth } from "@/lib/auth-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bootstrapAdmin } from "@/lib/products.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const qc = useQueryClient();
  const bootstrapFn = useServerFn(bootstrapAdmin);
  const bootstrap = useMutation({
    mutationFn: () => bootstrapFn(),
    onSuccess: () => {
      toast.success("You are now the site admin.");
      qc.invalidateQueries({ queryKey: ["is-admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-4xl text-cream">Admin area</h1>
        <p className="mt-4 text-muted-foreground">
          Signed in as <span className="text-cream">{user?.email}</span>, but this account is not an admin.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          If no admin has been claimed yet, you can claim it now.
        </p>
        <button
          onClick={() => bootstrap.mutate()}
          disabled={bootstrap.isPending}
          className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-medium uppercase tracking-wider text-primary-foreground hover:bg-pine-glow disabled:opacity-60"
        >
          {bootstrap.isPending ? "Claiming…" : "Claim admin"}
        </button>
        <div className="mt-8">
          <Link to="/" className="text-xs uppercase tracking-wider text-muted-foreground hover:text-cream">
            ← Back home
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
