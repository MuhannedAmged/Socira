import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconBell } from "@tabler/icons-react";

export default function NotificationsPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Notifications"
        subtitle="Persistent, user-scoped events for real outcomes only."
        action={<Button variant="outline">Mark all as read</Button>}
      />
      <EmptyState
        icon={<IconBell />}
        title="You are all caught up"
        description="Publication results, auth expirations, and upload completions will notify you here."
      />
    </DashboardShell>
  );
}
