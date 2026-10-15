import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DOCS = [
  { href: "/docs", title: "Architecture", desc: "docs/ARCHITECTURE.md — modules and tenant isolation." },
  { href: "/docs", title: "Platform capabilities", desc: "docs/PLATFORM-CAPABILITIES.md — honest support matrix." },
  { href: "/docs", title: "Social SDK implementation", desc: "docs/SOCIAL-SDK-IMPLEMENTATION.md — OAuth and publishing." },
  { href: "/docs", title: "Security", desc: "docs/SECURITY.md — encryption, OAuth, storage." },
  { href: "/docs", title: "Scheduling", desc: "docs/SCHEDULING.md — native vs cron vs planned." },
  { href: "/docs", title: "Deployment", desc: "docs/DEPLOYMENT.md — production checklist." },
];

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Full guides live in the repository docs folder. Start here for setup, OAuth, capabilities, security, and deployment.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DOCS.map((d) => (
            <Link key={d.title} href="https://github.com/MuhannedAmged/Socira">
              <Card className="pressable h-full">
                <CardHeader>
                  <CardTitle>{d.title}</CardTitle>
                  <CardDescription>{d.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
