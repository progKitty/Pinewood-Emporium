import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Camera, Wallet, Users } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { HeroTypewriter } from "@/components/site/HeroTypewriter";

export const Route = createFileRoute("/collaborate")({
  head: () => ({
    meta: [
      { title: "Collaborate — Pinewood Emporium" },
      {
        name: "description",
        content:
          "Pinewood Emporium partners with Bangladeshi solo creators, makers, and miniaturists. Sell your work alongside our curated catalogue.",
      },
      { property: "og:title", content: "Collaborate with Pinewood Emporium" },
      { property: "og:description", content: "A home for solo makers, miniaturists, and crafters." },
    ],
  }),
  component: CollaboratePage,
});

const perks = [
  { icon: Sparkles, title: "Your craft, our stage", desc: "Featured placement alongside Pinewood's editorial catalogue." },
  { icon: Camera, title: "Photo + short video", desc: "Tell the story behind each piece with images and a 30-second clip." },
  { icon: Wallet, title: "You set the price", desc: "Keep control of pricing and stock from your own dashboard." },
  { icon: Users, title: "Built-in audience", desc: "Reach customers who already love hand-made, considered objects." },
];

function CollaboratePage() {
  return (
    <main>
      {/* Hero */}
      <section className="pw-collab-hero relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="pw-blob-a pw-collab-glow-a absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full blur-[120px]" />
          <div className="pw-blob-b pw-collab-glow-b absolute right-[-10%] top-1/3 h-[32rem] w-[32rem] rounded-full blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-28 sm:px-6 lg:px-8">
          <span className="pw-rise pw-rise-1 pw-collab-eyebrow mb-6 inline-block rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.25em]">
            For makers, miniaturists & crafters
          </span>
          <HeroTypewriter
            className="pw-collab-title font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl"
            segments={[
              { text: "Sell your hand-made " },
              { text: "things", as: "em", className: "pw-collab-title-accent not-italic" },
              { text: " with us." },
            ]}
          />
          <p className="pw-hero-copy-rise pw-collab-copy mt-6 max-w-2xl text-lg">
            Pinewood Emporium partners with Bangladeshi solo creators who make
            crafty materials, miniatures, and small-batch goods. We help you
            reach customers who actually care.
          </p>
          <div className="pw-hero-action-rise mt-10 flex flex-wrap gap-3">
            <Link
              to="/creator"
              className="pw-collab-primary-cta group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium uppercase tracking-wider shadow-elegant transition-all"
            >
              Become a creator
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how"
              className="pw-collab-secondary-cta inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-medium uppercase tracking-wider backdrop-blur transition-colors"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Perks */}
      <Reveal as="section" className="border-y border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-7xl gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="flex flex-col gap-3 bg-background p-8">
              <p.icon className="h-6 w-6 text-pine-glow" strokeWidth={1.5} />
              <h3 className="font-display text-xl text-cream">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* How it works */}
      <Reveal as="section" id="how" className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8" y={36}>
        <p className="text-xs uppercase tracking-[0.25em] text-pine-glow">How it works</p>
        <h2 className="mt-2 font-display text-4xl text-cream sm:text-5xl">
          From your workbench to a customer's doorstep.
        </h2>

        <ol className="mt-12 space-y-10">
          {[
            ["01", "Apply", "Sign up and tell us a little about your craft — name, bio, where you make from."],
            ["02", "List your pieces", "Upload photos and a short video, set price and stock from your creator dashboard."],
            ["03", "We promote & ship", "Your pieces appear in the shop. We handle storefront, payments, and fulfilment support."],
          ].map(([n, t, d]) => (
            <li key={n} className="grid gap-3 border-t border-border/60 pt-8 sm:grid-cols-[auto_1fr] sm:gap-10">
              <div className="font-display text-5xl text-pine-glow">{n}</div>
              <div>
                <h3 className="font-display text-2xl text-cream">{t}</h3>
                <p className="mt-2 text-muted-foreground">{d}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/60 bg-card/40 p-8">
          <div>
            <h3 className="font-display text-2xl text-cream">Ready to start?</h3>
            <p className="mt-1 text-sm text-muted-foreground">It takes about two minutes.</p>
          </div>
          <Link
            to="/creator"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium uppercase tracking-wider text-primary-foreground hover:bg-pine-glow"
          >
            Open your dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
