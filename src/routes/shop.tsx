import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useEffect, useMemo, useState } from "react";
import { formatPrice, resolveImage } from "@/lib/format";
import { Reveal } from "@/components/site/Reveal";
import { HeroTypewriter } from "@/components/site/HeroTypewriter";
import { PineLoader } from "@/components/site/PineLoader";
import {
  Flame, Sparkles, Search, X, ArrowUpDown, Filter, Layers,
  Package, ShoppingBag, Tag, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Pinewood Emporium" },
      { name: "description", content: "Browse curated leather, timepieces, home, outdoor, and creator-made goods from Pinewood Emporium." },
    ],
  }),
  component: ShopPage,
});

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price_cents: number;
  compare_at_cents: number | null;
  stock: number;
  images: unknown;
  category: number | null;
  category_name: string | null;
};

type CategoryRow = { id: string; name: string; slug: string };

type SortKey = "newest" | "price_asc" | "price_desc" | "name";

function ShopPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<number | string>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const { data: cats } = useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<CategoryRow[]> => {
      const data = await apiClient.get<CategoryRow[]>('/categories/');
      return data;
    },
    staleTime: 5 * 60_000,
  });

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["shop", "products"],
    queryFn: async () => {
      const data = await apiClient.get<ProductRow[]>('/products/');
      return data;
    },
    staleTime: 30_000,
  });

  const best = useMemo(() => products ? products.slice(0, 4) : [], [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    const query = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (query) {
        const hay = `${p.title} ${p.description ?? ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price_asc": return a.price_cents - b.price_cents;
        case "price_desc": return b.price_cents - a.price_cents;
        case "name": return a.title.localeCompare(b.title);
        default: return 0;
      }
    });
    return list;
  }, [products, q, cat, sort]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [q, cat, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE),
    [filtered, currentPage],
  );

  const bestIds = useMemo(() => new Set((best ?? []).map((b: { id: string }) => b.id)), [best]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-pine-glow">The Shop</p>
        <HeroTypewriter
          className="pw-display mt-2 text-5xl sm:text-6xl"
          segments={[
            { text: "Curated & " },
            { text: "creator-made", as: "em" },
          ]}
        />
        <p className="pw-hero-copy-rise mt-3 max-w-2xl text-muted-foreground">
          A small, considered catalogue alongside hand-picked pieces from Bangladeshi makers.
        </p>
      </header>

      {/* Best Sellers */}
      {best && best.length > 0 && (
        <Reveal as="section" className="mb-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="flex items-center gap-3 pw-icon-hover">
              <Flame className="pw-icon h-5 w-5 text-pine-glow" />
              <h2 className="font-display text-3xl text-cream">Top picks</h2>
            </div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Trending now</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {best.slice(0, 4).map((p, idx) => (
              <ProductCard
                key={p.id}
                p={p as ProductRow}
                badge={
                  <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-pine-glow px-3 py-1 text-[10px] uppercase tracking-wider text-background shadow-elegant">
                    <Sparkles className="h-3 w-3" />
                    #{idx + 1}
                  </span>
                }
              />
            ))}
          </div>
        </Reveal>
      )}

      {/* Search + filters toolbar */}
      <Reveal as="section" className="mb-8 rounded-lg border border-border/60 bg-card/40 p-4 sm:p-5" y={28}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-full border border-border bg-input pl-10 pr-10 py-2.5 text-sm text-cream placeholder:text-muted-foreground focus:border-pine-glow focus:outline-none"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="pw-pop absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-cream"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sort
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-border bg-input px-4 py-2 text-sm text-cream focus:border-pine-glow focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low → high</option>
              <option value="price_desc">Price: high → low</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Category filter chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Filter
          </span>
          <FilterChip
            active={cat === "all"}
            onClick={() => setCat("all")}
            icon={<Layers className="pw-icon h-3.5 w-3.5" />}
            label="All"
          />
          {cats?.map((c) => (
            <FilterChip
              key={c.id}
              active={cat === c.id}
              onClick={() => setCat(c.id)}
              icon={<Tag className="pw-icon h-3.5 w-3.5" />}
              label={c.name}
            />
          ))}
        </div>
      </Reveal>

      {/* All products */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-pine-glow" />
            <h2 className="font-display text-3xl text-cream">All products</h2>
            {filtered.length > 0 && (
              <span className="ml-2 rounded-full bg-accent px-2.5 py-0.5 text-xs text-muted-foreground">
                {filtered.length}
              </span>
            )}
          </div>
          <Link to="/collaborate" className="text-xs uppercase tracking-wider text-muted-foreground hover:text-pine-glow pw-underline">
            Are you a maker? →
          </Link>
        </div>

        {isLoading && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <PineLoader size={84} label="Loading shop" />
          </div>
        )}

        {error && <p className="text-sm text-destructive">Couldn't load the catalogue. Please refresh.</p>}

        {products && products.length > 0 && filtered.length === 0 && (
          <div className="rounded-md border border-dashed border-border p-10 text-center">
            <Package className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 text-cream">No matches for those filters.</p>
            <button
              onClick={() => { setQ(""); setCat("all"); }}
              className="mt-4 text-xs uppercase tracking-wider text-pine-glow hover:text-cream"
            >
              Clear filters
            </button>
          </div>
        )}

        {filtered.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paged.map((p, i) => (
                <Reveal key={p.id} delay={(i % 8) * 50}>
                  <ProductCard
                    p={p}
                    badge={bestIds.has(p.id) ? (
                      <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[10px] uppercase tracking-wider text-pine-glow backdrop-blur">
                        <Flame className="h-3 w-3" /> Best
                      </span>
                    ) : undefined}
                  />
                </Reveal>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="pw-pop inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-cream transition-colors hover:bg-accent disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const n = idx + 1;
                  const isActive = n === currentPage;
                  return (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "pw-pop h-10 min-w-10 rounded-full border px-3 text-sm transition-colors",
                        isActive
                          ? "border-teal bg-teal text-background"
                          : "border-border text-muted-foreground hover:bg-accent hover:text-cream",
                      )}
                    >
                      {n}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="pw-pop inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-cream transition-colors hover:bg-accent disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function FilterChip({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pw-icon-hover pw-pop inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-wider transition-all",
        active
          ? "border-pine-glow bg-pine-glow text-background"
          : "border-border bg-background/40 text-muted-foreground hover:border-pine-glow hover:text-cream",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ProductCard({ p, badge }: { p: ProductRow; badge?: React.ReactNode }) {
  const imgs = Array.isArray(p.images) ? (p.images as unknown[]) : [];
  const first = typeof imgs[0] === "string" ? (imgs[0] as string) : null;
  const onSale = p.compare_at_cents && p.compare_at_cents > p.price_cents;
  return (
    <Link to="/product/$slug" params={{ slug: p.slug }} className="group block">
      <div className="pw-flashcard relative aspect-[4/5]">
        <div className="pw-flashcard-inner">
          {/* Front */}
          <div className="pw-face bg-card">
            <img
              src={resolveImage(first)}
              alt={p.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            {badge}
            {p.stock === 0 && (
              <span className="absolute right-3 top-3 z-10 rounded-full bg-background/80 px-3 py-1 text-[10px] uppercase tracking-wider text-cream backdrop-blur">
                Sold out
              </span>
            )}
            {onSale && p.stock > 0 && !badge && (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-pine-glow px-3 py-1 text-[10px] uppercase tracking-wider text-background">
                Sale
              </span>
            )}
          </div>
          {/* Back */}
          <div className="pw-face pw-face-back flex flex-col justify-between bg-gradient-to-br from-pine to-background p-5 text-cream">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-pine-glow">Pinewood</p>
              <h4 className="mt-2 font-display text-2xl leading-tight">{p.title}</h4>
              {p.description && (
                <p className="mt-3 line-clamp-5 text-sm text-foreground/80">{p.description}</p>
              )}
            </div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">From</div>
                <div className="font-display text-2xl text-cream">{formatPrice(p.price_cents)}</div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-pine-glow/60 px-3 py-1.5 text-[10px] uppercase tracking-wider text-pine-glow">
                View →
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg text-cream group-hover:text-pine-glow">{p.title}</h3>
        <div className="text-right text-sm">
          <div className="text-cream">{formatPrice(p.price_cents)}</div>
          {onSale && (
            <div className="text-xs text-muted-foreground line-through">{formatPrice(p.compare_at_cents!)}</div>
          )}
        </div>
      </div>
    </Link>
  );
}
