import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Package, ShieldCheck, Truck } from "lucide-react";
import hero from "@/assets/hero-pinewood.jpg";
import catLeather from "@/assets/cat-leather.jpg";
import catWatches from "@/assets/cat-watches.jpg";
import catHome from "@/assets/cat-home.jpg";
import catOutdoor from "@/assets/cat-outdoor.jpg";
import { Reveal } from "@/components/site/Reveal";
import { HeroTypewriter } from "@/components/site/HeroTypewriter";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pinewood Emporium — Curated goods, from Bangladesh" },
      {
        name: "description",
        content:
          "Pinewood Emporium curates premium lifestyle goods — leather, timepieces, home, and outdoor. Shipped across Bangladesh.",
      },
      { property: "og:title", content: "Pinewood Emporium" },
      {
        property: "og:description",
        content: "Curated goods for a slower, more deliberate life. Based in Bangladesh.",
      },
      { property: "og:image", content: hero },
    ],
    links: [
      { rel: "preload", as: "image", href: hero, fetchpriority: "high" },
    ],
  }),
  component: Home,
});

const categories = [
  { name: "Leather", image: catLeather, href: "/shop" },
  { name: "Timepieces", image: catWatches, href: "/shop" },
  { name: "Home", image: catHome, href: "/shop" },
  { name: "Outdoor", image: catOutdoor, href: "/shop" },
] as const;

const valueProps = [
  { icon: Leaf, title: "Considered curation", desc: "Every product hand-picked for craft and longevity." },
  { icon: Truck, title: "Nationwide delivery", desc: "Fast, tracked shipping to every district in Bangladesh." },
  { icon: ShieldCheck, title: "Local checkout", desc: "bKash, Nagad, Rocket, and cash on delivery." },
  { icon: Package, title: "Easy returns", desc: "14-day returns on every order, no questions asked." },
];

function Home() {
  return (
    <main>
      {/* Hero — pinewood forest atmosphere */}
      <section className="relative overflow-hidden bg-background">
        {/* Hero photo: warm pinewood, the focal layer */}
        <div className="absolute inset-0">
          <img
            src={hero}
            alt="Sunlight through a pinewood forest"
            width={1920}
            height={1080}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
          {/* Tinted overlays for legibility + theme cohesion */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-transparent" />
        </div>

        {/* Soft accent glow (single, cheap blob) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="pw-blob-a absolute -left-32 top-10 h-[26rem] w-[26rem] rounded-full bg-pine-glow/20 blur-3xl" />
          <div className="pw-blob-b absolute right-[-10%] bottom-0 h-[28rem] w-[28rem] rounded-full bg-purple/20 blur-3xl" />
        </div>


        <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col items-start justify-center px-4 py-24 sm:px-6 lg:px-8">
          <span className="pw-rise pw-rise-1 mb-6 inline-block rounded-full border border-teal/50 bg-teal/15 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-teal">
            New season · 2026
          </span>
          <HeroTypewriter
            className="pw-display max-w-3xl text-5xl sm:text-6xl lg:text-7xl"
            segments={[
              { text: "Quiet objects for a " },
              { text: "deliberate", as: "em" },
              { text: " life." },
            ]}
          />
          <p className="pw-hero-copy-rise mt-6 max-w-xl text-lg text-foreground/85">
            A curated catalogue of leather, time, home, and trail — chosen with restraint,
            shipped from Dhaka to your doorstep. Worldwide one day; today, all of Bangladesh.
          </p>
          <div className="pw-hero-action-rise mt-10 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium uppercase tracking-wider text-primary-foreground shadow-elegant transition-all hover:bg-pine-glow"
            >
              Explore the shop
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-7 py-3.5 text-sm font-medium uppercase tracking-wider text-cream backdrop-blur transition-colors hover:bg-accent"
            >
              Our story
            </Link>
          </div>
        </div>
      </section>

      {/* Value props */}
      <Reveal as="section" className="border-y border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-7xl gap-px bg-border/60 px-0 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((v) => (
            <div key={v.title} className="flex flex-col gap-3 bg-background p-8">
              <v.icon className="h-6 w-6 text-pine-glow" strokeWidth={1.5} />
              <h3 className="font-display text-xl text-cream">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Categories */}
      <Reveal as="section" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" y={36}>
        <div className="mb-12 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-pine-glow">Collections</p>
            <h2 className="mt-2 font-display text-4xl text-cream sm:text-5xl">Shop by category</h2>
          </div>
          <Link to="/shop" className="hidden text-sm uppercase tracking-wider text-muted-foreground hover:text-cream sm:inline-flex">
            View all →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.name} to={c.href} className="group relative aspect-[4/5] overflow-hidden rounded-md bg-card">
              <img src={c.image} alt={c.name} loading="lazy" width={800} height={1000} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-2xl text-cream">{c.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs uppercase tracking-wider text-foreground/70 transition-colors group-hover:text-pine-glow">
                  Discover <ArrowRight className="h-3 w-3" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Editorial CTA */}
      <Reveal as="section" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8" y={36}>
        <div className="relative overflow-hidden rounded-lg border border-border/60 bg-card p-10 sm:p-16">
          <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-pine/15 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-pine-glow">The Pinewood promise</p>
            <h2 className="mt-3 font-display text-4xl text-cream sm:text-5xl">Fewer things. Made to last. Sent with care.</h2>
            <p className="mt-5 text-base text-muted-foreground">
              We're a small Bangladesh-based team obsessed with materials, makers, and the small details that turn an object into a daily companion.
            </p>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-wider text-cream underline-offset-4 hover:underline">
              Read our story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
