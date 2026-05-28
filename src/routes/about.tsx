import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { HeroTypewriter } from "@/components/site/HeroTypewriter";
import { PineGroveArt, CompassArt, LeafArt, ScissorsArt } from "@/components/site/VectorArt";
import { Sprout, Truck, Heart, Hammer, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Pinewood Emporium" },
      { name: "description", content: "Pinewood Emporium is a Bangladesh-based curator of considered goods and a home for independent makers." },
      { property: "og:title", content: "About Pinewood Emporium" },
      { property: "og:description", content: "Quiet objects for a deliberate life — from Dhaka, to all of Bangladesh." },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  { icon: Sprout, title: "Slow & considered", desc: "We pick fewer things, and we mean them. Materials and makers come first." },
  { icon: Hammer, title: "Maker-first", desc: "Independent artisans run their own shops on Pinewood — keep more, build a name." },
  { icon: Truck, title: "Bangladesh, today", desc: "Reliable shipping to every district. Worldwide one day; today, home first." },
  { icon: Heart, title: "Honest service", desc: "Easy returns, real humans on chat, and pricing that doesn't hide anything." },
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-lg border border-border/60 bg-card/40 p-8 sm:p-16">
        <CompassArt className="pointer-events-none absolute -right-12 -top-12 h-72 w-72 opacity-30 pw-float" />
        <LeafArt className="pointer-events-none absolute -bottom-10 -left-8 hidden h-56 w-56 opacity-30 md:block" />
        <div className="relative max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-pine-glow">Our story</p>
          <HeroTypewriter
            className="pw-display mt-3 text-5xl sm:text-6xl lg:text-7xl"
            segments={[
              { text: "A quiet shop, in a " },
              { text: "loud", as: "em" },
              { text: " world." },
            ]}
          />
          <p className="pw-hero-copy-rise mt-6 text-lg leading-relaxed text-foreground/85">
            Pinewood Emporium began in Dhaka with a simple idea — make it easy to find well-made
            things, and to support the people who make them.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((p, i) => (
          <Reveal key={p.title} delay={i * 80}>
            <div className="group h-full rounded-md border border-border/60 bg-card/60 p-6 transition-all hover:-translate-y-1 hover:border-pine-glow">
              <p.icon className="pw-icon h-7 w-7 text-pine-glow group-hover:rotate-[-8deg]" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-xl text-cream">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* Story split */}
      <section className="mt-20 grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-pine-glow">Made in Bangladesh</p>
            <h2 className="pw-display mt-3 text-4xl sm:text-5xl">From <em>Dhaka</em>, with care.</h2>
            <p className="mt-5 text-muted-foreground">
              We're a tiny team obsessed with materials, leatherwork, time, and the small details
              that turn an object into a daily companion. Every product is reviewed in person — if
              we wouldn't buy it for ourselves, it doesn't go up.
            </p>
            <p className="mt-4 text-muted-foreground">
              Our collaborator program invites miniature artists, leather workers, and craft
              studios across the country to set up their own shop. You build the craft — we
              handle the storefront, payments, and delivery rails.
            </p>
            <Link
              to="/collaborate"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium uppercase tracking-wider text-primary-foreground hover:bg-pine-glow"
            >
              Become a maker <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="relative overflow-hidden rounded-lg border border-border/60 bg-card/40 p-6">
            <PineGroveArt className="h-64 w-full" />
            <div className="mt-6 grid grid-cols-2 gap-4">
              <ScissorsArt className="h-24" />
              <LeafArt className="h-24" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Numbers */}
      <section className="mt-20 grid gap-6 rounded-lg border border-border/60 bg-card/40 p-8 sm:grid-cols-3 sm:p-12">
        {[
          { k: "64", label: "Districts we ship to" },
          { k: "100%", label: "Curated, never drop-shipped junk" },
          { k: "14d", label: "Returns, no questions" },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 100}>
            <div className="text-center">
              <div className="pw-display text-5xl sm:text-6xl">{s.k}</div>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
