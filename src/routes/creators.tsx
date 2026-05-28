import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { Reveal } from "@/components/site/Reveal";
import { HeroTypewriter } from "@/components/site/HeroTypewriter";
import { PineGroveArt, CompassArt } from "@/components/site/VectorArt";
import { MapPin, Globe, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/creators")({
  head: () => ({
    meta: [
      { title: "Creators — Pinewood Emporium" },
      { name: "description", content: "Meet the Bangladeshi makers and miniature artisans crafting goods on Pinewood Emporium." },
    ],
  }),
  component: CreatorsPage,
});

type Row = {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website: string | null;
};

function CreatorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["creators", "approved"],
    queryFn: async (): Promise<Row[]> => {
      // Django returns a paginated response or a list, depending on DRF configuration
      // We will assume a list for now, or DRF default pagination `results` array
      const response = await fetchApi("/vendor/profiles/");
      const data = response.results ? response.results : response;
      return (data ?? []).map((v: any) => ({
        id: String(v.id),
        display_name: v.store_name,
        bio: v.description,
        avatar_url: null, // to be handled later if we add avatar
        location: null,
        website: null
      })) as Row[];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-lg border border-border/60 bg-card/40 p-8 sm:p-14">
        <PineGroveArt className="pointer-events-none absolute -right-10 -top-10 hidden h-64 w-auto opacity-40 sm:block" />
        <CompassArt className="pointer-events-none absolute -bottom-12 -left-10 hidden h-56 w-56 opacity-30 md:block pw-float" />
        <div className="relative max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-pine-glow">Our makers</p>
          <HeroTypewriter
            className="pw-display mt-3 text-5xl sm:text-6xl"
            segments={[
              { text: "The hands behind " },
              { text: "Pinewood", as: "em" },
              { text: "." },
            ]}
          />
          <p className="pw-hero-copy-rise mt-5 text-muted-foreground">
            Independent artisans, miniature builders, and craft studios across Bangladesh — each
            shop runs its own corner of Pinewood Emporium.
          </p>
        </div>
      </section>

      <div className="mt-12">
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-md bg-card" />
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <div className="rounded-md border border-dashed border-border p-10 text-center">
            <Sparkles className="mx-auto h-6 w-6 text-pine-glow" />
            <p className="mt-3 text-cream">No creators yet — be the first.</p>
            <Link
              to="/collaborate"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs uppercase tracking-wider text-primary-foreground hover:bg-pine-glow"
            >
              Apply to join <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((c, i) => (
              <Reveal key={c.id} delay={i * 60}>
                <article className="group h-full rounded-md border border-border/60 bg-card/60 p-6 transition-all hover:-translate-y-1 hover:border-pine-glow hover:shadow-elegant">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-accent">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt={c.display_name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-display text-2xl text-pine-glow">
                          {c.display_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display text-xl text-cream">{c.display_name}</h2>
                      {c.location && (
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {c.location}
                        </p>
                      )}
                    </div>
                  </div>
                  {c.bio && <p className="mt-4 line-clamp-4 text-sm text-muted-foreground">{c.bio}</p>}
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-pine-glow hover:text-cream"
                    >
                      <Globe className="h-3 w-3" /> Visit
                    </a>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
