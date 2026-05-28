import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Pinewood Emporium" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, setUser } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const result = await apiClient.post<any>('/auth/register/', { email, password });
        localStorage.setItem('auth_token', result.token);
        setUser(result.user);
        toast.success("Account created.");
        navigate({ to: "/" });
      } else {
        const result = await apiClient.post<any>('/auth/login/', { email, password });
        localStorage.setItem('auth_token', result.token);
        setUser(result.user);
        toast.success("Welcome back.");
        navigate({ to: "/" });
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl text-cream">
        {mode === "signin" ? "Welcome back" : "Create an account"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "signin"
          ? "Sign in to track orders and check out faster."
          : "Join Pinewood Emporium to save your cart and orders."}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-border bg-input px-4 py-3 text-sm text-cream focus:border-pine-glow focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-border bg-input px-4 py-3 text-sm text-cream focus:border-pine-glow focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium uppercase tracking-wider text-primary-foreground hover:bg-pine-glow disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
        className="mt-6 text-center text-sm text-muted-foreground hover:text-cream"
      >
        {mode === "signin" ? "No account? Create one →" : "Already have an account? Sign in →"}
      </button>

      <Link to="/" className="mt-10 text-center text-xs uppercase tracking-wider text-muted-foreground hover:text-cream">
        ← Back home
      </Link>
    </div>
  );
}
