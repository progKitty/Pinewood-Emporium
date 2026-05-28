import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { HeroTypewriter } from "@/components/site/HeroTypewriter";
import { EnvelopeArt, CompassArt } from "@/components/site/VectorArt";
import { Mail, Phone, MapPin, Send, Instagram } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Pinewood Emporium" },
      { name: "description", content: "Reach Pinewood Emporium for orders, partnerships, or maker applications." },
      { property: "og:title", content: "Contact Pinewood Emporium" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSending(true);
    // Fire-and-forget mailto so users can send without a backend mailer.
    const subject = encodeURIComponent(`Pinewood enquiry — ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} <${form.email}>`);
    window.location.href = `mailto:hello@pinewood.shop?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setSending(false);
      toast.success("Opening your mail app…");
    }, 400);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-lg border border-border/60 bg-card/40 p-8 sm:p-14">
        <EnvelopeArt className="pointer-events-none absolute -right-8 -top-8 h-48 w-auto opacity-40 pw-float" />
        <CompassArt className="pointer-events-none absolute -bottom-16 -left-16 hidden h-64 w-64 opacity-20 md:block" />
        <div className="relative max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-pine-glow">Say hello</p>
          <HeroTypewriter
            className="pw-display mt-3 text-5xl sm:text-6xl"
            segments={[
              { text: "Let's " },
              { text: "talk", as: "em" },
              { text: "." },
            ]}
          />
          <p className="pw-hero-copy-rise mt-5 text-muted-foreground">
            Questions about an order, a partnership, or applying as a creator — we read every note.
          </p>
        </div>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Channels */}
        <Reveal>
          <div className="space-y-4">
            <ChannelCard icon={<Mail className="pw-icon h-5 w-5 text-pine-glow" />} label="Email" value="hello@pinewood.shop" href="mailto:hello@pinewood.shop" />
            <ChannelCard icon={<Phone className="pw-icon h-5 w-5 text-pine-glow" />} label="WhatsApp" value="+880 1700 000000" href="https://wa.me/8801700000000" />
            <ChannelCard icon={<Instagram className="pw-icon h-5 w-5 text-pine-glow" />} label="Instagram" value="@pinewood.emporium" href="https://instagram.com/" />
            <ChannelCard icon={<MapPin className="pw-icon h-5 w-5 text-pine-glow" />} label="Studio" value="Gulshan-2, Dhaka, Bangladesh" />
          </div>
        </Reveal>

        {/* Form */}
        <Reveal delay={120}>
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-border/60 bg-card/40 p-6 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Your name">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  placeholder="Riya Ahmed"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls}
                  placeholder="you@example.com"
                />
              </Field>
            </div>
            <Field label="Message" className="mt-5">
              <textarea
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={inputCls}
                placeholder="How can we help?"
              />
            </Field>
            <button
              type="submit"
              disabled={sending}
              className="pw-pop mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium uppercase tracking-wider text-primary-foreground hover:bg-pine-glow disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending…" : "Send message"}
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  );
}

function ChannelCard({
  icon, label, value, href,
}: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const inner = (
    <div className="pw-icon-hover group flex items-center gap-4 rounded-md border border-border/60 bg-card/60 p-5 transition-all hover:-translate-y-0.5 hover:border-pine-glow">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate font-display text-lg text-cream">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer noopener">{inner}</a> : inner;
}

const inputCls =
  "w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-cream placeholder:text-muted-foreground focus:border-pine-glow focus:outline-none";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
