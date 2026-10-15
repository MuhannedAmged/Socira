import Link from "next/link";
import { IconArrowUpRight, IconPhoto, IconPlus, IconUsers } from "@tabler/icons-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, Stat } from "@/components/ui/empty-state";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Good morning"
        subtitle="Genuine data from your workspace. New accounts start empty — no fabricated activity."
        action={
          <Link href="/compose">
            <Button><IconPlus /> New post</Button>
          </Link>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="pt-5"><Stat label="Connected accounts" value="0" hint="Connect to begin" /></CardContent></Card>
        <Card><CardContent className="pt-5"><Stat label="Drafts" value="0" hint="Nothing in progress" /></CardContent></Card>
        <Card><CardContent className="pt-5"><Stat label="Published" value="0" hint="Last 30 days" /></CardContent></Card>
        <Card><CardContent className="pt-5"><Stat label="Failures" value="0" hint="No errors recorded" /></CardContent></Card>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Get set up in 3 steps</CardTitle>
            <CardDescription>Connect, create, publish — each step is real.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[
              { icon: IconUsers, t: "Connect a social account", d: "OAuth on the official platform page, encrypted storage.", href: "/accounts" },
              { icon: IconPhoto, t: "Upload brand media", d: "Private Supabase bucket, signed URLs, ownership checks.", href: "/media" },
              { icon: IconPlus, t: "Compose your first post", d: "Per-platform validation with honest capability checks.", href: "/compose" },
            ].map((s) => (
              <Link key={s.t} href={s.href} className="pressable flex items-center gap-3 rounded-xl bg-muted p-3 transition-colors hover:bg-accent">
                <s.icon className="size-5 shrink-0" aria-hidden />
                <span>
                  <span className="block text-sm font-semibold">{s.t}</span>
                  <span className="block text-xs text-muted-foreground">{s.d}</span>
                </span>
                <IconArrowUpRight className="ml-auto size-4 text-muted-foreground" aria-hidden />
              </Link>
            ))}
          </CardContent>
        </Card>
        <EmptyState
          title="No recent activity yet"
          description="Publish results, failures, and notifications will appear here once you connect accounts and create content."
          action={<Link href="/accounts"><Button variant="outline">Connect accounts</Button></Link>}
        />
      </div>
    </DashboardShell>
  );
}
