import { Link } from "@tanstack/react-router";
import logo from "@/assets/pinewood-logo.png";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Pinewood Emporium" className="h-10 w-10 object-contain" />
              <span className="font-display text-lg tracking-[0.22em] text-cream">
                PINEWOOD <span className="text-pine-glow">EMPORIUM</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Curated goods for a slower, more deliberate life.
            </p>
          </div>

          <FooterColumn
            title="Shop"
            links={[
              { to: "/shop", label: "All products" },
              { to: "/shop", label: "New arrivals" },
              { to: "/shop", label: "Best sellers" },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { to: "/about", label: "About" },
              { to: "/collaborate", label: "Sell with us" },
              { to: "/contact", label: "Contact" },
            ]}
          />
          <FooterColumn
            title="Support"
            links={[
              { to: "/contact", label: "Shipping" },
              { to: "/contact", label: "Returns" },
              { to: "/contact", label: "FAQ" },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Pinewood Emporium. All rights reserved.</p>
          <p className="tracking-wider uppercase">Made in Bangladesh · Shipping nationwide</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="font-display text-sm uppercase tracking-[0.2em] text-cream">
        {title}
      </h4>
      <ul className="mt-4 space-y-2">
        {links.map((l, i) => (
          <li key={i}>
            <Link
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-cream"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
