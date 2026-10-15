import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Content calendar"
        subtitle="Month, week, and day views with honest status: automatic only where executable, otherwise planned."
      />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>October 2026</CardTitle>
            <Badge variant="muted">UTC display · your timezone preserved per post</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5">
            {DAYS.map((d) => (
              <p key={d} className="pb-1 text-center text-xs font-semibold text-muted-foreground">{d}</p>
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="min-h-20 rounded-xl border border-border bg-background p-2">
                <span className="tnum text-xs text-muted-foreground">{((i + 2) % 31) + 1}</span>
                {i === 12 ? <Badge variant="secondary" className="mt-1">Planned · needs scheduler</Badge> : null}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Reschedule and cancel act only on mechanisms that genuinely support them.
          </p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
