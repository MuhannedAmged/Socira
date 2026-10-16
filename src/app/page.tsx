import Link from "next/link";
import {
  IconArrowRight,
  IconCalendar,
  IconChartBar,
  IconCheck,
  IconChevronDown,
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
  {
    icon: IconSparkles,
    title: "A composer that respects limits",
    text: "Per-destination character counts, media validation, and previews before anything leaves your workspace. Multi-platform posts must fit every destination — or they don't send.",
    wide: true,
  },
  {
    icon: IconCalendar,
    title: "An honest calendar",
    text: "Drafts, published posts, and planned dates. Automatic scheduling only where a real execution path exists.",
    wide: false,
  },
  {
    icon: IconChartBar,
    title: "Real analytics only",
    text: "Metrics appear only when the platform actually returns them — with retrieval timestamps, never invented history.",
    wide: false,
  },
  {
    icon: IconInbox,
    title: "Community inbox",
    text: "Comments and replies where the adapter implements them. Unsupported inboxes say so instead of faking threads.",
    wide: false,
  },
  {
    icon: IconPhoto,
    title: "Private media library",
    text: "Supabase Storage with user-scoped paths, signed URLs, and ownership checks on every operation.",
    wide: false,
  },
  {
    icon: IconLock,
    title: "Encrypted credentials",
    text: "AES-256-GCM at rest with key versioning and atomic refresh. Revoked grant? You get a reconnect prompt, not a silent failure.",
    wide: true,
  },
];

const FAQS = [
  {
    q: "Which platforms are supported?",
    a: "Instagram, Facebook, YouTube, LinkedIn, TikTok, and X — the six direct integrations in this workspace. No other platforms are in the connection flow.",
  },
  {
    q: "How do account connections work?",
    a: "You start a connection, approve permissions on the official platform page, and the server validates state, exchanges the code, and stores only the discovered accounts. Nothing is trusted from the browser.",
  },
  {
    q: "Does scheduling publish automatically?",
    a: "Only where a verified mechanism exists: native scheduling (YouTube where supported) or a configured hosting cron invoking a protected endpoint. Otherwise dates are shown as planned — never as fake auto-publishing.",
  },
  {
    q: "Is there a paid tier?",
    a: "No. Socira is MIT-licensed open source with no subscriptions, paywalls, or premium gates.",
  },
  {
    q: "Where does my data live?",
    a: "Application data in your MongoDB, media in your Supabase bucket, credentials encrypted with your key. Every query is scoped to your user.",
  },
];

