import { Link } from "@tanstack/react-router";
import { ShoppingBag, User, Menu, LogOut, Shield, Sun, Moon } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/pinewood-logo.png";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/lib/use-is-admin";
import { useTheme } from "@/lib/theme-context";

const navItems = [
  { to: "/shop", label: "Shop" },
  { to: "/creators", label: "Creators" },
  { to: "/collaborate", label: "Collaborate" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;


export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user, signOut } = useAuth();
  const isAdmin = useIsAdmin();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-gradient-to-r from-background/90 via-[color-mix(in_oklab,var(--indigo)_18%,var(--background))]/90 to-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground/80 hover:bg-accent md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Pinewood Emporium" className="h-11 w-11 object-contain" />
          <span className="font-display text-xl tracking-[0.22em] text-cream sm:text-2xl">
            PINEWOOD <span className="text-pine-glow">EMPORIUM</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="pw-nav-hover relative isolate rounded-full px-4 py-2 text-sm font-medium tracking-wide text-foreground/70 transition-colors hover:text-cream"
              activeProps={{ className: "text-cream", "data-active": "true" } as never}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="pw-nav-hover relative isolate inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium tracking-wide text-teal hover:text-cream"
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className="pw-icon-hover inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground/80 hover:bg-accent hover:text-cream"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <Sun className="pw-icon h-5 w-5" /> : <Moon className="pw-icon h-5 w-5" />}
          </button>
          {user ? (
            <button
              onClick={() => signOut()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground/80 hover:bg-accent hover:text-cream"
              aria-label="Sign out"
              title={user.email ?? "Sign out"}
            >
              <LogOut className="h-5 w-5" />
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground/80 hover:bg-accent hover:text-cream"
              aria-label="Sign in"
            >
              <User className="h-5 w-5" />
            </Link>
          )}
          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground/80 hover:bg-accent hover:text-cream"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal px-1 text-[10px] font-semibold text-background">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-cream"
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <Link to="/admin" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-pine-glow hover:bg-accent">Admin home</Link>
                <Link to="/admin/products" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent">· Products</Link>
                <Link to="/admin/categories" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent">· Categories</Link>
                <Link to="/admin/orders" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent">· Orders</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
