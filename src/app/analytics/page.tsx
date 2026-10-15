import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Analytics"
        subtitle="Only metrics the API actually returns — with retrieval timestamps and supported ranges."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {["Instagram", "Facebook", "YouTube", "LinkedIn", "TikTok", "X"].map((n) => (
          <Card key={n}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{n}</CardTitle>
                <Badge variant="muted">No data — connect first</Badge>
              </div>
              <CardDescription>
                Metrics appear after you connect {n} with analytics scopes. Unsupported metrics link to docs/PLATFORM-CAPABILITIES.md.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="tnum grid grid-cols-3 gap-2 text-center">
                {["Views", "Likes", "Comments"].map((m) => (
                  <div key={m} className="rounded-xl bg-muted p-3">
                    <p className="text-xs text-muted-foreground">{m}</p>
                    <p className="text-lg font-semibold">—</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
