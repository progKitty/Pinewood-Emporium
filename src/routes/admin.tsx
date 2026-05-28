import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { useIsAdmin } from "@/lib/use-is-admin";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-4xl text-cream">Admin area</h1>
        <p className="mt-4 text-muted-foreground">
          Signed in as <span className="text-cream">{user?.email}</span>, but this account is not an admin.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Contact the site owner if you need access.
        </p>
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