const STEPS = [
  { title: "Connect", text: "Pick one of six platforms and approve permissions on its official page." },
  { title: "Create", text: "Compose once with per-destination validation and live character counts." },
  { title: "Publish", text: "Send for real and get a receipt per destination — success, failure, or ambiguous." },
  { title: "Measure", text: "See only metrics the platform returned, with when they were retrieved." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        {/* ——— Hero ——— */}
        <section className="relative mx-auto max-w-6xl px-4 pt-20 pb-14 text-center sm:px-6 sm:pt-28">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 h-72 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl" />
            <div className="absolute top-40 left-1/4 hidden h-56 w-56 rounded-full bg-primary/[0.05] blur-3xl sm:block" />
            <div className="absolute top-40 right-1/4 hidden h-56 w-56 rounded-full bg-primary/[0.05] blur-3xl sm:block" />
          </div>
          <Reveal className="flex flex-col items-center gap-6">
            <div>
              <Badge>
                <IconShieldCheck /> Open source · MIT · No paywalls
              </Badge>
            </div>
            <div>
              <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight text-balance sm:text-7xl">
                Every channel.
                <br />
                One honest workspace.
              </h1>
            </div>
            <div>
              <p className="mx-auto max-w-xl text-lg leading-8 text-muted-foreground">
                Connect six platforms, compose once, publish for real — and always know what
                actually worked, what failed, and what isn&apos;t supported yet.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
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
            <div>
              <p className="tnum text-xs text-muted-foreground">
                6 platforms · Per-destination receipts · Zero fabricated metrics
              </p>
            </div>
          </Reveal>

          {/* ——— Product preview ——— */}
          <Reveal className="mt-14">
            <div className="relative mx-auto max-w-4xl">
              <div aria-hidden className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/[0.05] blur-2xl" />
              <Card className="overflow-hidden text-left">
                <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                  <span className="size-2.5 rounded-full bg-border" aria-hidden />
                  <span className="size-2.5 rounded-full bg-border" aria-hidden />
                  <span className="size-2.5 rounded-full bg-border" aria-hidden />
                  <span className="tnum ml-3 text-xs text-muted-foreground">socira / dashboard</span>
                  <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground sm:flex">
                    <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                    6 connected
                  </span>
                </div>
                <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
                  {[
                    { k: "Scheduled", v: "Tue 09:00 UTC", s: "YouTube · native", tone: "success" },
                    { k: "Published", v: "3 destinations", s: "2 ok · 1 reconciling", tone: "default" },
                    { k: "Planned", v: "Fri 14:30", s: "Awaiting scheduler config", tone: "warning" },
                  ].map((c) => (
                    <div key={c.k} className="rounded-xl bg-muted p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">{c.k}</p>
                        <Badge
                          variant={c.tone === "success" ? "success" : c.tone === "warning" ? "warning" : "secondary"}
                        >
                          {c.tone === "success" ? "auto" : c.tone === "warning" ? "planned" : "live"}
                        </Badge>
                      </div>
                      <p className="tnum mt-1.5 text-[15px] font-semibold">{c.v}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{c.s}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </Reveal>
        </section>

        {/* ——— Platforms ——— */}
        <section id="platforms" className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <Reveal className="flex flex-col gap-8">
              <div className="mx-auto max-w-2xl text-center">
                <Badge>Platforms</Badge>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                  Six platforms. Nothing else in the way.
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Verified limits and media support per destination. Unsupported actions are
                  disabled with an explanation — never a surprise at publish time.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                {PLATFORMS.map((p) => (
                  <Card key={p.id} className="pressable transition-colors hover:bg-accent">
                    <CardHeader className="items-center text-center">
                      <span className="flex size-11 items-center justify-center rounded-2xl bg-muted">
                        <p.icon className="size-5" aria-hidden />
                      </span>
                      <CardTitle className="text-sm">{p.name}</CardTitle>
                      <CardDescription className="tnum text-xs">
                        ≤ {p.charLimit.toLocaleString()} chars
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ——— How it works ——— */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal className="flex flex-col gap-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge>How it works</Badge>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                From connection to receipt in four steps
              </h2>
            </div>
            <div>
              <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {STEPS.map((step, i) => (
                  <li key={step.title}>
                    <Card className="h-full">
                      <CardHeader>
                        <span className="tnum flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {i + 1}
                        </span>
                        <CardTitle>{step.title}</CardTitle>
                        <CardDescription>{step.text}</CardDescription>
                      </CardHeader>
                    </Card>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </section>

        {/* ——— Features bento ——— */}
        <section id="features" className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <Reveal className="flex flex-col gap-8">
              <div className="mx-auto max-w-2xl text-center">
                <Badge>Features</Badge>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                  Built like infrastructure, designed like a product
                </h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {FEATURES.map((f) => (
                  <Card key={f.title} className={f.wide ? "md:col-span-2" : ""}>
                    <CardHeader className={f.wide ? "sm:flex-row sm:items-start sm:gap-4" : ""}>
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <f.icon className="size-5" aria-hidden />
                      </span>
                      <span>
                        <CardTitle>{f.title}</CardTitle>
                        <CardDescription className="mt-1">{f.text}</CardDescription>
                      </span>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ——— Honesty + security ——— */}
        <section id="security" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal className="grid gap-3 lg:grid-cols-2">
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl">What you will never see here</CardTitle>
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
            </div>
            <div>
              <Card className="h-full">
                <CardHeader>
                  <Badge>Security</Badge>
                  <CardTitle className="mt-2 text-xl">Credentials stay server-side. Always.</CardTitle>
                  <CardDescription>
                    OAuth secrets, encryption keys, provider tokens, and cron secrets never ship
                    to the browser. Rate limits guard auth endpoints, callbacks are single-use
                    with replay protection, and audit logs record sensitive events without
                    secrets. Full model in docs/SECURITY.md.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/docs">
                    <Button variant="outline">
                      Read the docs <IconArrowRight />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </Reveal>
        </section>

        {/* ——— FAQ ——— */}
        <section id="faq" className="border-t border-border bg-card">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <div className="text-center">
              <Badge>FAQ</Badge>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Questions, answered</h2>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-border bg-background px-5 py-4 transition-colors open:bg-accent/40"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <IconChevronDown
                      className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>

            {/* ——— Final CTA ——— */}
            <Card className="mt-10 overflow-hidden">
              <CardContent className="relative flex flex-col items-center gap-4 px-6 py-10 text-center">
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
                  <div className="absolute -top-20 left-1/2 h-48 w-[30rem] max-w-full -translate-x-1/2 rounded-full bg-primary/[0.08] blur-3xl" />
                </div>
                <h3 className="relative text-2xl font-bold tracking-tight text-balance">
                  Your channels, under your control.
                </h3>
                <p className="relative max-w-md text-sm leading-6 text-muted-foreground">
                  Free forever, open source, and honest about what works. Set up your workspace
                  in minutes.
                </p>
                <Link href="/register" className="relative">
                  <Button size="lg">
                    Get started <IconArrowRight />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
