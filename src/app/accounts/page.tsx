import { IconPlugConnected } from "@tabler/icons-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLATFORMS } from "@/config/platforms";

export default function AccountsPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Connected accounts"
        subtitle="Six supported platforms. Connections use server-side OAuth with secure state and encrypted credential storage."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                  <p.icon className="size-5" aria-hidden />
                </span>
                <Badge variant="muted">Not connected</Badge>
              </div>
              <CardTitle>{p.name}</CardTitle>
              <CardDescription>
                {p.handleHint} · {p.mediaNote}. Limits verified against the installed Social SDK.
              </CardDescription>
              <form action={`/api/social/connect`} method="get">
                <input type="hidden" name="platform" value={p.id} />
                <Button type="submit" variant="outline" className="mt-1 w-full">
                  <IconPlugConnected /> Connect {p.name}
                </Button>
              </form>
            </CardHeader>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        OAuth requires developer credentials (see .env.example) and a registered callback URL.
        Without configuration, connections show exactly what is missing instead of failing silently.
      </p>
    </DashboardShell>
  );
}
