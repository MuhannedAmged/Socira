import Link from "next/link";
import {
  IconArrowRight,
  IconCalendar,
  IconChartBar,
  IconCheck,
  IconInbox,
  IconLock,
  IconPhoto,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { PLATFORMS } from "@/config/platforms";

const FEATURES = [
  { icon: IconSparkles, title: "Composer that respects limits", text: "Per-platform character counts, media validation, and previews before you publish. No silent failures." },
  { icon: IconCalendar, title: "Honest calendar", text: "Drafts, published posts, and planned dates. Automatic scheduling only where a real execution path exists." },
  { icon: IconChartBar, title: "Real analytics only", text: "Metrics appear only when the platform and adapter actually return them — with retrieval timestamps." },
  { icon: IconInbox, title: "Community inbox", text: "Comments and replies where the SDK supports them. Unsupported inboxes say so instead of faking it." },
  { icon: IconPhoto, title: "Private media library", text: "Supabase Storage with user-scoped paths, signed URLs, and ownership checks on every operation." },
  { icon: IconLock, title: "Encrypted credentials", text: "AES-256-GCM at rest, key versioning, atomic refresh, and instant reconnection prompts on revocation." },
];

const FAQS = [
  { q: "Which platforms are supported?", a: "Instagram, Facebook, YouTube, LinkedIn, TikTok, and X — the six direct integrations in this workspace. No other platforms are in the connection flow." },
  { q: "How do account connections work?", a: "You start a connection, approve permissions on the official platform page, and the server validates state, exchanges the code, and stores only the discovered accounts. Nothing is trusted from the browser." },
  { q: "Does scheduling publish automatically?", a: "Only where a verified mechanism exists: native scheduling (YouTube where supported) or a configured hosting cron invoking a protected endpoint. Otherwise dates are shown as planned — never as fake auto-publishing." },
  { q: "Is there a paid tier?", a: "No. Socira is MIT-licensed open source with no subscriptions, paywalls, or premium gates." },
  { q: "Where does my data live?", a: "Application data in your MongoDB, media in your Supabase bucket, credentials encrypted with your key. Every query is scoped to your user." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:px-6 sm:pt-24">
          <Reveal className="flex flex-col items-start gap-6">
            <div>
              <Badge>
                <IconShieldCheck /> Open source · MIT · No paywalls
              </Badge>
            </div>
            <div>
              <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
                Every channel, one honest workspace.
              </h1>
            </div>
            <div>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                Connect six platforms, compose once, publish for real — and always know what
                actually worked, what failed, and what is not supported yet.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg">
                  Start managing <IconArrowRight />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  View live dashboard
                </Button>
              </Link>
            </div>
          </Reveal>

          {/* App preview */}
          <Reveal className="mt-12">
            <div>
              <Card className="overflow-hidden">
                <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                  <span className="size-2.5 rounded-full bg-border" aria-hidden />
                  <span className="size-2.5 rounded-full bg-border" aria-hidden />
                  <span className="size-2.5 rounded-full bg-border" aria-hidden />
                  <span className="tnum ml-3 text-xs text-muted-foreground">socira / dashboard</span>
                </div>
                <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
                  {[
                    { k: "Connected", v: "6 platforms", s: "OAuth + encrypted tokens" },
                    { k: "Published", v: "per-destination receipts", s: "No fake success states" },
                    { k: "Scheduled", v: "only when executable", s: "Native or cron, else planned" },
                  ].map((c) => (
                    <div key={c.k} className="rounded-xl bg-muted p-4">
                      <p className="text-xs font-medium text-muted-foreground">{c.k}</p>
                      <p className="mt-1 text-[15px] font-semibold">{c.v}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{c.s}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </Reveal>
        </section>

        {/* Platforms */}
        <section id="platforms" className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <Reveal className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                  Six platforms. Nothing else in the way.
                </h2>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  Each card shows verified limits and media support. Capabilities are checked
                  against the installed Social SDK — unsupported actions are disabled with an
                  explanation.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PLATFORMS.map((p) => (
                  <Card key={p.id}>
                    <CardHeader>
                      <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                        <p.icon className="size-5" aria-hidden />
                      </span>
                      <CardTitle>{p.name}</CardTitle>
                      <CardDescription>
                        {p.mediaNote} · up to {p.charLimit.toLocaleString()} chars
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Reveal className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                Built like infrastructure, designed like a product.
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <Card key={f.title}>
                  <CardHeader>
                    <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                      <f.icon className="size-5" aria-hidden />
                    </span>
                    <CardTitle>{f.title}</CardTitle>
                    <CardDescription>{f.text}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </Reveal>
        </section>

        {/* How */}
        <section id="how" className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <Reveal className="grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                  How account connections work
                </h2>
                <ol className="mt-6 flex flex-col gap-4">
                  {[
                    "You click Connect on one of the six platforms.",
                    "The server creates a one-time OAuth attempt with secure state.",
                    "You approve permissions on the official platform page.",
                    "The server validates the callback, discovers accounts, and lets you pick.",
                    "Credentials are encrypted (AES-256-GCM) and the account shows Connected.",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-6">
                      <span className="tnum flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>What you will never see here</CardTitle>
                  <CardDescription>Promises we refuse to fake.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2.5">
                  {[
                    "Simulated connections or fabricated analytics",
                    "“Scheduled” posts with no worker behind them",
                    "Success toasts for ambiguous deliveries",
                    "Cross-user data leaks — every query is ownership-scoped",
                  ].map((t) => (
                    <p key={t} className="flex items-start gap-2 text-sm">
                      <IconCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                      {t}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Reveal>
            <div>
              <Card>
                <CardHeader>
                  <Badge>Security</Badge>
                  <CardTitle className="text-xl">Credentials stay server-side. Always.</CardTitle>
                  <CardDescription>
                    OAuth secrets, encryption keys, provider tokens and cron secrets never ship
                    to the browser. Rate limits guard auth endpoints, callbacks are single-use
                    with replay protection, and audit logs record sensitive events without
                    secrets. See docs/SECURITY.md.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </Reveal>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-border bg-card">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight">FAQ</h2>
            <div className="mt-6 flex flex-col gap-3">
              {FAQS.map((f) => (
                <Card key={f.q}>
                  <CardHeader>
                    <CardTitle>{f.q}</CardTitle>
                    <CardDescription>{f.a}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
